// import { formatDistanceToNow } from "date-fns";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Instagram,
//   Image as ImageIcon,
//   Video,
//   Images,
//   Clock,
//   CalendarClock,
//   User,
//   MoreVertical,
//   Pencil,
//   Copy,
//   Send,
//   Trash2,
// } from "lucide-react";
// import type { SocialPost } from "@/lib/social-posts-types";

// interface PostCardProps {
//   post: SocialPost;
//   onEdit: (post: SocialPost) => void;
//   onDuplicate: (post: SocialPost) => void;
//   onPublishNow: (post: SocialPost) => void;
//   onDelete: (post: SocialPost) => void;
// }

// const POST_TYPE_META: Record<SocialPost["postType"], { label: string; icon: typeof ImageIcon }> = {
//   image: { label: "Image", icon: ImageIcon },
//   video: { label: "Video", icon: Video },
//   carousel: { label: "Carousel", icon: Images },
// };

// const STATUS_META: Record<SocialPost["status"], { label: string; className: string }> = {
//   draft: { label: "Draft", className: "bg-gray-100 text-gray-600 border-gray-200" },
//   scheduled: { label: "Scheduled", className: "bg-amber-50 text-amber-700 border-amber-200" },
//   published: { label: "Published", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
//   failed: { label: "Failed", className: "bg-red-50 text-red-700 border-red-200" },
// };

// export function PostCard({ post, onEdit, onDuplicate, onPublishNow, onDelete }: PostCardProps) {
//   const typeMeta =
//   POST_TYPE_META[(post as any).mediaType] ??
//   POST_TYPE_META.image;
//   const statusMeta = STATUS_META[post.status];
//   const TypeIcon = typeMeta.icon;

//   return (
//     <div className="border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
//       <div className="flex gap-3 sm:gap-4">
//         <img
//           src={post.thumbnailUrl}
//           alt=""
//           className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0 bg-gray-100"
//         />

//         <div className="flex-1 min-w-0">
//           <div className="flex items-start justify-between gap-2">
//             <div className="flex flex-wrap items-center gap-1.5">
//               <Badge
//                 variant="secondary"
//                 className="text-xs bg-pink-50 text-pink-700 border-pink-200 flex items-center gap-1"
//               >
//                 <Instagram className="w-3 h-3" /> Instagram
//               </Badge>
//               <Badge variant="secondary" className="text-xs flex items-center gap-1">
//                 <TypeIcon className="w-3 h-3" /> {typeMeta.label}
//               </Badge>
//               <Badge variant="secondary" className={`text-xs ${statusMeta.className}`}>
//                 {statusMeta.label}
//               </Badge>
//             </div>

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="sm" className="px-2 h-8 flex-shrink-0">
//                   <MoreVertical className="w-4 h-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem onClick={() => onEdit(post)}>
//                   <Pencil className="w-4 h-4 mr-2" /> Edit
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => onDuplicate(post)}>
//                   <Copy className="w-4 h-4 mr-2" /> Duplicate
//                 </DropdownMenuItem>
//                 {post.status !== "published" && (
//                   <DropdownMenuItem
//                     onClick={() => onPublishNow(post)}
//                     className="text-emerald-600 focus:text-emerald-700"
//                   >
//                     <Send className="w-4 h-4 mr-2" /> Publish Now
//                   </DropdownMenuItem>
//                 )}
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem
//                   onClick={() => onDelete(post)}
//                   className="text-red-600 focus:text-red-700"
//                 >
//                   <Trash2 className="w-4 h-4 mr-2" /> Delete
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>

//           <p className="text-sm text-gray-700 mt-2 line-clamp-2 sm:line-clamp-3">
//             {post.caption}
//           </p>

//           <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
//             {post.scheduledAt && (
//               <span className="flex items-center gap-1">
//                 <CalendarClock className="w-3.5 h-3.5" />
//                 Scheduled {formatDistanceToNow(new Date(post.scheduledAt), { addSuffix: true })}
//               </span>
//             )}
//             {post.publishedAt && (
//               <span className="flex items-center gap-1">
//                 <Clock className="w-3.5 h-3.5" />
//                 Published {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
//               </span>
//             )}
//             <span className="flex items-center gap-1">
//               <User className="w-3.5 h-3.5" />
//               {post.createdBy}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }










import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Instagram,
  Image as ImageIcon,
  Video,
  Images,
  Clock,
  CalendarClock,
  User,
  MoreVertical,
  Pencil,
  Copy,
  Send,
  Trash2,
  AlertCircle,
  Play,
} from "lucide-react";
import type { SocialPost } from "@/lib/social-posts-types";

interface PostCardProps {
  post: SocialPost;
  onEdit: (post: SocialPost) => void;
  onDuplicate: (post: SocialPost) => void;
  onPublishNow: (post: SocialPost) => void;
  onDelete: (post: SocialPost) => void;
}

const POST_TYPE_META: Record<
  "image" | "video" | "carousel",
  { label: string; icon: typeof ImageIcon }
> = {
  image: { label: "Image", icon: ImageIcon },
  video: { label: "Video", icon: Video },
  carousel: { label: "Carousel", icon: Images },
};

const STATUS_META: Record<
  SocialPost["status"],
  { label: string; className: string; dotClassName: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 border-gray-200",
    dotClassName: "bg-gray-400",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-amber-50 text-amber-700 border-amber-200/80",
    dotClassName: "bg-amber-500 animate-pulse",
  },
  published: {
    label: "Published",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dotClassName: "bg-emerald-500",
  },
  failed: {
    label: "Failed",
    className: "bg-rose-50 text-rose-700 border-rose-200/80",
    dotClassName: "bg-rose-500",
  },
};

export function PostCard({
  post,
  onEdit,
  onDuplicate,
  onPublishNow,
  onDelete,
}: PostCardProps) {
  const mediaType = (post as any).mediaType || post.postType || "image";
  const typeMeta = POST_TYPE_META[mediaType as keyof typeof POST_TYPE_META] ?? POST_TYPE_META.image;
  const statusMeta = STATUS_META[post.status] ?? STATUS_META.draft;
  const TypeIcon = typeMeta.icon;

  const mediaCount = (post as any).mediaUrls?.length ?? 0;

  return (
    <div className="group relative border border-gray-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-200 bg-white">
      <div className="flex gap-4">
        {/* Thumbnail Preview Box */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-900 shrink-0 border border-gray-100 shadow-inner">
          {post.thumbnailUrl ? (
            <img
              src={post.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <ImageIcon className="w-6 h-6" />
            </div>
          )}

          {/* Media Type Overlay Indicators */}
          {mediaType === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <div className="w-7 h-7 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-sm backdrop-blur-xs">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
            </div>
          )}

          {mediaType === "carousel" && mediaCount > 1 && (
            <span className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
              1/{mediaCount}
            </span>
          )}
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Header: Platform & Status Badges */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="text-[11px] font-medium bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-purple-500/10 text-rose-700 border-rose-200/60 flex items-center gap-1.5 px-2 py-0.5"
                >
                  <Instagram className="w-3 h-3 text-rose-600" />
                  <span>Instagram</span>
                </Badge>

                <Badge
                  variant="outline"
                  className="text-[11px] font-medium bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-1 px-2 py-0.5"
                >
                  <TypeIcon className="w-3 h-3 text-gray-500" />
                  <span>{typeMeta.label}</span>
                </Badge>

                <Badge
                  variant="outline"
                  className={`text-[11px] font-medium flex items-center gap-1.5 px-2 py-0.5 ${statusMeta.className}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClassName}`} />
                  <span>{statusMeta.label}</span>
                </Badge>
              </div>

              {/* Action Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 shrink-0 -mr-1 -mt-1"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl p-1 shadow-lg">
                  <DropdownMenuItem onClick={() => onEdit(post)} className="rounded-lg text-xs font-medium cursor-pointer">
                    <Pencil className="w-3.5 h-3.5 mr-2 text-gray-500" /> Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(post)} className="rounded-lg text-xs font-medium cursor-pointer">
                    <Copy className="w-3.5 h-3.5 mr-2 text-gray-500" /> Duplicate
                  </DropdownMenuItem>
                  {post.status !== "published" && (
                    <DropdownMenuItem
                      onClick={() => onPublishNow(post)}
                      className="rounded-lg text-xs font-medium text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 mr-2" /> Publish Now
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onClick={() => onDelete(post)}
                    className="rounded-lg text-xs font-medium text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post Caption */}
            <p className="text-xs sm:text-sm text-gray-700 mt-2.5 line-clamp-2 leading-relaxed font-normal">
              {post.caption ? (
                post.caption
              ) : (
                <span className="text-gray-400 italic">No caption provided</span>
              )}
            </p>
          </div>

          {/* Metadata Footer */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-500 font-medium">
            {post.status === "scheduled" && post.scheduledAt && (
              <span className="flex items-center gap-1 text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/50">
                <CalendarClock className="w-3 h-3 text-amber-600" />
                Scheduled {formatDistanceToNow(new Date(post.scheduledAt), { addSuffix: true })}
              </span>
            )}

            {post.status === "published" && post.publishedAt && (
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/50">
                <Clock className="w-3 h-3 text-emerald-600" />
                Published {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
              </span>
            )}

            {post.status === "failed" && (
              <span className="flex items-center gap-1 text-rose-700 bg-rose-50/80 px-2 py-0.5 rounded-md border border-rose-200/50">
                <AlertCircle className="w-3 h-3 text-rose-600" />
                Publishing failed
              </span>
            )}

            {post.createdBy && (
              <span className="flex items-center gap-1 text-gray-500 ml-auto sm:ml-0">
                <User className="w-3 h-3 text-gray-400" />
                {post.createdBy}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}