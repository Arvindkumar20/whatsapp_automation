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

import { Request, Response } from "express";
import { db } from "../db";
import { firebaseConfig } from "@shared/schema";
import { eq } from "drizzle-orm";

// Fetch the system-wide Firebase configuration
export const getFirebaseConfig = async (req: Request, res: Response) => {
  try {
    const config = await db.select().from(firebaseConfig).limit(1);
    res.json(config[0] || null);
  } catch (error) {
    console.error("Error fetching Firebase config:", error);
    res.status(500).json({ error: "Failed to fetch Firebase settings" });
  }
};

// Update or create the system-wide Firebase configuration
export const updateFirebaseConfig = async (req: Request, res: Response) => {
  try {
    const {
      id,
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      measurementId,
      privateKey,
      clientEmail,
      vapidKey,
    } = req.body;

    const valuesToSet = {
      apiKey: apiKey || null,
      authDomain: authDomain || null,
      projectId: projectId || null,
      storageBucket: storageBucket || null,
      messagingSenderId: messagingSenderId || null,
      appId: appId || null,
      measurementId: measurementId || null,
      privateKey: privateKey || null,
      clientEmail: clientEmail || null,
      vapidKey: vapidKey || null,
      updatedAt: new Date(),
    };

    if (id) {
      // Update existing record
      const result = await db
        .update(firebaseConfig)
        .set(valuesToSet)
        .where(eq(firebaseConfig.id, id))
        .returning();
      res.json(result[0]);
    } else {
      // Check if any config already exists
      const existing = await db.select().from(firebaseConfig).limit(1);
      if (existing.length > 0) {
        const result = await db
          .update(firebaseConfig)
          .set(valuesToSet)
          .where(eq(firebaseConfig.id, existing[0].id))
          .returning();
        res.json(result[0]);
      } else {
        // Insert new record
        const result = await db
          .insert(firebaseConfig)
          .values(valuesToSet)
          .returning();
        res.json(result[0]);
      }
    }
  } catch (error) {
    console.error("Error updating Firebase config:", error);
    res.status(500).json({ error: "Failed to update Firebase settings" });
  }
};
