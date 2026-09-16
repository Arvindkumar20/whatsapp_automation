import { storage } from "../storage";
import { replyToComment, sendDM } from "./instagram-graph.service";
import type { InstagramAutomation } from "@shared/schema";

export interface IncomingCommentEvent {
  commentId: string;
  commentText: string;
  instagramUserId: string; // the commenter's IG-scoped id
  username?: string;
  accountId: string; // your instagram_accounts.id that owns the media
}

function normalizeKeywords(automation: InstagramAutomation): string[] {
  return (automation.keywords ?? [])
    .map((k) => (k ?? "").trim())
    .filter((k) => k.length > 0);
}

function matches(commentText: string, automation: InstagramAutomation): boolean {
  const keywords = normalizeKeywords(automation);
  if (keywords.length === 0) return false;

  const text = automation.caseInsensitive ? commentText.toLowerCase() : commentText;

  return keywords.some((rawKeyword) => {
    const keyword = automation.caseInsensitive ? rawKeyword.toLowerCase() : rawKeyword;

    switch (automation.matchType) {
      case "equals":
        return text.trim() === keyword.trim();
      case "starts_with":
        return text.trim().startsWith(keyword.trim());
      case "contains":
      default:
        return text.includes(keyword);
    }
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class InstagramAutomationService {
  /**
   * Entry point called from the Instagram webhook handler whenever a new
   * comment event arrives.
   */
  async processComment(event: IncomingCommentEvent): Promise<void> {
    console.log("========================================");
    console.log("[InstagramAutomation] processComment() called");
    console.log("[InstagramAutomation] event:", JSON.stringify(event));
    console.log("========================================");

    // 1. Ignore duplicate webhook deliveries for a comment we've already processed.
    const alreadyProcessed = await storage.hasInstagramCommentBeenProcessed(
      event.commentId
    );
    console.log(
      `[InstagramAutomation] Duplicate check for comment ${event.commentId}: alreadyProcessed=${alreadyProcessed}`
    );
    if (alreadyProcessed) {
      console.log(
        `[InstagramAutomation] SKIP — comment ${event.commentId} already processed (duplicate webhook)`
      );
      return;
    }

    // 2. Load active automations for this Instagram account.
    const automations = await storage.getActiveInstagramAutomations(event.accountId);
    console.log(
      `[InstagramAutomation] Active automations for account ${event.accountId}: ${automations.length}`,
      automations.map((a) => ({ id: a.id, name: a.name, keywords: a.keywords }))
    );

    if (automations.length === 0) {
      console.log(
        `[InstagramAutomation] No active automations for account ${event.accountId} — nothing to do`
      );
      return;
    }

    const account = await storage.getInstagramAccount(event.accountId);
    if (!account) {
      console.error(
        `[InstagramAutomation] ERROR — Instagram account ${event.accountId} not found, cannot execute actions`
      );
      return;
    }
    console.log(
      `[InstagramAutomation] Loaded account: username=${account.username} authMethod=${account.authMethod}`
    );

    for (const automation of automations) {
      console.log(`[InstagramAutomation] Evaluating automation "${automation.name}" (${automation.id})`);
      await this.evaluateAndExecute(automation, event, account);
    }

    console.log("[InstagramAutomation] processComment() finished for comment", event.commentId);
  }

  private async evaluateAndExecute(
    automation: InstagramAutomation,
    event: IncomingCommentEvent,
    account: { accessToken: string; instagramUserId?: string | null; instagramBusinessId: string; username?: string }
  ): Promise<void> {
    // 3. Keyword match.
    const isMatch = matches(event.commentText, automation);
    console.log(
      `[InstagramAutomation] [${automation.name}] Match check — text="${event.commentText}" keywords=${JSON.stringify(
        automation.keywords
      )} matchType=${automation.matchType} caseInsensitive=${automation.caseInsensitive} => isMatch=${isMatch}`
    );

    if (!isMatch) {
      await storage.createInstagramAutomationLog({
        automationId: automation.id,
        commentId: event.commentId,
        instagramUserId: event.instagramUserId,
        username: event.username,
        commentText: event.commentText,
        executionStatus: "skipped_no_match",
        executedAt: new Date(),
      });
      console.log(`[InstagramAutomation] [${automation.name}] SKIP — no keyword match, logged`);
      return;
    }

    // 4. Run-once-per-user enforcement.
    if (automation.runOnce) {
      const alreadyRan = await storage.hasInstagramAutomationAlreadyExecuted(
        automation.id,
        event.instagramUserId
      );
      console.log(
        `[InstagramAutomation] [${automation.name}] Run-once check for user ${event.instagramUserId}: alreadyRan=${alreadyRan}`
      );
      if (alreadyRan) {
        await storage.createInstagramAutomationLog({
          automationId: automation.id,
          commentId: event.commentId,
          instagramUserId: event.instagramUserId,
          username: event.username,
          commentText: event.commentText,
          executionStatus: "skipped_run_once",
          executedAt: new Date(),
        });
        console.log(`[InstagramAutomation] [${automation.name}] SKIP — already executed once for this user, logged`);
        return;
      }
    }

    // 5. Optional delay before executing actions.
    if (automation.delaySeconds && automation.delaySeconds > 0) {
      console.log(`[InstagramAutomation] [${automation.name}] Delaying ${automation.delaySeconds}s before executing actions`);
      await sleep(automation.delaySeconds * 1000);
    }

    // 6. Execute configured actions.
    const igUserId = account.instagramUserId || account.instagramBusinessId;
    const errors: string[] = [];

    console.log(
      `[InstagramAutomation] [${automation.name}] Executing actions — replyComment=${automation.replyComment} sendDm=${automation.sendDm}`
    );

    if (automation.replyComment) {
      console.log(`[InstagramAutomation] [${automation.name}] Calling replyToComment(${event.commentId})`);
      const result = await replyToComment(
        event.commentId,
        automation.replyCommentMessage || "",
        account.accessToken
      );
      console.log(`[InstagramAutomation] [${automation.name}] replyToComment result:`, result);
      if (!result.success) errors.push(`reply: ${result.error}`);
    }

    if (automation.sendDm) {
      console.log(
        `[InstagramAutomation] [${automation.name}] Calling sendDM(igUserId=${igUserId}, recipient=${event.instagramUserId})`
      );
      const result = await sendDM(
        igUserId,
        event.instagramUserId,
        automation.dmMessage || "",
        account.accessToken
      );
      console.log(`[InstagramAutomation] [${automation.name}] sendDM result:`, result);
      if (!result.success) errors.push(`dm: ${result.error}`);
    }

    // 7. Log the outcome.
    const finalStatus = errors.length > 0 ? "failed" : "success";
    console.log(
      `[InstagramAutomation] [${automation.name}] Execution ${finalStatus}${errors.length ? " — " + errors.join("; ") : ""}`
    );

    await storage.createInstagramAutomationLog({
      automationId: automation.id,
      commentId: event.commentId,
      instagramUserId: event.instagramUserId,
      username: event.username,
      commentText: event.commentText,
      executionStatus: finalStatus,
      error: errors.length > 0 ? errors.join("; ") : null,
      executedAt: new Date(),
    });
  }
}

export const instagramAutomationService = new InstagramAutomationService();