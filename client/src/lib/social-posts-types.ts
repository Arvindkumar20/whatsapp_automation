import { InstagramPostApi } from "./api/instagram-posts-api";

export type PostPlatform = "instagram" | "facebook" | "threads" | "messenger";
export type PostType = "image" | "video" | "carousel";
export type PostStatus = "draft" | "scheduled" | "published" | "failed";

// Shape PostCard renders — unchanged from the original UI-only version.
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

const FALLBACK_THUMBNAIL = "https://placehold.co/200x200?text=No+Media";

// Maps a raw API post + the connected accounts list (for a human-readable
// "Created By" username) into the shape PostCard already knows how to render.
export function mapApiPostToSocialPost(
  post: InstagramPostApi,
  accountsById: Record<string, { username: string }>
): SocialPost {
  return {
    id: post.id,
    platform: "instagram",
    thumbnailUrl: post.mediaUrls?.[0] || FALLBACK_THUMBNAIL,
    caption: post.caption,
    postType: post.mediaType,
    status: post.status,
    scheduledAt: post.scheduledAt ?? null,
    publishedAt: post.publishedAt ?? null,
    createdBy: accountsById[post.instagramAccountId]?.username
      ? `@${accountsById[post.instagramAccountId].username}`
      : "Instagram",
  };
}
