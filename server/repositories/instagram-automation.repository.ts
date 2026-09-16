import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import {
  instagramAutomations,
  instagramAutomationLogs,
  type InstagramAutomation,
  type InsertInstagramAutomation,
  type InstagramAutomationLog,
  type InsertInstagramAutomationLog,
} from "@shared/schema";

/**
 * Fully independent from the WhatsApp AutomationRepository — no shared
 * tables, no shared methods. Everything here reads/writes only
 * instagram_automations / instagram_automation_logs.
 */
export class InstagramAutomationRepository {
  async createAutomation(
    data: InsertInstagramAutomation
  ): Promise<InstagramAutomation> {
    const [automation] = await db
      .insert(instagramAutomations)
      .values(data)
      .returning();
    return automation;
  }

  async updateAutomation(
    id: string,
    data: Partial<InsertInstagramAutomation>
  ): Promise<InstagramAutomation | undefined> {
    const [automation] = await db
      .update(instagramAutomations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(instagramAutomations.id, id))
      .returning();
    return automation;
  }

  async deleteAutomation(id: string): Promise<boolean> {
    await db.delete(instagramAutomations).where(eq(instagramAutomations.id, id));
    return true;
  }

  // List automations for a channel (mirrors getCampaignsByChannel-style naming)
  async getAutomation(channelId: string): Promise<InstagramAutomation[]> {
    return db
      .select()
      .from(instagramAutomations)
      .where(eq(instagramAutomations.channelId, channelId))
      .orderBy(desc(instagramAutomations.createdAt));
  }

  async getAutomationById(id: string): Promise<InstagramAutomation | undefined> {
    const [automation] = await db
      .select()
      .from(instagramAutomations)
      .where(eq(instagramAutomations.id, id));
    return automation;
  }

  // Automations the webhook processor should evaluate for an incoming
  // comment on a specific Instagram account.
  async getActiveAutomations(accountId: string): Promise<InstagramAutomation[]> {
    return db
      .select()
      .from(instagramAutomations)
      .where(
        and(
          eq(instagramAutomations.accountId, accountId),
          eq(instagramAutomations.status, "active"),
          eq(instagramAutomations.triggerType, "new_comment")
        )
      );
  }

  async createExecutionLog(
    data: InsertInstagramAutomationLog
  ): Promise<InstagramAutomationLog> {
    const [log] = await db
      .insert(instagramAutomationLogs)
      .values(data)
      .returning();
    return log;
  }

  async getExecutionLogs(automationId?: string): Promise<InstagramAutomationLog[]> {
    if (automationId) {
      return db
        .select()
        .from(instagramAutomationLogs)
        .where(eq(instagramAutomationLogs.automationId, automationId))
        .orderBy(desc(instagramAutomationLogs.createdAt));
    }
    return db
      .select()
      .from(instagramAutomationLogs)
      .orderBy(desc(instagramAutomationLogs.createdAt));
  }

  // "Run once per Instagram user" check — has this automation already
  // produced a successful execution for this commenter?
  async hasAlreadyExecuted(
    automationId: string,
    instagramUserId: string
  ): Promise<boolean> {
    const [existing] = await db
      .select({ id: instagramAutomationLogs.id })
      .from(instagramAutomationLogs)
      .where(
        and(
          eq(instagramAutomationLogs.automationId, automationId),
          eq(instagramAutomationLogs.instagramUserId, instagramUserId),
          eq(instagramAutomationLogs.executionStatus, "success")
        )
      );
    return !!existing;
  }

  // Duplicate-webhook guard — Meta can redeliver the same comment event.
  // If ANY log already exists for this commentId, the event was already
  // processed (regardless of which automation(s) matched it).
  async hasCommentBeenProcessed(commentId: string): Promise<boolean> {
    const [existing] = await db
      .select({ id: instagramAutomationLogs.id })
      .from(instagramAutomationLogs)
      .where(eq(instagramAutomationLogs.commentId, commentId));
    return !!existing;
  }
}

export const instagramAutomationRepository = new InstagramAutomationRepository();
