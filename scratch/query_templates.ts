import { db } from "../server/db";
import { templates } from "../shared/schema";

async function main() {
  console.log("Querying all templates in DB:");
  try {
    const results = await db.select().from(templates);
    console.log("Templates in DB:", JSON.stringify(results.map(t => ({
      id: t.id,
      name: t.name,
      language: t.language,
      status: t.status,
      category: t.category,
      whatsappTemplateId: t.whatsappTemplateId
    })), null, 2));
  } catch (err) {
    console.error("Error querying db:", err);
  }
}

main().then(() => process.exit(0));
