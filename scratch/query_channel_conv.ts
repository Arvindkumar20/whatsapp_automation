import { db } from "../server/db";
import { conversations, channels } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  const conversationId = "b0b602c2-b006-4c79-8432-c5878b91326d";
  console.log("Querying details for conversation:", conversationId);
  try {
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
    if (!conv) {
      console.log("Conversation not found!");
      return;
    }
    console.log("Conversation details:", JSON.stringify(conv, null, 2));

    const [channel] = await db.select().from(channels).where(eq(channels.id, conv.channelId)).limit(1);
    console.log("Channel details:", JSON.stringify(channel ? {
      id: channel.id,
      name: channel.name,
      phoneNumber: channel.phoneNumber,
      phoneNumberId: channel.phoneNumberId,
      status: channel.status
    } : "Not found", null, 2));
  } catch (err) {
    console.error("Error querying db:", err);
  }
}

main().then(() => process.exit(0));
