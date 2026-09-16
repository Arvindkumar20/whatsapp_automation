import "dotenv/config";
import { db } from "../server/db";
import { firebaseConfig } from "../shared/schema";
import { eq } from "drizzle-orm";

// ==========================================
// FILL IN YOUR FIREBASE CREDENTIALS HERE
// ==========================================
const firebaseDetails = {
  projectId: "YOUR_PROJECT_ID",
  clientEmail: "YOUR_CLIENT_EMAIL",
  // Note: Keep the \n in the private key string or use a template literal
  privateKey: "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
  apiKey: "YOUR_API_KEY_OPTIONAL",
  authDomain: "YOUR_AUTH_DOMAIN_OPTIONAL",
  storageBucket: "YOUR_STORAGE_BUCKET_OPTIONAL",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_OPTIONAL",
  appId: "YOUR_APP_ID_OPTIONAL",
  measurementId: "YOUR_MEASUREMENT_ID_OPTIONAL",
  vapidKey: "YOUR_VAPID_KEY_OPTIONAL",
};

async function main() {
  console.log("=== Updating Firebase Details on Database ===");

  if (firebaseDetails.projectId === "YOUR_PROJECT_ID") {
    console.error("❌ Error: Please fill in your actual Firebase details in this file before running it.");
    process.exit(1);
  }

  try {
    // Check if configuration already exists
    const existing = await db.select().from(firebaseConfig).limit(1);
    
    let result;
    if (existing.length > 0) {
      console.log("Updating existing Firebase configuration...");
      result = await db
        .update(firebaseConfig)
        .set({
          ...firebaseDetails,
          updatedAt: new Date(),
        })
        .where(eq(firebaseConfig.id, existing[0].id))
        .returning();
    } else {
      console.log("Creating new Firebase configuration...");
      result = await db
        .insert(firebaseConfig)
        .values({
          ...firebaseDetails,
          updatedAt: new Date(),
        })
        .returning();
    }

    console.log("✅ Success! Firebase details updated:");
    console.log(JSON.stringify({
      id: result[0].id,
      projectId: result[0].projectId,
      clientEmail: result[0].clientEmail,
      hasPrivateKey: !!result[0].privateKey,
    }, null, 2));

  } catch (error) {
    console.error("❌ Database update failed:", error);
  }
}

main().then(() => process.exit(0));
