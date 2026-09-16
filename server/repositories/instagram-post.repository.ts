import { db } from "../db";
import { eq, desc, sql, lte, and } from "drizzle-orm";
import {
  instagramPosts,
  type InstagramPost,
  type InsertInstagramPost,
} from "@shared/schema";

export class InstagramPostRepository {
  async getAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: InstagramPost[];
    total: number;
    page: number;
    limit: number;
  }> {
    const offset = (page - 1) * limit;

    const data = await db
      .select()
      .from(instagramPosts)
      .orderBy(desc(instagramPosts.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({
        total: sql<number>`COUNT(*)`,
      })
      .from(instagramPosts);

    return {
      data,
      total: totalResult[0]?.total ?? 0,
      page,
      limit,
    };
  }

  async getByChannel(
    channelId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const offset = (page - 1) * limit;

    const data = await db
      .select()
      .from(instagramPosts)
      .where(eq(instagramPosts.channelId, channelId))
      .orderBy(desc(instagramPosts.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db
      .select({
        total: sql<number>`COUNT(*)`,
      })
      .from(instagramPosts)
      .where(eq(instagramPosts.channelId, channelId));

    return {
      data,
      total: Number(total),
      page,
      limit,
    };
  }

  async getById(id: string): Promise<InstagramPost | undefined> {
    const [post] = await db
      .select()
      .from(instagramPosts)
      .where(eq(instagramPosts.id, id));

    return post || undefined;
  }

  async create(
    insertPost: InsertInstagramPost
  ): Promise<InstagramPost> {
    const [post] = await db
      .insert(instagramPosts)
      .values(insertPost)
      .returning();

    return post;
  }

  async update(
    id: string,
    data: Partial<InstagramPost>
  ): Promise<InstagramPost | undefined> {
    const [updated] = await db
      .update(instagramPosts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(instagramPosts.id, id))
      .returning();

    return updated || undefined;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(instagramPosts)
      .where(eq(instagramPosts.id, id))
      .returning();

    return result.length > 0;
  }

  async getScheduledPosts(): Promise<InstagramPost[]> {
    return await db
      .select()
      .from(instagramPosts)
      .where(
        and(
          eq(instagramPosts.status, "scheduled"),
          lte(instagramPosts.scheduledAt, new Date())
        )
      )
      .orderBy(instagramPosts.scheduledAt);
  }

  async updateStatus(
    id: string,
    status: string
  ): Promise<void> {
    await db
      .update(instagramPosts)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(instagramPosts.id, id));
  }

  async getDrafts(channelId: string): Promise<InstagramPost[]> {
    return await db
      .select()
      .from(instagramPosts)
      .where(
        and(
          eq(instagramPosts.channelId, channelId),
          eq(instagramPosts.status, "draft")
        )
      )
      .orderBy(desc(instagramPosts.createdAt));
  }
}