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
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging, Message } from "firebase-admin/messaging";
import { db } from "../db";
import { firebaseConfig, users } from "@shared/schema";
import { eq } from "drizzle-orm";

let isFirebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK using stored settings from database
 */
async function ensureFirebaseInitialized(): Promise<boolean> {
  if (isFirebaseInitialized) {
    return true;
  }

  // Prevent double initialization if apps array already has elements
  if (getApps().length > 0) {
    isFirebaseInitialized = true;
    return true;
  }

  try {
    const configList = await db.select().from(firebaseConfig).limit(1);
    const config = configList[0];

    if (!config || !config.projectId || !config.clientEmail || !config.privateKey) {
      console.warn("[FCM Service] Firebase settings are incomplete in database. Push notifications disabled.");
      return false;
    }

    // Format the private key to handle literal/escaped newlines correctly
    const formattedPrivateKey = config.privateKey.replace(/\\n/g, "\n");

    initializeApp({
      credential: cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: formattedPrivateKey,
      }),
    });

    isFirebaseInitialized = true;
    console.log("[FCM Service] Firebase Admin SDK initialized successfully");
    return true;
  } catch (error) {
    console.error("[FCM Service] Failed to initialize Firebase Admin SDK:", error);
    return false;
  }
}

/**
 * Check if the user is actively viewing a specific conversation via Socket.io
 */
export function isUserViewingConversation(userId: string, conversationId: string): boolean {
  const io = (global as any).io;
  if (!io) return false;

  // 1. Get all sockets belonging to this user
  const userRoom = io.sockets.adapter.rooms.get(`user:${userId}`);
  console.log(`[FCM Debug] Checking user ${userId} viewing conversation ${conversationId}`);
  console.log(`[FCM Debug] Sockets in user:${userId} room:`, userRoom ? Array.from(userRoom) : "None (User is offline/not connected to socket)");
  
  if (!userRoom || userRoom.size === 0) return false;

  // 2. Get all sockets in the target conversation room
  const convRoom = io.sockets.adapter.rooms.get(`conversation:${conversationId}`);
  const convRoomAlt = io.sockets.adapter.rooms.get(`conversation_${conversationId}`);
  console.log(`[FCM Debug] Sockets in conversation:${conversationId} room:`, convRoom ? Array.from(convRoom) : "None");

  // 3. Check for any overlap (meaning the user has at least one active tab in this chat)
  for (const socketId of userRoom) {
    if ((convRoom && convRoom.has(socketId)) || (convRoomAlt && convRoomAlt.has(socketId))) {
      console.log(`[FCM Debug] Match found! Socket ${socketId} is in both rooms.`);
      return true;
    }
  }

  console.log(`[FCM Debug] No socket overlap found between user:${userId} and conversation:${conversationId}.`);
  return false;
}

/**
 * Send a Push Notification to a user via Firebase Cloud Messaging (FCM)
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  conversationId?: string,
  data?: Record<string, string>
): Promise<boolean> {
  try {
    // 1. If conversationId is specified, check if the user is actively viewing it
    if (conversationId && isUserViewingConversation(userId, conversationId)) {
      console.log(`[FCM Service] Skipping notification to user ${userId} since they are active in conversation ${conversationId}`);
      return false;
    }

    // 2. Get user's FCM token from database
    const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userRows[0];

    if (!user || !user.fcmToken) {
      return false;
    }

    // 3. Initialize Firebase Admin SDK dynamically
    const initialized = await ensureFirebaseInitialized();
    if (!initialized) {
      return false;
    }

    // 4. Construct payload
    const payload: Message = {
      token: user.fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        ...(data || {}),
        conversationId: conversationId || "",
      },
    };

    // 5. Send push notification
    const response = await getMessaging().send(payload);
    console.log(`[FCM Service] Push notification sent successfully to user ${userId}:`, response);
    return true;
  } catch (error: any) {
    console.error(`[FCM Service] Error sending push notification to user ${userId}:`, error);

    // Clear expired/invalid registration token from the database
    if (
      error.code === "messaging/registration-token-not-registered" ||
      error.code === "messaging/invalid-registration-token"
    ) {
      console.log(`[FCM Service] Clearing invalid FCM token for user ${userId}`);
      try {
        await db.update(users).set({ fcmToken: null }).where(eq(users.id, userId));
      } catch (dbErr) {
        console.error(`[FCM Service] Failed to clear user FCM token:`, dbErr);
      }
    }

    return false;
  }
}
