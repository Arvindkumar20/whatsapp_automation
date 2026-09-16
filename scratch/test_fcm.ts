import "dotenv/config";
import { sendPushNotification, isUserViewingConversation } from "../server/services/fcm.service";

async function main() {
  console.log("=== Testing FCM Service ===");
  
  // Test mock user active check
  const userId = "test-user-id";
  const conversationId = "test-conversation-id";
  
  console.log(`Checking if user ${userId} is viewing conversation ${conversationId}...`);
  try {
    const isViewing = isUserViewingConversation(userId, conversationId);
    console.log(`Result (isViewing): ${isViewing} (Expected: false)`);
  } catch (err) {
    console.error("Error checking user viewing conversation:", err);
  }
  
  console.log("Attempting mock push notification sending...");
  try {
    // This will try to fetch the user and firebase config.
    // If no config/user exists, it will log warning and return false gracefully.
    const result = await sendPushNotification(
      userId,
      "Test Notification",
      "Hello World!",
      conversationId
    );
    console.log("Send push result:", result);
  } catch (err) {
    console.error("Error sending push notification:", err);
  }
  
  console.log("=== Testing Completed ===");
}

main().then(() => process.exit(0)).catch((err) => {
  console.error("FCM test crashed:", err);
  process.exit(1);
});
