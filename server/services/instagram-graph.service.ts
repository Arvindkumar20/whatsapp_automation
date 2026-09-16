/**
 * Small, dependency-free wrapper around the two Graph API calls the
 * Instagram Automation module needs. Uses graph.instagram.com — same host
 * as the rest of the Instagram Login integration (see the OAuth routes
 * file's IG_GRAPH_BASE) — NOT graph.facebook.com.
 */

const GRAPH_API_VERSION = "v21.0";
const IG_GRAPH_BASE = `https://graph.instagram.com/${GRAPH_API_VERSION}`;

export interface GraphApiResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Reply to a specific Instagram comment.
 * POST /{comment-id}/replies
 */
export async function replyToComment(
  commentId: string,
  message: string,
  accessToken: string
): Promise<GraphApiResult> {
  try {
    const res = await fetch(`${IG_GRAPH_BASE}/${commentId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, access_token: accessToken }),
    });

    const json: any = await res.json();

    if (!res.ok || json.error) {
      return { success: false, error: json.error?.message || "Failed to reply to comment" };
    }

    return { success: true, data: json };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error replying to comment" };
  }
}

/**
 * Send an Instagram DM to a user, scoped to the sending IG account.
 * POST /{ig-user-id}/messages
 *
 * Note: Meta only allows sending a DM to a user within the 24h/7-day
 * messaging window opened by that user's own message/comment — this is
 * a platform policy, not something this function can bypass.
 */
export async function sendDM(
  igUserId: string,
  recipientId: string,
  message: string,
  accessToken: string
): Promise<GraphApiResult> {
  try {
    const res = await fetch(`${IG_GRAPH_BASE}/${igUserId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: message },
        access_token: accessToken,
      }),
    });

    const json: any = await res.json();

    if (!res.ok || json.error) {
      return { success: false, error: json.error?.message || "Failed to send Instagram DM" };
    }

    return { success: true, data: json };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error sending Instagram DM" };
  }
}
