import { apiRequest } from "@/lib/queryClient";

export type MatchType = "contains" | "equals" | "starts_with";
export type AutomationStatus = "active" | "paused";
export type ExecutionStatus =
  | "matched"
  | "skipped_no_match"
  | "skipped_run_once"
  | "skipped_duplicate"
  | "success"
  | "failed";

export interface InstagramAutomationApi {
  id: string;
  name: string;
  channelId: string;
  accountId: string;
  triggerType: string;
  keywords: string[];
  matchType: MatchType;
  caseInsensitive: boolean;
  replyComment: boolean;
  replyCommentMessage: string | null;
  sendDm: boolean;
  dmMessage: string | null;
  delaySeconds: number;
  runOnce: boolean;
  status: AutomationStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstagramAutomationLogApi {
  id: string;
  automationId: string;
  commentId: string;
  instagramUserId: string;
  username: string | null;
  commentText: string | null;
  executionStatus: ExecutionStatus;
  error: string | null;
  executedAt: string | null;
  createdAt: string;
}

export interface CreateInstagramAutomationPayload {
  name: string;
  channelId: string;
  accountId: string;
  keywords: string[];
  matchType: MatchType;
  caseInsensitive: boolean;
  replyComment: boolean;
  replyCommentMessage?: string | null;
  sendDm: boolean;
  dmMessage?: string | null;
  delaySeconds: number;
  runOnce: boolean;
  status: AutomationStatus;
}

export async function getInstagramAutomations(
  channelId: string
): Promise<InstagramAutomationApi[]> {
  const response = await apiRequest(
    "GET",
    `/api/instagram/automations?channelId=${channelId}`
  );
  const json = await response.json();
  return json.data ?? [];
}

export async function createInstagramAutomation(
  payload: CreateInstagramAutomationPayload
): Promise<InstagramAutomationApi> {
  const response = await apiRequest("POST", "/api/instagram/automations", payload);
  const json = await response.json();
  return json.data ?? json;
}

export async function updateInstagramAutomation(
  id: string,
  payload: Partial<CreateInstagramAutomationPayload>
): Promise<InstagramAutomationApi> {
  const response = await apiRequest("PATCH", `/api/instagram/automations/${id}`, payload);
  const json = await response.json();
  return json.data ?? json;
}

export async function deleteInstagramAutomation(id: string): Promise<void> {
  await apiRequest("DELETE", `/api/instagram/automations/${id}`);
}

export async function getInstagramAutomationLogs(
  automationId?: string
): Promise<InstagramAutomationLogApi[]> {
  const url = automationId
    ? `/api/instagram/automation-logs?automationId=${automationId}`
    : "/api/instagram/automation-logs";
  const response = await apiRequest("GET", url);
  const json = await response.json();
  return json.data ?? [];
}
