/**
 * Auto-publishes scheduled Instagram posts.
 *
 * Mirrors the existing `startScheduledCampaignCron` pattern: every minute,
 * find posts that are still "scheduled" but whose scheduledAt time has
 * passed, then publish them via the same instagramPublishService used by
 * the manual "Publish Now" action.
 *
 * ASSUMPTION: this queries a Drizzle table exported as `instagramPosts`
 * from "@shared/schema" with columns matching the InstagramPostApi shape
 * (id, status, scheduledAt, ...). If your actual export name or column
 * names differ, adjust the import and the `eq`/`lte` column references
 * below — nothing else needs to change.
 */

import cron from "node-cron";
import { and, eq, lte } from "drizzle-orm";
import { db } from "../db";
import { instagramPosts } from "@shared/schema";
import { instagramPublishService } from "../services/instagram-publish.service";
import { storage } from "../storage";

export function startScheduledInstagramPostsCron() {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const duePosts = await db
        .select()
        .from(instagramPosts)
        .where(
          and(
            eq(instagramPosts.status, "scheduled"),
            lte(instagramPosts.scheduledAt, now)
          )
        );

      if (duePosts.length > 0) {
        console.log(`[InstagramScheduledCron] Found ${duePosts.length} post(s) due for publishing`);
      }

      for (const post of duePosts) {
        try {
          console.log(`[InstagramScheduledCron] Publishing post ${post.id} (scheduled for ${post.scheduledAt?.toISOString()})`);
          await instagramPublishService.publish(post.id);
          console.log(`[InstagramScheduledCron] Post ${post.id} published OK`);
        } catch (err: any) {
          console.error(`[InstagramScheduledCron] Failed to publish post ${post.id}:`, err.message || err);
          // Mark as failed rather than leaving it stuck in "scheduled" forever
          // so it doesn't get retried every minute and shows correctly in the UI.
          await storage
            .updateInstagramPost(post.id, {
              status: "failed",
              updatedAt: new Date(),
            })
            .catch(() => {});
        }
      }
    } catch (error) {
      console.error("[InstagramScheduledCron] Unhandled error:", error);
    }
  });
}