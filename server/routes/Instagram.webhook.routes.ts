import type { Express } from "express";
import { eq, or, and } from "drizzle-orm";
import { db } from "../db";
import {
  instagramAccounts,
  instagramAppConfig,
  channels,
  contacts,
  conversations,
  messages,
} from "@shared/schema";

import { instagramAutomationService } from "../services/instagram-automation.service";

const GRAPH_API_VERSION = "v24.0";
const IG_GRAPH_BASE = `https://graph.instagram.com/${GRAPH_API_VERSION}`;

async function getInstagramAppConfig() {
  const [config] = await db
    .select()
    .from(instagramAppConfig)
    .where(eq(instagramAppConfig.isActive, true));
  return config;
}


async function getInstagramUserProfile(igsid: string, accessToken: string) {
  try {
    const res = await fetch(
      `${IG_GRAPH_BASE}/${igsid}?fields=name,username&access_token=${accessToken}`
    );
    const json = await res.json();
    if (json.error) {
      console.log("⚠️ [getInstagramUserProfile] Graph API error:", json.error);
      return null;
    }
    return json; // { id, name?, username? }
  } catch (err) {
    console.log("⚠️ [getInstagramUserProfile] fetch failed:", err);
    return null;
  }
}

async function findInstagramAccountByIgId(igBusinessId: string) {
  console.log("🔍 [findInstagramAccountByIgId] Looking up account for IG ID:", igBusinessId);
  const [account] = await db
    .select()
    .from(instagramAccounts)
    .where(
      or(
        eq(instagramAccounts.instagramUserId, igBusinessId),
        eq(instagramAccounts.instagramBusinessId, igBusinessId)
      )
    );
  console.log("🔍 [findInstagramAccountByIgId] Result:", account ? `FOUND (id=${account.id}, username=${account.username})` : "NOT FOUND");
  return account;
}

async function ensureChannelForInstagramAccount(account: typeof instagramAccounts.$inferSelect) {
  console.log("📡 [ensureChannelForInstagramAccount] account.channelId:", account.channelId);

  if (account.channelId) {
    const [existingChannel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, account.channelId));
    if (existingChannel) {
      console.log("📡 [ensureChannelForInstagramAccount] Using existing channel:", existingChannel.id);
      return existingChannel;
    }
    console.log("📡 [ensureChannelForInstagramAccount] channelId set but channel row missing, creating new one");
  }

  const [newChannel] = await db
    .insert(channels)
    .values({
      name: `Instagram - @${account.username}`,
      phoneNumberId: account.instagramUserId || account.instagramBusinessId,
      accessToken: account.accessToken,
      isActive: true,
      healthStatus: "healthy",
    })
    .returning();

  console.log("📡 [ensureChannelForInstagramAccount] Created new channel:", newChannel.id);

  await db
    .update(instagramAccounts)
    .set({ channelId: newChannel.id, updatedAt: new Date() })
    .where(eq(instagramAccounts.id, account.id));

  return newChannel;
}



async function findOrCreateContact(
  channelId: string,
  senderIgsid: string,
  accessToken: string
) {
  console.log("👤 [findOrCreateContact] channelId:", channelId, "senderIgsid:", senderIgsid);

  const [existing] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.channelId, channelId), eq(contacts.phone, senderIgsid)));

  if (existing) {
    console.log("👤 [findOrCreateContact] Found existing contact:", existing.id);

    // If we only have the generic placeholder name (couldn't resolve a
    // username when this contact was first created — usually because the
    // sender didn't follow the business account at the time), try again on
    // every subsequent message. If they've since followed / unblocked
    // access, this upgrades the placeholder to their real username.
    const isPlaceholderName = existing.name?.startsWith("Instagram User ");

    if (isPlaceholderName) {
      console.log("👤 [findOrCreateContact] Existing contact has placeholder name, retrying profile fetch");

      const profile = await getInstagramUserProfile(senderIgsid, accessToken);
      const resolvedName = profile?.username || profile?.name;

      if (resolvedName && resolvedName !== existing.name) {
        console.log(
          `👤 [findOrCreateContact] Upgraded placeholder name → "${resolvedName}" for contact ${existing.id}`
        );

        const [updated] = await db
          .update(contacts)
          .set({ name: resolvedName, updatedAt: new Date() })
          .where(eq(contacts.id, existing.id))
          .returning();

        return updated;
      }

      console.log("👤 [findOrCreateContact] Still couldn't resolve a real username, keeping placeholder");
    }

    return existing;
  }

  console.log("👤 [findOrCreateContact] No existing contact, resolving IG profile before creating");

  const profile = await getInstagramUserProfile(senderIgsid, accessToken);
  const resolvedName =
    profile?.username || profile?.name || `Instagram User ${senderIgsid.slice(-6)}`;

  console.log("👤 [findOrCreateContact] Resolved name:", resolvedName);

  const [created] = await db
    .insert(contacts)
    .values({
      channelId,
      phone: senderIgsid,
      name: resolvedName,
      source: "instagram",
    })
    .returning();

  console.log("👤 [findOrCreateContact] Created contact:", created.id);

  return created;
}

async function findOrCreateConversation(channelId: string, contactId: string, senderIgsid: string, contactName?: string) {
  console.log("💬 [findOrCreateConversation] channelId:", channelId, "contactId:", contactId);

  const [existing] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.channelId, channelId), eq(conversations.contactId, contactId)));


    if (existing) {
  if (contactName && existing.contactName !== contactName) {
    const [updated] = await db
      .update(conversations)
      .set({
        contactName,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, existing.id))
      .returning();

    return { conversation: updated, isNew: false };
  }

  return { conversation: existing, isNew: false };
}
  if (existing) {
    console.log("💬 [findOrCreateConversation] Found existing conversation:", existing.id);
    return { conversation: existing, isNew: false };
  }

  console.log("💬 [findOrCreateConversation] No existing conversation, creating new one");

  const [created] = await db
    .insert(conversations)
    .values({
      channelId,
      contactId,
      contactPhone: senderIgsid,
      contactName: contactName || `Instagram User ${senderIgsid.slice(-6)}`,
      type: "instagram",
      status: "open",
    })
    .returning();

  console.log("💬 [findOrCreateConversation] Created conversation:", created.id);

  return { conversation: created, isNew: true };
}

function mapAttachmentToMessage(attachment: any) {
  const type =
    attachment?.type === "image" || attachment?.type === "video" || attachment?.type === "audio"
      ? attachment.type
      : "document";
  return {
    type,
    mediaUrl: attachment?.payload?.url as string | undefined,
  };
}

export function registerInstagramWebhookRoutes(app: Express) {
  // NOTE: global.io tumhare socket setup ke baad set hota hai — isko yaha
  // top-level pe capture karne ke bajaye request ke andar padho, taaki agar
  // socket server registerInstagramWebhookRoutes() ke baad init hua ho tab
  // bhi io undefined na rahe.

  // GET /api/webhooks/instagram - Meta Verification Handshake
  app.get("/api/webhooks/instagram", async (req: any, res) => {
    try {
      console.log("🟡 [GET /webhooks/instagram] Verification hit. Query:", req.query);

      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];

      const config = await getInstagramAppConfig();
      console.log("🟡 [GET /webhooks/instagram] Config found?", !!config, "expected token:", config?.webhookVerifyToken, "received token:", token);

      if (mode === "subscribe" && config?.webhookVerifyToken && token === config.webhookVerifyToken) {
        console.log("✅ INSTAGRAM WEBHOOK VERIFIED");
        return res.status(200).send(challenge);
      }

      console.log("❌ INSTAGRAM WEBHOOK VERIFICATION FAILED", { mode, token });
      return res.sendStatus(403);
    } catch (error: any) {
      console.log("❌ INSTAGRAM WEBHOOK VERIFY ERROR:", error);
      return res.sendStatus(500);
    }
  });










app.post("/api/webhooks/instagram", async (req: any, res) => {
  console.log("🟢 [POST /webhooks/instagram] HIT — raw body:", JSON.stringify(req.body));
  res.sendStatus(200);

  try {
    const io = (global as any).io;
    console.log("🟢 [POST /webhooks/instagram] io available?", !!io);

    const body = req.body;

    if (!body) {
      console.log("⚠️ [POST /webhooks/instagram] No body received");
      return;
    }

    if (body.object !== "instagram") {
      console.log("⚠️ [POST /webhooks/instagram] Ignored — body.object is:", body.object);
      return;
    }

    if (!Array.isArray(body.entry)) {
      console.log("⚠️ [POST /webhooks/instagram] Ignored — body.entry is not an array:", body.entry);
      return;
    }

    console.log(`🟢 [POST /webhooks/instagram] entry count: ${body.entry.length}`);

    for (const entry of body.entry) {
      const igBusinessId = entry.id;
      const messagingEvents = entry.messaging || [];
      const changes = entry.changes || [];

      console.log(
        `🟢 [entry] igBusinessId=${igBusinessId} messagingEvents.length=${messagingEvents.length} changes.length=${changes.length}`
      );

      if (messagingEvents.length === 0 && changes.length === 0) {
        console.log("⚠️ [entry] No messaging or change events in this entry, skipping. Full entry:", JSON.stringify(entry));
        continue;
      }

      // Resolved once per entry — used by both the DM branch and the
      // comment branch below (previously this only ran inside the
      // messaging branch, so comment-only entries never found the account).
      const account = await findInstagramAccountByIgId(igBusinessId);
      if (!account) {
        console.log("❌ NO INSTAGRAM ACCOUNT FOUND FOR IG ID:", igBusinessId);
        continue;
      }

      // ── Existing DM handling — unchanged ──────────────────────────────
      for (const event of messagingEvents) {
        console.log("🟢 [event] raw:", JSON.stringify(event));

        if (!event.message) {
          console.log("⚠️ [event] No 'message' key present (could be read receipt / reaction / postback), skipping");
          continue;
        }

        const messagePayload: any = event.message;
        const isEcho = Boolean(messagePayload.is_echo);

        console.log("🟢 [event] isEcho:", isEcho, "sender:", event.sender?.id, "recipient:", event.recipient?.id);

        if (isEcho) {
  console.log(
    "⚠️ [Instagram Webhook] Echo message received — already saved by send-message API, skipping DB insert"
  );
  continue;
}

        const customerIgsid: string | undefined = isEcho
          ? event.recipient?.id
          : event.sender?.id;

        if (!customerIgsid) {
          console.log("❌ [event] customerIgsid could not be resolved, skipping");
          continue;
        }

        try {
          const channel = await ensureChannelForInstagramAccount(account);
          const contact = await findOrCreateContact(channel.id, customerIgsid, account.accessToken);
          const { conversation, isNew } = await findOrCreateConversation(
            channel.id,
            contact.id,
            customerIgsid,
            contact.name
          );

          const text = messagePayload.text as string | undefined;
          const attachments = messagePayload.attachments || [];
          const firstAttachment = attachments[0];
          const mapped = firstAttachment ? mapAttachmentToMessage(firstAttachment) : null;

          const content = text || (mapped ? `[${mapped.type}]` : "[Message]");
          const messageTimestamp = event.timestamp ? new Date(Number(event.timestamp)) : new Date();

          console.log("📝 [message] content:", content, "type:", mapped?.type || "text", "timestamp:", messageTimestamp);

          const [savedMessage] = await db
            .insert(messages)
            .values({
              conversationId: conversation.id,
              whatsappMessageId: messagePayload.mid,
              content,
              type: mapped?.type || "text",
              fromType: isEcho ? "agent" : "user",
              direction: isEcho ? "outbound" : "inbound",
              mediaUrl: mapped?.mediaUrl,
              status: isEcho ? "sent" : "received",
              timestamp: messageTimestamp,
            })
            .returning();

          console.log("✅ [message] Inserted into DB, id:", savedMessage.id);

          const updateData: any = {
            lastMessageAt: messageTimestamp,
            lastMessageText: content,
            updatedAt: new Date(),
          };

          if (!isEcho) {
            updateData.lastIncomingMessageAt = messageTimestamp;
            updateData.unreadCount = (conversation.unreadCount || 0) + 1;
          }

          await db
            .update(conversations)
            .set(updateData)
            .where(eq(conversations.id, conversation.id));

          console.log(
            `✅ INSTAGRAM ${isEcho ? "OUTBOUND (ECHO)" : "INBOUND"} MESSAGE SAVED:`,
            savedMessage.id,
            "conversation:",
            conversation.id
          );

          if (io) {
            const room = `channel:${channel.id}`;
            const payload = {
              conversationId: conversation.id,
              message: savedMessage,
              content,
              createdAt: messageTimestamp.getTime(),
            };

            if (isNew) {
              const createdPayload = {
                conversation: {
                  ...conversation,
                  lastMessageText: content,
                  lastMessageAt: messageTimestamp,
                },
              };
              io.to(room).emit("conversation_created", createdPayload);
              io.emit("conversation_created", createdPayload);
              console.log("📡 [socket] emitted conversation_created for room:", room);
            }

            io.to(room).emit("new-message", payload);
            io.emit("new-message", payload);
            console.log("📡 [socket] emitted new-message for room:", room);
          } else {
            console.log("⚠️ [socket] io not available, skipped socket emit");
          }
        } catch (innerError: any) {
          console.log("❌ [event processing] ERROR while saving message:", innerError);
        }
      }

      // ── NEW: comment events → Instagram Automation ────────────────────
      for (const change of changes) {
        if (change.field !== "comments") {
          console.log("⚠️ [change] Ignored — unsupported field:", change.field);
          continue;
        }

        const value = change.value || {};
        const commentId: string | undefined = value.id;
        const commentText: string = value.text || "";
        const fromId: string | undefined = value.from?.id;
        const username: string | undefined = value.from?.username;

        console.log("💬 [comment] id:", commentId, "from:", fromId, "text:", commentText);

        if (!commentId || !fromId) {
          console.log("❌ [comment] Missing commentId or fromId, skipping");
          continue;
        }

        // Ignore comments made by the business account itself (e.g. its own
        // reply posted by an automation) to avoid a reply-triggers-reply loop.
        const ownIgId = account.instagramUserId || account.instagramBusinessId;
        if (fromId === ownIgId) {
          console.log("⚠️ [comment] Skipping — comment author is the business account itself");
          continue;
        }

        try {
          await instagramAutomationService.processComment({
            commentId,
            commentText,
            instagramUserId: fromId,
            username,
            accountId: account.id,
          });
          console.log("✅ [comment] Passed to InstagramAutomationService.processComment");
        } catch (automationError: any) {
          console.log("❌ [comment] InstagramAutomationService error:", automationError);
        }
      }
    }
  } catch (error: any) {
    console.log("❌ INSTAGRAM WEBHOOK PROCESSING ERROR:", error);
  }
});
}