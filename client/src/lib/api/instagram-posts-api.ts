import { apiRequest } from "@/lib/queryClient";

export type PostType = "image" | "video" | "carousel";
export type PostStatus = "draft" | "scheduled" | "published" | "failed";
export type PublishType = "now" | "scheduled" | "draft";

// Shape returned by the existing backend (adjust here only, never in components,
// if the actual response differs — everything downstream reads this type).
export interface InstagramPostApi {
  id: string;
  channelId: string;
  accountId: string;
  createdBy: string;
  caption: string;
  mediaType: PostType;
  mediaUrls: string[];
  thumbnailUrl: string | null;
  hashtags: string[];
  firstComment: string | null;
  locationId: string | null;
  collaborators: string[];
  publishType: PublishType;
  status: PostStatus;
  instagramMediaId: string | null;
  instagramPostId: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstagramPostPayload {
  accountId: string;
  channelId: string;
  caption: string;
  mediaType: PostType;
  mediaUrls: string[];
  publishType: PublishType;
  scheduledAt?: string | null;
  hashtags?: string[];
  firstComment?: string | null;
  locationId?: string | null;
  collaborators?: string[];
}

export interface InstagramPostsListResponse {
  data: InstagramPostApi[];
  total?: number;
  page?: number;
  limit?: number;
}

export async function getInstagramPosts(params: {
  channelId: string;
  page?: number;
  limit?: number;
}): Promise<InstagramPostsListResponse> {
  const query = new URLSearchParams({
    channelId: params.channelId,
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 10),
  });
  const response = await apiRequest("GET", `/api/instagram/posts?${query.toString()}`);
  return response.json();
}

export async function getInstagramPost(id: string): Promise<InstagramPostApi> {
  const response = await apiRequest("GET", `/api/instagram/posts/${id}`);
  const json = await response.json();
  return json.data ?? json;
}

export async function createInstagramPost(
  payload: CreateInstagramPostPayload
): Promise<InstagramPostApi> {
  const response = await apiRequest("POST", "/api/instagram/posts", payload);
  const json = await response.json();
  return json.data ?? json;
}

export async function updateInstagramPost(
  id: string,
  payload: Partial<CreateInstagramPostPayload>
): Promise<InstagramPostApi> {
  const response = await apiRequest("PATCH", `/api/instagram/posts/${id}`, payload);
  const json = await response.json();
  return json.data ?? json;
}

export async function deleteInstagramPost(id: string): Promise<void> {
  await apiRequest("DELETE", `/api/instagram/posts/${id}`);
}



export async function publishInstagramPost(
  id: string
): Promise<InstagramPostApi> {
  const response = await apiRequest(
    "POST",
    `/api/instagram/posts/${id}/publish`
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "Failed to publish post");
  }

  return json.data;
}

// ── Media upload ─────────────────────────────────────────────────────────
// Reads the CSRF cookie the same way the server's csrfMiddleware expects it
// echoed back: a non-HttpOnly cookie read by client JS and sent as the
// X-CSRF-Token header (double-submit pattern). apiRequest presumably does
// this already for JSON calls — this does the same for the one raw fetch()
// in this module (FormData can't go through apiRequest's JSON body).
function getCsrfTokenFromCookie(): string | undefined {
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

// ASSUMPTION: no upload endpoint was specified for this task. This posts to
// the same multipart endpoint the rest of the app already uses for media
// (per the existing multer/DigitalOcean upload middleware). Point this at
// your actual endpoint if it differs — nothing else in this module needs
// to change.
export async function uploadInstagramMedia(
  files: File[]
): Promise<string[]> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("mediaFile", file);
  });

  const csrfToken = getCsrfTokenFromCookie();

  const response = await fetch("/api/instagram/upload-media", {
    method: "POST",
    credentials: "include",
    headers: csrfToken
      ? {
          "x-csrf-token": csrfToken,
        }
      : undefined,
    body: formData,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(
      json.message || "Failed to upload media"
    );
  }

  return json.urls;
}