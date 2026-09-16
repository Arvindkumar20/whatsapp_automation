export type PostPlatform = "instagram" | "facebook" | "threads" | "messenger";
export type PostType = "image" | "video" | "carousel";
export type PostStatus = "draft" | "scheduled" | "published" | "failed";

export interface SocialPost {
  id: string;
  platform: PostPlatform;
  thumbnailUrl: string;
  caption: string;
  postType: PostType;
  status: PostStatus;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  createdBy: string;
}

// TODO: replace with a real query (e.g. useQuery(["/api/social-posts", filters]))
// This mock data exists only so the UI has something to render before the
// backend endpoint is wired up.
export const MOCK_POSTS: SocialPost[] = [
  {
    id: "post_1",
    platform: "instagram",
    thumbnailUrl: "https://picsum.photos/seed/post1/200/200",
    caption:
      "Behind the scenes of our new product shoot \u2728 Can't wait for you all to see the full campaign next week!",
    postType: "carousel",
    status: "scheduled",
    scheduledAt: "2026-08-07T10:30:00Z",
    publishedAt: null,
    createdBy: "Atull Sen",
  },
  {
    id: "post_2",
    platform: "instagram",
    thumbnailUrl: "https://picsum.photos/seed/post2/200/200",
    caption: "Weekend sale is live! Use code WEEKEND20 for 20% off storewide.",
    postType: "image",
    status: "published",
    scheduledAt: null,
    publishedAt: "2026-08-02T09:00:00Z",
    createdBy: "Atull Sen",
  },
  {
    id: "post_3",
    platform: "instagram",
    thumbnailUrl: "https://picsum.photos/seed/post3/200/200",
    caption: "Quick tutorial on how to style our new collection for everyday wear.",
    postType: "video",
    status: "draft",
    scheduledAt: null,
    publishedAt: null,
    createdBy: "Atull Sen",
  },
  {
    id: "post_4",
    platform: "instagram",
    thumbnailUrl: "https://picsum.photos/seed/post4/200/200",
    caption: "Customer spotlight: see how @rider_studio used our gear on their latest shoot.",
    postType: "image",
    status: "failed",
    scheduledAt: "2026-08-03T14:00:00Z",
    publishedAt: null,
    createdBy: "Priya Shah",
  },
];
