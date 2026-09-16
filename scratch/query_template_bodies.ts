import { db } from "../server/db";
import { templates } from "../shared/schema";

async function main() {
  try {
    const results = await db.select().from(templates);
    results.forEach(t => {
      console.log(`Template: ${t.name} (ID: ${t.id})`);
      console.log(`  Language: ${t.language}`);
      console.log(`  Body: ${t.body}`);
      console.log(`  Buttons: ${t.buttons}`);
      console.log("-----------------------------------------");
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

main().then(() => process.exit(0));
