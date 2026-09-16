
/**
 * ============================================================
 * © 2025 Diploy — a brand of Bisht Technologies Private Limited
 * Original Author: BTPL Engineering Team
 * Website: https://diploy.in
 * Contact: cs@diploy.in
 *
 * Distributed under the Envato / CodeCanyon License Agreement.
 * Licensed to the purchaser for use as defined by the
 * Envato Market (CodeCanyon) Regular or Extended License.
 *
 * You are NOT permitted to redistribute, resell, sublicense,
 * or share this source code, in whole or in part.
 * Respect the author's rights and Envato licensing terms.
 * ============================================================
 *
 * Instagram API with Instagram Login (direct OAuth, no Facebook Page)
 *
 * This replaces the old flow that relied on `window.FB.login` +
 * a Facebook Page with a linked Instagram Business account.
 * Instead, the user is sent straight to Instagram's own
 * authorization screen and a professional Instagram account is
 * connected directly — no Facebook Page required.
 *
 * Flow:
 *  1. Client calls GET /api/instagram/oauth-url to get the
 *     Instagram authorize URL and redirects the browser there.
 *  2. Instagram redirects back to your `redirectUri` with
 *     ?code=... (and optionally &state=...).
 *  3. Client sends that code to POST /api/instagram/connect.
 *  4. Server exchanges the code for a short-lived token, then
 *     exchanges that for a long-lived (~60 day) token, then
 *     fetches the IG user's profile and stores the account.
 * ============================================================
 */

import type { Express } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { requireAuth } from "../middlewares/auth.middleware";
import { instagramAccounts, instagramAppConfig, channels, conversations, messages, aiSettings } from "@shared/schema";
import { storage } from "server/storage";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import {
  upload,
  validateUploadedFiles,
} from "../middlewares/upload.middleware";
import { instagramPublishService } from "server/services/instagram-publish.service";
import OpenAI from "openai";
const GRAPH_API_VERSION = "v21.0";

// Instagram's own OAuth authorize + short-lived token endpoints
const IG_AUTHORIZE_URL = "https://www.instagram.com/oauth/authorize";
const IG_TOKEN_URL = "https://api.instagram.com/oauth/access_token";

// graph.instagram.com is used (not graph.facebook.com) once you have
// an Instagram-Login-issued access token
const IG_GRAPH_BASE = `https://graph.instagram.com/${GRAPH_API_VERSION}`;

// const DEFAULT_PERMISSIONS = [
//   "instagram_business_basic",
//   "instagram_business_manage_messages",
//   "instagram_business_manage_comments",
// ];

const DEFAULT_PERMISSIONS = [
  "instagram_business_basic",
  "instagram_business_content_publish",
  "instagram_business_manage_messages",
  "instagram_business_manage_comments",
];

const DEFAULT_FEATURES = [
  "Team Inbox",
  "Automation",
  "Comment Reply",
  "Comment \u2192 DM",
  "Analytics",
  "AI Assistant",
];

// Scopes requested from Instagram Login for Business
const INSTAGRAM_LOGIN_SCOPE = DEFAULT_PERMISSIONS.join(",");

async function getInstagramAppConfig() {
  const [config] = await db
    .select()
    .from(instagramAppConfig)
    .where(eq(instagramAppConfig.isActive, true));
  return config;
}

async function getOwnedAccount(userId: string, accountId: string) {
  const [account] = await db
    .select()
    .from(instagramAccounts)
    .where(
      and(
        eq(instagramAccounts.id, accountId),
        eq(instagramAccounts.userId, userId)
      )
    );
  return account;
}

// Step 1: exchange the authorization `code` for a short-lived user token.
// Instagram's token endpoint expects application/x-www-form-urlencoded,
// unlike the Facebook Graph API which accepts query params.
async function exchangeCodeForShortLivedToken(
  code: string,
  appId: string,
  appSecret: string,
  redirectUri: string
) {
  const body = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  console.log("========== TOKEN REQUEST ==========");
  console.log("REDIRECT URI:", redirectUri);
  console.log("BODY:", body.toString());
  console.log("===================================");

  const res = await fetch(IG_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const json = await res.json();

  console.log("TOKEN RESPONSE:", json);

  return json;
}

// Step 2: exchange the short-lived token for a long-lived (~60 day) token
async function exchangeForLongLivedToken(shortLivedToken: string, appSecret: string) {
  const url =
    `${IG_GRAPH_BASE.replace(`/${GRAPH_API_VERSION}`, "")}/access_token` +
    `?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`;
  const res = await fetch(url);
  return res.json();
}

// Refresh an existing long-lived token before it expires (valid tokens
// can be refreshed once they're at least 24h old and not yet expired)
async function refreshLongLivedToken(accessToken: string) {
  const url =
    `${IG_GRAPH_BASE.replace(`/${GRAPH_API_VERSION}`, "")}/refresh_access_token` +
    `?grant_type=ig_refresh_token&access_token=${accessToken}`;
  const res = await fetch(url);
  return res.json();
}

async function getInstagramProfile(accessToken: string) {
  const res = await fetch(
    `${IG_GRAPH_BASE}/me?fields=user_id,username,name,account_type&access_token=${accessToken}`
  );
  return res.json();
}

export function registerInstagramRoutes(app: Express) {
  // GET /api/instagram/oauth-url - build the Instagram authorize URL
  app.get("/api/instagram/oauth-url", requireAuth, async (req: any, res) => {
  try {
    const config = await getInstagramAppConfig();

    if (!config) {
      return res.status(500).json({
        message: "Instagram App is not configured. Set it up under Instagram App settings first.",
      });
    }

    const params = new URLSearchParams({
      client_id: config.appId,
      redirect_uri: config.redirectUri,
      response_type: "code",
      scope: INSTAGRAM_LOGIN_SCOPE,
    });

    // 👇 YE ADD KARO
    const authUrl = `${IG_AUTHORIZE_URL}?${params.toString()}`;

    console.log("====================================");
    console.log("Instagram App ID:", config.appId);
    console.log("Redirect URI:", config.redirectUri);
    console.log("Scopes:", INSTAGRAM_LOGIN_SCOPE);
    console.log("Authorize URL:", authUrl);
    console.log("====================================");

    res.json({ url: authUrl });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to build Instagram authorization URL",
    });
  }
});

  // GET /api/instagram/accounts - list Instagram accounts for the current user
  app.get("/api/instagram/accounts", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const accounts = await db
        .select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.userId, userId));

      res.json({ data: accounts });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to fetch Instagram accounts",
      });
    }
  });

  

// POST /api/instagram/connect - link a new Instagram account via Instagram Login
  // Expects { code } - the authorization code Instagram redirected back with
  // app.post("/api/instagram/connect", requireAuth, async (req: any, res) => {
  //   try {
  //     const userId = req.user.id;
  //     const { code, channelId } = req.body || {};

  //     console.log("========================");
  //     console.log("POST /instagram/connect");
  //     console.log(req.body);
  //     console.log("========================");

  //     if (!code) {
  //       return res.status(400).json({ message: "Missing Instagram authorization code" });
  //     }

  //     const config = await getInstagramAppConfig();
  //     console.log("INSTAGRAM APP CONFIG:", config);

  //     if (!config) {
  //       return res.status(500).json({
  //         message: "Instagram App is not configured. Set it up under Instagram App settings first.",
  //       });
  //     }

  //     const shortLivedData: any = await exchangeCodeForShortLivedToken(
  //       code,
  //       config.appId,
  //       config.appSecret,
  //       config.redirectUri
  //     );

  //     console.log("SHORT LIVED DATA:", shortLivedData);

  //     if (shortLivedData.error_message || shortLivedData.error) {
  //       return res.status(400).json({
  //         message:
  //           shortLivedData.error_message ||
  //           shortLivedData.error?.message ||
  //           "Failed to exchange Instagram authorization code",
  //       });
  //     }

  //     const longLivedData: any = await exchangeForLongLivedToken(
  //       shortLivedData.access_token,
  //       config.appSecret
  //     );

  //     console.log("LONG LIVED DATA:", longLivedData);

  //     if (longLivedData.error || !longLivedData.access_token) {
  //       return res.status(400).json({
  //         message: longLivedData.error?.message || "Failed to obtain a long-lived Instagram token",
  //       });
  //     }

  //     const accessToken = longLivedData.access_token;
  //     const expiresInSeconds = longLivedData.expires_in ?? 60 * 24 * 60 * 60; // ~60 days
  //     const tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  //     const profile: any = await getInstagramProfile(accessToken);
  //     console.log("PROFILE:", profile);

  //     if (profile.error) {
  //       return res.status(400).json({
  //         message: profile.error?.message || "Failed to fetch Instagram account details",
  //       });
  //     }

  //     const instagramUserId = String(profile.user_id);

  //     const [existing] = await db
  //       .select()
  //       .from(instagramAccounts)
  //       .where(eq(instagramAccounts.instagramBusinessId, instagramUserId));

  //     console.log("EXISTING ACCOUNT FOUND?:", !!existing);

  //     let account;
  //     if (existing) {
  //       [account] = await db
  //         .update(instagramAccounts)
  //         .set({
  //           username: profile.username,
  //           instagramUserId,
  //           accessToken,
  //           authMethod: "instagram_login",
  //           isActive: true,
  //           connectionStatus: "connected",
  //           webhookStatus: "unknown",
  //           accessTokenStatus: "valid",
  //           permissionsStatus: "granted",
  //           tokenExpiresAt,
  //           healthError: null,
  //           updatedAt: new Date(),
  //         })
  //         .where(eq(instagramAccounts.id, existing.id))
  //         .returning();
  //     } else {
  //       [account] = await db
  //         .insert(instagramAccounts)
  //         .values({
  //           userId,
  //           channelId,
  //           username: profile.username,
  //           instagramUserId,
  //           // instagramBusinessId kept as the unique key across both
  //           // auth methods; for Instagram Login it's the IG user id.
  //           instagramBusinessId: instagramUserId,
  //           facebookPageId: null,
  //           accessToken,
  //           authMethod: "instagram_login",
  //           isActive: true,
  //           connectionStatus: "connected",
  //           webhookStatus: "unknown",
  //           accessTokenStatus: "valid",
  //           permissionsStatus: "granted",
  //           permissions: DEFAULT_PERMISSIONS,
  //           enabledFeatures: DEFAULT_FEATURES,
  //           tokenExpiresAt,
  //           connectedAt: new Date(),
  //         })
  //         .returning();
  //     }

  //     console.log("ACCOUNT SAVED:", account);

  //     res.json({ data: account });
  //   } catch (error: any) {
  //     console.log("CONNECT ERROR CAUGHT:", error);
  //     res.status(500).json({
  //       message: error.message || "Failed to connect Instagram account",
  //     });
  //   }
  // });




  app.post("/api/instagram/connect", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { code, channelId } = req.body || {};

    if (!code) {
      return res.status(400).json({ message: "Missing Instagram authorization code" });
    }

    const config = await getInstagramAppConfig();
    if (!config) {
      return res.status(500).json({
        message: "Instagram App is not configured. Set it up under Instagram App settings first.",
      });
    }

    const shortLivedData: any = await exchangeCodeForShortLivedToken(
      code,
      config.appId,
      config.appSecret,
      config.redirectUri
    );

    if (shortLivedData.error_message || shortLivedData.error) {
      return res.status(400).json({
        message:
          shortLivedData.error_message ||
          shortLivedData.error?.message ||
          "Failed to exchange Instagram authorization code",
      });
    }

    const longLivedData: any = await exchangeForLongLivedToken(
      shortLivedData.access_token,
      config.appSecret
    );

    if (longLivedData.error || !longLivedData.access_token) {
      return res.status(400).json({
        message: longLivedData.error?.message || "Failed to obtain a long-lived Instagram token",
      });
    }

    const accessToken = longLivedData.access_token;
    const expiresInSeconds = longLivedData.expires_in ?? 60 * 24 * 60 * 60; // ~60 days
    const tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const profile: any = await getInstagramProfile(accessToken);
    if (profile.error) {
      return res.status(400).json({
        message: profile.error?.message || "Failed to fetch Instagram account details",
      });
    }

    const instagramUserId = String(profile.user_id);

    // Account already linked to this exact Instagram user (reconnect / re-auth case)
    const [existing] = await db
      .select()
      .from(instagramAccounts)
      .where(eq(instagramAccounts.instagramBusinessId, instagramUserId));

    // 🔒 ONE ACCOUNT AT A TIME:
    // Check if this user/channel already has a DIFFERENT active Instagram
    // account connected. If yes, block — they must disconnect it first.
    const [existingActive] = channelId
      ? await db
          .select()
          .from(instagramAccounts)
          .where(
            and(
              eq(instagramAccounts.channelId, channelId),
              eq(instagramAccounts.isActive, true)
            )
          )
      : await db
          .select()
          .from(instagramAccounts)
          .where(
            and(
              eq(instagramAccounts.userId, userId),
              eq(instagramAccounts.isActive, true)
            )
          );

    if (
      existingActive &&
      existingActive.instagramBusinessId !== instagramUserId
    ) {
      return res.status(400).json({
        code: "ACCOUNT_ALREADY_CONNECTED",
        message: `An Instagram account (@${existingActive.username}) is already connected. Please disconnect it before connecting a different account.`,
      });
    }

    let account;
    if (existing) {
      [account] = await db
        .update(instagramAccounts)
        .set({
          username: profile.username,
          instagramUserId,
          accessToken,
          channelId: channelId ?? existing.channelId,
          authMethod: "instagram_login",
          isActive: true,
          connectionStatus: "connected",
          webhookStatus: "unknown",
          accessTokenStatus: "valid",
          permissionsStatus: "granted",
          tokenExpiresAt,
          healthError: null,
          updatedAt: new Date(),
        })
        .where(eq(instagramAccounts.id, existing.id))
        .returning();
    } else {
      [account] = await db
        .insert(instagramAccounts)
        .values({
          userId,
          channelId,
          username: profile.username,
          instagramUserId,
          instagramBusinessId: instagramUserId,
          facebookPageId: null,
          accessToken,
          authMethod: "instagram_login",
          isActive: true,
          connectionStatus: "connected",
          webhookStatus: "unknown",
          accessTokenStatus: "valid",
          permissionsStatus: "granted",
          permissions: DEFAULT_PERMISSIONS,
          enabledFeatures: DEFAULT_FEATURES,
          tokenExpiresAt,
          connectedAt: new Date(),
        })
        .returning();
    }

    res.json({ data: account });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to connect Instagram account",
    });
  }
});

  // POST /api/instagram/test - verify an existing account's connection health
  app.post("/api/instagram/test", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { accountId } = req.body || {};

      const account = await getOwnedAccount(userId, accountId);
      if (!account) {
        return res.status(404).json({ message: "Instagram account not found" });
      }

      const profile: any = await getInstagramProfile(account.accessToken);
      const isHealthy = !profile.error;

      const [updated] = await db
        .update(instagramAccounts)
        .set({
          connectionStatus: isHealthy ? "connected" : "error",
          accessTokenStatus: isHealthy ? "valid" : "expired",
          healthError: isHealthy ? null : profile.error?.message,
          lastHealthCheck: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(instagramAccounts.id, accountId))
        .returning();

      if (!isHealthy) {
        return res.status(400).json({
          message: profile.error?.message || "Instagram connection test failed",
          data: updated,
        });
      }

      res.json({ data: updated });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to test Instagram connection",
      });
    }
  });

  // POST /api/instagram/reconnect - refresh permissions via a fresh Instagram Login
  // Expects { accountId, code } - code is the authorization code from a fresh login
  app.post("/api/instagram/reconnect", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { accountId, code } = req.body || {};

      const account = await getOwnedAccount(userId, accountId);
      if (!account) {
        return res.status(404).json({ message: "Instagram account not found" });
      }

      if (!code) {
        return res.status(400).json({ message: "Missing Instagram authorization code" });
      }

      const config = await getInstagramAppConfig();
      if (!config) {
        return res.status(500).json({
          message: "Instagram App is not configured. Set it up under Instagram App settings first.",
        });
      }

      const shortLivedData: any = await exchangeCodeForShortLivedToken(
        code,
        config.appId,
        config.appSecret,
        config.redirectUri
      );

      if (shortLivedData.error_message || shortLivedData.error) {
        return res.status(400).json({
          message:
            shortLivedData.error_message ||
            shortLivedData.error?.message ||
            "Failed to exchange Instagram authorization code",
        });
      }

      const longLivedData: any = await exchangeForLongLivedToken(
        shortLivedData.access_token,
        config.appSecret
      );

      if (longLivedData.error || !longLivedData.access_token) {
        return res.status(400).json({
          message: longLivedData.error?.message || "Failed to obtain a long-lived Instagram token",
        });
      }

      const accessToken = longLivedData.access_token;
      const expiresInSeconds = longLivedData.expires_in ?? 60 * 24 * 60 * 60;
      const tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);

      const profile: any = await getInstagramProfile(accessToken);
      if (profile.error) {
        return res.status(400).json({
          message: profile.error?.message || "Failed to fetch Instagram account details",
        });
      }

      const [updated] = await db
        .update(instagramAccounts)
        .set({
          username: profile.username,
          instagramUserId: String(profile.user_id),
          accessToken,
          authMethod: "instagram_login",
          isActive: true,
          connectionStatus: "connected",
          webhookStatus: "unknown",
          accessTokenStatus: "valid",
          permissionsStatus: "granted",
          tokenExpiresAt,
          healthError: null,
          lastHealthCheck: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(instagramAccounts.id, accountId))
        .returning();


//         const subscribed = await subscribeInstagramAccountToWebhooks(
//   updated.id,
//   String(profile.user_id),
//   accessToken
// );
// if (subscribed) {
//   updated.webhookStatus = "subscribed";
// }



      res.json({ data: updated });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to reconnect Instagram account",
      });
    }
  });

  // POST /api/instagram/refresh-token - proactively refresh a long-lived token
  // (call this from a scheduled job before tokenExpiresAt, tokens must be
  // at least 24h old to refresh and not yet expired)
  app.post("/api/instagram/refresh-token", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { accountId } = req.body || {};

      const account = await getOwnedAccount(userId, accountId);
      if (!account) {
        return res.status(404).json({ message: "Instagram account not found" });
      }

      const refreshed: any = await refreshLongLivedToken(account.accessToken);
      if (refreshed.error || !refreshed.access_token) {
        return res.status(400).json({
          message: refreshed.error?.message || "Failed to refresh Instagram token",
        });
      }

      const expiresInSeconds = refreshed.expires_in ?? 60 * 24 * 60 * 60;
      const tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);

      const [updated] = await db
        .update(instagramAccounts)
        .set({
          accessToken: refreshed.access_token,
          accessTokenStatus: "valid",
          tokenExpiresAt,
          updatedAt: new Date(),
        })
        .where(eq(instagramAccounts.id, accountId))
        .returning();

      res.json({ data: updated });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to refresh Instagram token",
      });
    }
  });

  // POST /api/instagram/disconnect - deactivate an account without deleting it
  app.post("/api/instagram/disconnect", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { accountId } = req.body || {};

      const account = await getOwnedAccount(userId, accountId);
      if (!account) {
        return res.status(404).json({ message: "Instagram account not found" });
      }

      const [updated] = await db
        .update(instagramAccounts)
        .set({
          isActive: false,
          connectionStatus: "error",
          updatedAt: new Date(),
        })
        .where(eq(instagramAccounts.id, accountId))
        .returning();

      res.json({ data: updated });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to disconnect Instagram account",
      });
    }
  });

  // DELETE /api/instagram/:id - permanently remove an account
  app.delete("/api/instagram/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const account = await getOwnedAccount(userId, id);
      if (!account) {
        return res.status(404).json({ message: "Instagram account not found" });
      }

      await db.delete(instagramAccounts).where(eq(instagramAccounts.id, id));

      res.json({ message: "Instagram account deleted" });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to delete Instagram account",
      });
    }
  });

  // GET /api/instagram/:id/webhook-subscription - check Meta webhook subscription status
  // For Instagram Login accounts, subscribed_apps is checked directly on the
  // Instagram user id (not on a Facebook Page id).
  app.get(
    "/api/instagram/:id/webhook-subscription",
    requireAuth,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const { id } = req.params;

        const account = await getOwnedAccount(userId, id);
        if (!account) {
          return res.status(404).json({ message: "Instagram account not found" });
        }

        const igId = account.instagramUserId || account.instagramBusinessId;

        const subRes = await fetch(
          `${IG_GRAPH_BASE}/${igId}/subscribed_apps?access_token=${account.accessToken}`
        );
        const subData: any = await subRes.json();

        if (subData.error) {
          return res.status(502).json({
            message: subData.error.message || "Failed to check webhook subscription",
          });
        }

        const subscribed = Array.isArray(subData.data) && subData.data.length > 0;

        await db
          .update(instagramAccounts)
          .set({ webhookStatus: subscribed ? "subscribed" : "not_subscribed" })
          .where(eq(instagramAccounts.id, id));

        res.json({ subscribed });
      } catch (error: any) {
        res.status(500).json({
          message: error.message || "Failed to check webhook subscription",
        });
      }
    }
  );

  // POST /api/instagram/:id/webhook-subscription - subscribe this IG account
  // to your app's webhook fields (messages, comments, etc.)
  app.post(
    "/api/instagram/:id/webhook-subscription",
    requireAuth,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const { id } = req.params;
        const { fields } = req.body || {};

        const account = await getOwnedAccount(userId, id);
        if (!account) {
          return res.status(404).json({ message: "Instagram account not found" });
        }

        const igId = account.instagramUserId || account.instagramBusinessId;
        const subscribedFields =
          Array.isArray(fields) && fields.length > 0
            ? fields.join(",")
            : "messages,comments";

        const subRes = await fetch(
          `${IG_GRAPH_BASE}/${igId}/subscribed_apps?subscribed_fields=${subscribedFields}&access_token=${account.accessToken}`,
          { method: "POST" }
        );
        const subData: any = await subRes.json();

        if (subData.error) {
          return res.status(502).json({
            message: subData.error.message || "Failed to subscribe to Instagram webhooks",
          });
        }

        await db
          .update(instagramAccounts)
          .set({ webhookStatus: "subscribed" })
          .where(eq(instagramAccounts.id, id));

        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({
          message: error.message || "Failed to subscribe to Instagram webhooks",
        });
      }
    }
  );


// POST /api/instagram/send-media
// Expects multipart/form-data:
// media: image file
// conversationId: Instagram conversation ID
// caption: optional caption

app.post(
  "/api/instagram/send-media",
  requireAuth,
  upload.single("media"),
  validateUploadedFiles,
  async (req: any, res) => {
    try {
      const { conversationId, caption = "" } = req.body || {};
      const file = req.file;

      if (!conversationId) {
        return res.status(400).json({
          message: "conversationId is required",
        });
      }

      if (!file) {
        return res.status(400).json({
          message: "Image is required",
        });
      }

      const [conversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId));

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found",
        });
      }

      if (conversation.type !== "instagram") {
        return res.status(400).json({
          message: "This conversation is not an Instagram conversation",
        });
      }

      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, conversation.channelId));

      if (!channel) {
        return res.status(404).json({
          message: "Channel not found for this conversation",
        });
      }

      const [account] = await db
        .select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.channelId, channel.id));

      if (!account) {
        return res.status(404).json({
          message: "Instagram account not found for this channel",
        });
      }

      const recipientIgsid = conversation.contactPhone;

      if (!recipientIgsid) {
        return res.status(400).json({
          message: "Recipient Instagram-scoped ID missing on conversation",
        });
      }

      /**
       * Move uploaded file to public Instagram upload directory
       */
      const uploadDir = path.join(
        process.cwd(),
        "uploads",
        "instagram"
      );

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, {
          recursive: true,
        });
      }

      const ext = path.extname(file.originalname);

      const fileName = `${Date.now()}-${uuid()}${ext}`;

      const destination = path.join(uploadDir, fileName);

      fs.renameSync(file.path, destination);

      const protocol =
        req.headers["x-forwarded-proto"]?.toString() ||
        req.protocol;

      const host =
        req.headers["x-forwarded-host"]?.toString() ||
        req.get("host");

      const mediaUrl =
        `${protocol}://${host}/uploads/instagram/${fileName}`;

      /**
       * Instagram account ID
       */
      const igUserId =
        account.instagramUserId ||
        account.instagramBusinessId;

      /**
       * Send image through Instagram Messaging API
       */
      const sendRes = await fetch(
        `${IG_GRAPH_BASE}/${igUserId}/messages?access_token=${account.accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: {
              id: recipientIgsid,
            },
            message: {
              attachment: {
                type: "image",
                payload: {
                  url: mediaUrl,
                },
              },
              ...(caption
                ? {
                    text: caption,
                  }
                : {}),
            },
          }),
        }
      );

      const sendData: any = await sendRes.json();

      console.log(
        "Instagram media response:",
        sendData
      );

      if (!sendRes.ok || sendData.error) {
        return res.status(400).json({
          message:
            sendData.error?.message ||
            "Failed to send Instagram image",
          error: sendData.error,
        });
      }

      const messageTimestamp = new Date();

      /**
       * Save outbound message
       */
      const [savedMessage] = await db
        .insert(messages)
        .values({
          conversationId: conversation.id,
          whatsappMessageId: sendData.message_id,
          content: caption || "[image]",
          type: "image",
          fromType: "agent",
          direction: "outbound",
          status: "sent",
          mediaUrl,
          mediaMimeType: file.mimetype,
          timestamp: messageTimestamp,
        })
        .returning();

      /**
       * Update conversation
       */
      await db
        .update(conversations)
        .set({
          lastMessageAt: messageTimestamp,
          lastMessageText: caption || "[image]",
          updatedAt: new Date(),
        })
        .where(
          eq(
            conversations.id,
            conversation.id
          )
        );

      /**
       * Notify Team Inbox
       */
      const io = (global as any).io;

      if (io) {
        const room = `channel:${channel.id}`;

        const payload = {
          conversationId: conversation.id,
          message: savedMessage,
          content: caption || "[image]",
          createdAt: messageTimestamp.getTime(),
        };

        io.to(room).emit(
          "message_sent",
          payload
        );

        io.emit(
          "message_sent",
          payload
        );
      }

      return res.json({
        success: true,
        data: savedMessage,
      });
    } catch (error: any) {
      console.error(
        "Instagram send media error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Failed to send Instagram image",
      });
    }
  }
);

  // POST /api/instagram/send-message - Send an outbound DM for an Instagram conversation
  // Expects { conversationId, content }
  app.post("/api/instagram/send-message", requireAuth, async (req: any, res) => {
    try {
      const { conversationId, content } = req.body || {};

      if (!conversationId || !content) {
        return res.status(400).json({ message: "conversationId and content are required" });
      }

      const [conversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId));

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (conversation.type !== "instagram") {
        return res.status(400).json({ message: "This conversation is not an Instagram conversation" });
      }

      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, conversation.channelId));

      if (!channel) {
        return res.status(404).json({ message: "Channel not found for this conversation" });
      }

      const [account] = await db
        .select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.channelId, channel.id));

      if (!account) {
        return res.status(404).json({ message: "Instagram account not found for this channel" });
      }

      const recipientIgsid = conversation.contactPhone;
      if (!recipientIgsid) {
        return res.status(400).json({ message: "Recipient Instagram-scoped ID missing on conversation" });
      }

      const igUserId = account.instagramUserId || account.instagramBusinessId;

      const sendRes = await fetch(
        `${IG_GRAPH_BASE}/${igUserId}/messages?access_token=${account.accessToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: { id: recipientIgsid },
            message: { text: content },
          }),
        }
      );

      const sendData: any = await sendRes.json();

      if (sendData.error) {
        return res.status(400).json({
          message: sendData.error.message || "Failed to send Instagram message",
        });
      }

      const messageTimestamp = new Date();

      const [savedMessage] = await db
        .insert(messages)
        .values({
          conversationId: conversation.id,
          whatsappMessageId: sendData.message_id,
          content,
          type: "text",
          fromType: "agent",
          direction: "outbound",
          status: "sent",
          timestamp: messageTimestamp,
        })
        .returning();

      await db
        .update(conversations)
        .set({
          lastMessageAt: messageTimestamp,
          lastMessageText: content,
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, conversation.id));

      const io = (global as any).io;
      if (io) {
        const room = `channel:${channel.id}`;
        const payload = {
          conversationId: conversation.id,
          message: savedMessage,
          content,
          createdAt: messageTimestamp.getTime(),
        };
        io.to(room).emit("message_sent", payload);
        io.emit("message_sent", payload);
      }

      res.json({ data: savedMessage, success: true });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to send Instagram message",
      });
    }
  });




app.post(
  "/api/instagram/posts",
  requireAuth,
  async (req: any, res) => {
    try {
      const userId = req.user.id;

      const {
        accountId,
        channelId,
        caption,
        mediaType,
        mediaUrls,
        publishType,
        scheduledAt,
        firstComment,
        hashtags,
        collaborators,
        locationId,
      } = req.body;

      if (!accountId)
        return res.status(400).json({ message: "accountId is required" });

      if (!channelId)
        return res.status(400).json({ message: "channelId is required" });

      if (!mediaUrls?.length)
        return res.status(400).json({ message: "Media is required" });

      // FIX: scheduledAt arrives as a string (or null) over JSON — convert
      // to a Date before it reaches storage/Drizzle.
      const scheduledAtDate = scheduledAt ? new Date(scheduledAt) : null;

      const post = await storage.createInstagramPost({
        createdBy: userId,
        accountId,
        channelId,
        caption,
        mediaType,
        mediaUrls,
        publishType,
        scheduledAt: scheduledAtDate,
        firstComment,
        hashtags,
        collaborators,
        locationId,
        status:
          publishType === "scheduled" || publishType === "schedule"
            ? "scheduled"
            : "draft",
      });

      // "Publish Now" creates the post then immediately publishes it to
      // Instagram via the existing publish service — same code path as
      // the manual "Publish Now" button on an existing post.
      if (publishType === "now") {
        try {
          const published = await instagramPublishService.publish(post.id);
          return res.json({ success: true, data: published });
        } catch (publishErr: any) {
          // Post row already exists (as "draft"); mark it failed so it's
          // visible in the list instead of silently staying a draft.
          await storage.updateInstagramPost(post.id, {
            status: "failed",
            updatedAt: new Date(),
          }).catch(() => {});
          return res.status(400).json({
            success: false,
            message: publishErr.message || "Failed to publish Instagram post",
          });
        }
      }

      return res.json({
        success: true,
        data: post,
      });
    } catch (err: any) {
      console.error(err);

      return res.status(500).json({
        message:
          err.message ||
          "Failed to create instagram post",
      });
    }
  }
);

app.patch(
  "/api/instagram/posts/:id",
  requireAuth,
  async (req: any, res) => {
    try {
      const { id } = req.params;

      const existing = await storage.getInstagramPost(id);

      if (!existing) {
        return res.status(404).json({
          message: "Instagram post not found",
        });
      }

      // Published posts edit nahi honge
      if (existing.status === "published") {
        return res.status(400).json({
          message: "Published posts cannot be edited",
        });
      }

      // FIX: same string -> Date conversion as the create handler.
      // Only touch scheduledAt if the caller actually sent it, so a
      // PATCH that doesn't include it (e.g. just updating caption)
      // doesn't wipe out the existing schedule.
      const updates: Record<string, any> = { ...req.body, updatedAt: new Date() };
      if ("scheduledAt" in req.body) {
        updates.scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
      }

      const updated = await storage.updateInstagramPost(id, updates);

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        message:
          error.message ||
          "Failed to update Instagram post",
      });
    }
  }
);





app.get(
  "/api/instagram/posts",
  requireAuth,
  async (req: any, res) => {
    try {
      const {
        channelId,
        page = 1,
        limit = 10,
      } = req.query;

      if (!channelId) {
        return res.status(400).json({
          message: "channelId is required",
        });
      }

      const posts = await storage.getInstagramPosts(
        channelId,
        Number(page),
        Number(limit)
      );

      return res.json({
        success: true,
        ...posts,
      });
    } catch (error: any) {
      return res.status(500).json({
        message:
          error.message ||
          "Failed to fetch Instagram posts",
      });
    }
  }
);


app.get(
  "/api/instagram/posts/:id",
  requireAuth,
  async (req: any, res) => {
    try {
      const post = await storage.getInstagramPost(
        req.params.id
      );

      if (!post) {
        return res.status(404).json({
          message: "Post not found",
        });
      }

      return res.json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      return res.status(500).json({
        message:
          error.message ||
          "Failed to fetch Instagram post",
      });
    }
  }
);


// app.patch(
//   "/api/instagram/posts/:id",
//   requireAuth,
//   async (req: any, res) => {
//     try {
//       const { id } = req.params;

//       const existing = await storage.getInstagramPost(id);

//       if (!existing) {
//         return res.status(404).json({
//           message: "Instagram post not found",
//         });
//       }

//       // Published posts edit nahi honge
//       if (existing.status === "published") {
//         return res.status(400).json({
//           message: "Published posts cannot be edited",
//         });
//       }

//       const updated = await storage.updateInstagramPost(id, {
//         ...req.body,
//         updatedAt: new Date(),
//       });

//       return res.json({
//         success: true,
//         data: updated,
//       });
//     } catch (error: any) {
//       console.error(error);

//       return res.status(500).json({
//         message:
//           error.message ||
//           "Failed to update Instagram post",
//       });
//     }
//   }
// );


app.delete(
  "/api/instagram/posts/:id",
  requireAuth,
  async (req: any, res) => {
    try {
      const { id } = req.params;

      const existing = await storage.getInstagramPost(id);

      if (!existing) {
        return res.status(404).json({
          message: "Instagram post not found",
        });
      }

      if (existing.status === "published") {
        return res.status(400).json({
          message: "Published posts cannot be deleted",
        });
      }

      await storage.deleteInstagramPost(id);

      return res.json({
        success: true,
        message: "Instagram post deleted successfully",
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        message:
          error.message ||
          "Failed to delete Instagram post",
      });
    }
  }
);


app.post(
  "/api/instagram/upload-media",
  requireAuth,
  upload.fields([
    {
      name: "mediaFile",
      maxCount: 10,
    },
  ]),
  validateUploadedFiles,
  async (req: any, res) => {
    try {
      const files = req.files?.mediaFile as Express.Multer.File[];

      if (!files?.length) {
        return res.status(400).json({
          success: false,
          message: "No media selected",
        });
      }

      const uploadDir = path.join(process.cwd(), "uploads", "instagram");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, {
          recursive: true,
        });
      }

      const urls: string[] = [];

      for (const file of files) {
        const ext = path.extname(file.originalname);

        const fileName = `${Date.now()}-${uuid()}${ext}`;

        const destination = path.join(uploadDir, fileName);

        fs.renameSync(file.path, destination);

        const protocol =
  req.headers["x-forwarded-proto"]?.toString() || req.protocol;

const host =
  req.headers["x-forwarded-host"]?.toString() || req.get("host");

const baseUrl = `${protocol}://${host}`;

urls.push(`${baseUrl}/uploads/instagram/${fileName}`);
      }

      return res.json({
        success: true,
        urls,
      });
    } catch (err: any) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message:
          err.message || "Failed to upload image",
      });
    }
  }
);







app.post(
  "/api/instagram/posts/:id/publish",
  requireAuth,
  async (req, res) => {
    try {

      const post =
        await instagramPublishService.publish(req.params.id);

      res.json({
        success: true,
        data: post,
      });

    } catch (err: any) {

      return res.status(400).json({
        success: false,
        message: err.message,
      });

    }
  }
);





// GET /api/instagram-app-config - fetch the single active Instagram App config
  app.get("/api/instagram-app-config", requireAuth, async (req: any, res) => {
    try {
      if (req.user.role !== "superadmin") {
        return res.status(403).json({ message: "Superadmin access required" });
      }
 
      const config = await getInstagramAppConfig();
 
      // Matches the embedded-config pattern: return the object directly
      // (or null), not wrapped in { data }.
      res.json(config || null);
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to fetch Instagram App config",
      });
    }
  });
 
  // POST /api/instagram-app-config - create if none exists, otherwise update
  // the existing active row (single config per install, same idea as
  // whatsappBusinessAccountsConfig)
  app.post("/api/instagram-app-config", requireAuth, async (req: any, res) => {
    try {
      if (req.user.role !== "superadmin") {
        return res.status(403).json({ message: "Superadmin access required" });
      }
 
      const { appId, appSecret, redirectUri, webhookVerifyToken } = req.body || {};
 
      console.log("========================");
      console.log("POST /instagram-app-config");
      console.log(req.body);
      console.log("========================");
 
      if (!appId || !appSecret || !redirectUri) {
        return res.status(400).json({
          message: "appId, appSecret, and redirectUri are required",
        });
      }
 
      const existing = await getInstagramAppConfig();
 
      let saved;
      if (existing) {
        [saved] = await db
          .update(instagramAppConfig)
          .set({
            appId,
            appSecret,
            redirectUri,
            webhookVerifyToken: webhookVerifyToken ?? existing.webhookVerifyToken,
            updatedAt: new Date(),
          })
          .where(eq(instagramAppConfig.id, existing.id))
          .returning();
      } else {
        [saved] = await db
          .insert(instagramAppConfig)
          .values({
            appId,
            appSecret,
            redirectUri,
            webhookVerifyToken: webhookVerifyToken || null,
            isActive: true,
            createdBy: req.user.id,
          })
          .returning();
      }
 
      console.log("INSTAGRAM APP CONFIG SAVED:", saved);
 
      res.json(saved);
    } catch (error: any) {
      console.log("INSTAGRAM APP CONFIG SAVE ERROR:", error);
      res.status(500).json({
        message: error.message || "Failed to save Instagram App config",
      });
    }
  });







 

app.post("/api/instagram/generate-caption", requireAuth, async (req, res) => {
  try {
    const { channelId, postType, topic } = req.body;

    if (!channelId) {
      return res.status(400).json({ error: "channelId is required" });
    }

    // Active AI setting for this channel — mirrors the test-chat lookup,
    // but also filters isActive since a channel could have multiple
    // configured providers over time and only one should be live.
    const [activeSetting] = await db
      .select()
      .from(aiSettings)
      .where(
        and(
          eq(aiSettings.channelId, channelId),
          eq(aiSettings.isActive, true)
        )
      )
      .orderBy(desc(aiSettings.updatedAt))
      .limit(1);

    if (!activeSetting?.apiKey) {
      return res.status(400).json({
        error: "No active AI provider configured for this channel. Add one in AI Settings first.",
      });
    }

    const client = new OpenAI({
      apiKey: activeSetting.apiKey,
      baseURL: activeSetting.endpoint || "https://api.openai.com/v1",
    });

    const model = activeSetting.model || "gpt-4o-mini";
    const temperature = parseFloat(activeSetting.temperature || "0.8");
    // Captions are short — don't burn the channel's configured maxTokens,
    // cap it locally regardless of what's set for chat replies.
    const maxTokens = Math.min(parseInt(activeSetting.maxTokens || "300"), 300);

    const systemPrompt =
      "You write short, engaging Instagram captions. Include relevant emojis " +
      "and a natural call to action. Keep it under 280 characters. " +
      "Return only the caption text, no quotes, no explanation.";

    const userPrompt = topic
      ? `Write a caption for a ${postType || "image"} post about: ${topic}`
      : `Write a caption for a ${postType || "image"} post.`;

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const caption = completion.choices?.[0]?.message?.content?.trim();

    if (!caption) {
      return res.status(502).json({ error: "AI provider returned an empty caption." });
    }

    res.json({ caption });
  } catch (error: any) {
    console.error("Caption generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate caption." });
  }
});

}