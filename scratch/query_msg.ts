import { db } from "../server/db";
import { messages } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  const wamid = "wamid.HBgMOTE4OTU4OTk0ODQyFQIAERgSQkU2MDM0NTM1NTlCNzlDMDlEAA==";
  console.log("Querying for wamid:", wamid);
  try {
    const results = await db.select().from(messages).where(eq(messages.whatsappMessageId, wamid));
    console.log("Results:", JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("Error querying db:", err);
  }
}

main().then(() => process.exit(0));
