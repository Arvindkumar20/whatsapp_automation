import type { Express } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middlewares/auth.middleware";

function parseKeywords(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((k) => String(k).trim()).filter(Boolean);
  }
  if (typeof input === "string") {
    // Support comma-separated keyword input from the UI.
    return input
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }
  return [];
}

export function registerInstagramAutomationRoutes(app: Express) {
  // GET /api/instagram/automations?channelId=xxx
  app.get("/api/instagram/automations", requireAuth, async (req: any, res) => {
    try {
      const { channelId } = req.query;
      if (!channelId) {
        return res.status(400).json({ message: "channelId is required" });
      }

      const automations = await storage.getInstagramAutomations(String(channelId));
      res.json({ success: true, data: automations });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to fetch Instagram automations",
      });
    }
  });

  // POST /api/instagram/automations
  app.post("/api/instagram/automations", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const {
        name,
        channelId,
        accountId,
        triggerType,
        keywords,
        matchType,
        caseInsensitive,
        replyComment,
        replyCommentMessage,
        sendDm,
        dmMessage,
        delaySeconds,
        runOnce,
        status,
      } = req.body || {};

      if (!name) return res.status(400).json({ message: "name is required" });
      if (!channelId) return res.status(400).json({ message: "channelId is required" });
      if (!accountId) return res.status(400).json({ message: "accountId is required" });

      const automation = await storage.createInstagramAutomation({
        name,
        channelId,
        accountId,
        triggerType: triggerType || "new_comment",
        keywords: parseKeywords(keywords),
        matchType: matchType || "contains",
        caseInsensitive: caseInsensitive ?? true,
        replyComment: !!replyComment,
        replyCommentMessage: replyCommentMessage || null,
        sendDm: !!sendDm,
        dmMessage: dmMessage || null,
        delaySeconds: Number(delaySeconds) || 0,
        runOnce: runOnce ?? true,
        status: status || "active",
        createdBy: userId,
      });

      res.json({ success: true, data: automation });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to create Instagram automation",
      });
    }
  });

  // PATCH /api/instagram/automations/:id
  app.patch("/api/instagram/automations/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;

      const existing = await storage.getInstagramAutomationById(id);
      if (!existing) {
        return res.status(404).json({ message: "Instagram automation not found" });
      }

      const updates: Record<string, any> = { ...req.body };
      if ("keywords" in req.body) {
        updates.keywords = parseKeywords(req.body.keywords);
      }
      if ("delaySeconds" in req.body) {
        updates.delaySeconds = Number(req.body.delaySeconds) || 0;
      }

      const updated = await storage.updateInstagramAutomation(id, updates);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to update Instagram automation",
      });
    }
  });

  // DELETE /api/instagram/automations/:id
  app.delete("/api/instagram/automations/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;

      const existing = await storage.getInstagramAutomationById(id);
      if (!existing) {
        return res.status(404).json({ message: "Instagram automation not found" });
      }

      await storage.deleteInstagramAutomation(id);
      res.json({ success: true, message: "Instagram automation deleted" });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to delete Instagram automation",
      });
    }
  });

  // GET /api/instagram/automation-logs?automationId=xxx (optional filter)
  app.get("/api/instagram/automation-logs", requireAuth, async (req: any, res) => {
    try {
      const { automationId } = req.query;
      const logs = await storage.getInstagramAutomationLogs(
        automationId ? String(automationId) : undefined
      );
      res.json({ success: true, data: logs });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to fetch Instagram automation logs",
      });
    }
  });
}
