// import { storage } from "../storage";

// const GRAPH_VERSION = process.env.WHATSAPP_API_VERSION || "v25.0";
// const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

// export class InstagramPublishService {

//   async publish(postId: string) {

//     const post = await storage.getInstagramPost(postId);

//     if (!post) {
//       throw new Error("Post not found");
//     }

//     if (post.status === "published") {
//       throw new Error("Post already published");
//     }

//     const account = await storage.getInstagramAccount(post.accountId);

//     console.log("===== Instagram Account =====");
//     console.log(account);

//     if (!account) {
//       throw new Error("Instagram account not found");
//     }

//     const igUserId =
//       account.instagramUserId ||
//       account.instagramBusinessId;

//     console.log("IG User ID:", igUserId);
//     console.log("Access Token:", account.accessToken);  

//     if (!igUserId) {
//       throw new Error("Instagram user id missing");
//     }

//     let creationId: string;

//     switch (post.mediaType) {

//       case "image":
//         creationId = await this.createImageContainer(
//           igUserId,
//           account.accessToken,
//           post.mediaUrls[0],
//           post.caption
//         );
//         break;

//       case "video":
//         creationId = await this.createVideoContainer(
//           igUserId,
//           account.accessToken,
//           post.mediaUrls[0],
//           post.caption
//         );
//         break;

//       case "carousel":
//         creationId = await this.createCarouselContainer(
//           igUserId,
//           account.accessToken,
//           post.mediaUrls,
//           post.caption
//         );
//         break;

//       default:
//         throw new Error("Unsupported media type");
//     }

//     await this.waitUntilReady(
//       creationId,
//       account.accessToken
//     );

//     console.log("IG User ID:", igUserId);
//     console.log("Access Token:", account.accessToken);

//     const publishId = await this.publishContainer(
//       igUserId,
//       creationId,
//       account.accessToken
//     );

//     return await storage.updateInstagramPost(post.id, {
//       status: "published",
//       instagramMediaId: creationId,
//       instagramPostId: publishId,
//       publishedAt: new Date(),
//       updatedAt: new Date(),
//     });
//   }

//   private async createImageContainer(
//     igUserId: string,
//     token: string,
//     imageUrl: string,
//     caption: string
//   ) {

//     const res = await fetch(`${GRAPH_BASE}/${igUserId}/media`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         image_url: imageUrl,
//         caption,
//         access_token: token,
//       }),
//     });

//     const json: any = await res.json();

//     if (!res.ok || json.error) {
//       throw new Error(json.error?.message || "Image upload failed");
//     }

//     return json.id;
//   }

//   private async createVideoContainer(
//     igUserId: string,
//     token: string,
//     videoUrl: string,
//     caption: string
//   ) {

//     const res = await fetch(`${GRAPH_BASE}/${igUserId}/media`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         media_type: "VIDEO",
//         video_url: videoUrl,
//         caption,
//         access_token: token,
//       }),
//     });

//     const json: any = await res.json();

//     if (!res.ok || json.error) {
//       throw new Error(json.error?.message || "Video upload failed");
//     }

//     return json.id;
//   }

//   private async createCarouselContainer(
//     igUserId: string,
//     token: string,
//     mediaUrls: string[],
//     caption: string
//   ) {

//     const children: string[] = [];

//     for (const url of mediaUrls) {

//       const res = await fetch(`${GRAPH_BASE}/${igUserId}/media`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           image_url: url,
//           is_carousel_item: true,
//           access_token: token,
//         }),
//       });

//       const json: any = await res.json();

//       if (!res.ok || json.error) {
//         throw new Error(json.error?.message);
//       }

//       children.push(json.id);
//     }

//     const res = await fetch(`${GRAPH_BASE}/${igUserId}/media`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         media_type: "CAROUSEL",
//         caption,
//         children,
//         access_token: token,
//       }),
//     });

//     const json: any = await res.json();

//     if (!res.ok || json.error) {
//       throw new Error(json.error?.message);
//     }

//     return json.id;
//   }

//   private async waitUntilReady(
//     creationId: string,
//     token: string
//   ) {

//     for (let i = 0; i < 15; i++) {

//       const res = await fetch(
//         `${GRAPH_BASE}/${creationId}?fields=status_code&access_token=${token}`
//       );

//       const json: any = await res.json();

//       if (json.status_code === "FINISHED") {
//         return;
//       }

//       await new Promise((r) => setTimeout(r, 2000));
//     }

//     throw new Error("Instagram media processing timeout");
//   }

//   private async publishContainer(
//     igUserId: string,
//     creationId: string,
//     token: string
//   ) {

//     const res = await fetch(
//       `${GRAPH_BASE}/${igUserId}/media_publish`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           creation_id: creationId,
//           access_token: token,
//         }),
//       }
//     );

//     const json: any = await res.json();

//     if (!res.ok || json.error) {
//       throw new Error(json.error?.message);
//     }

//     return json.id;
//   }
// }

// export const instagramPublishService =
//   new InstagramPublishService();








import { storage } from "../storage";

// IMPORTANT: accounts connected via the Instagram Login flow (authMethod:
// "instagram_login") get an access token that is only valid against
// graph.instagram.com — NOT graph.facebook.com. Sending that token to
// graph.facebook.com is exactly what produces:
//   "Invalid OAuth access token - Cannot parse access token"
// This mirrors the base URL already used correctly in the Instagram OAuth
// routes file (IG_GRAPH_BASE).
const GRAPH_VERSION = process.env.INSTAGRAM_API_VERSION || "v21.0";
const GRAPH_BASE = `https://graph.instagram.com/${GRAPH_VERSION}`;

export class InstagramPublishService {

  async publish(postId: string) {

    const post = await storage.getInstagramPost(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.status === "published") {
      throw new Error("Post already published");
    }

    const account = await storage.getInstagramAccount(post.accountId);

    console.log("===== Instagram Account =====");
    console.log(account);

    if (!account) {
      throw new Error("Instagram account not found");
    }

    // For Instagram Login accounts this MUST be instagramUserId (the numeric
    // id from graph.instagram.com /me) — instagramBusinessId is the legacy
    // Facebook-Page-linked id and won't resolve against this host.
    const igUserId =
      account.authMethod === "instagram_login"
        ? account.instagramUserId
        : account.instagramUserId || account.instagramBusinessId;

    console.log("IG User ID:", igUserId);
    console.log("Auth Method:", account.authMethod);

    if (!igUserId) {
      throw new Error("Instagram user id missing");
    }

    let creationId: string;

    switch (post.mediaType) {

      case "image":
        creationId = await this.createImageContainer(
          igUserId,
          account.accessToken,
          post.mediaUrls[0],
          post.caption
        );
        break;

      case "video":
        creationId = await this.createVideoContainer(
          igUserId,
          account.accessToken,
          post.mediaUrls[0],
          post.caption
        );
        break;

      case "carousel":
        creationId = await this.createCarouselContainer(
          igUserId,
          account.accessToken,
          post.mediaUrls,
          post.caption
        );
        break;

      default:
        throw new Error("Unsupported media type");
    }

    await this.waitUntilReady(
      creationId,
      account.accessToken
    );

    const publishId = await this.publishContainer(
      igUserId,
      creationId,
      account.accessToken
    );

    return await storage.updateInstagramPost(post.id, {
      status: "published",
      instagramMediaId: creationId,
      instagramPostId: publishId,
      publishedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private async createImageContainer(
    igUserId: string,
    token: string,
    imageUrl: string,
    caption: string
  ) {

    const res = await fetch(`${GRAPH_BASE}/${igUserId}/media`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: token,
      }),
    });

    const json: any = await res.json();

    if (!res.ok || json.error) {
      throw new Error(json.error?.message || "Image upload failed");
    }

    return json.id;
  }

  private async createVideoContainer(
    igUserId: string,
    token: string,
    videoUrl: string,
    caption: string
  ) {

    const res = await fetch(`${GRAPH_BASE}/${igUserId}/media`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        media_type: "VIDEO",
        video_url: videoUrl,
        caption,
        access_token: token,
      }),
    });

    const json: any = await res.json();

    if (!res.ok || json.error) {
      throw new Error(json.error?.message || "Video upload failed");
    }

    return json.id;
  }

  private async createCarouselContainer(
    igUserId: string,
    token: string,
    mediaUrls: string[],
    caption: string
  ) {

    const children: string[] = [];

    for (const url of mediaUrls) {

      const res = await fetch(`${GRAPH_BASE}/${igUserId}/media`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: url,
          is_carousel_item: true,
          access_token: token,
        }),
      });

      const json: any = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error?.message);
      }

      children.push(json.id);
    }

    const res = await fetch(`${GRAPH_BASE}/${igUserId}/media`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        media_type: "CAROUSEL",
        caption,
        children,
        access_token: token,
      }),
    });

    const json: any = await res.json();

    if (!res.ok || json.error) {
      throw new Error(json.error?.message);
    }

    return json.id;
  }

  private async waitUntilReady(
    creationId: string,
    token: string
  ) {

    for (let i = 0; i < 15; i++) {

      const res = await fetch(
        `${GRAPH_BASE}/${creationId}?fields=status_code&access_token=${token}`
      );

      const json: any = await res.json();

      if (json.status_code === "FINISHED") {
        return;
      }

      await new Promise((r) => setTimeout(r, 2000));
    }

    throw new Error("Instagram media processing timeout");
  }

  private async publishContainer(
    igUserId: string,
    creationId: string,
    token: string
  ) {

    const res = await fetch(
      `${GRAPH_BASE}/${igUserId}/media_publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: token,
        }),
      }
    );

    const json: any = await res.json();

    if (!res.ok || json.error) {
      throw new Error(json.error?.message);
    }

    return json.id;
  }
}

export const instagramPublishService =
  new InstagramPublishService();