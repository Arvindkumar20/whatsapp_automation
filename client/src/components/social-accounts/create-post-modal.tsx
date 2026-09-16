// import { useEffect, useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import { apiRequest } from "@/lib/queryClient";
// import { Loading } from "@/components/ui/loading";
// import { Input } from "@/components/ui/input";
// import {
//   Instagram,
//   Sparkles,
//   Upload,
//   X,
//   Loader2,
//   CalendarClock,
//   Send,
//   FileText,
// } from "lucide-react";
// import {
//   createInstagramPost,
//   updateInstagramPost,
//   getInstagramPost,
//   uploadInstagramMedia,
//   type PostType,
//   type PublishType,
//   type InstagramPostApi,
// } from "@/lib/api/instagram-posts-api";

// type ScheduleMode = "now" | "later";

// interface CreatePostModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   channelId: string;
//   editingPostId?: string | null;
//   onSaved: () => void;
// }

// interface InstagramAccountOption {
//   id: string;
//   username: string;
//   isActive?: boolean;
// }

// function inferPostType(fileCount: number, existingType?: PostType): PostType {
//   if (fileCount > 1) return "carousel";
//   if (fileCount === 1) return existingType ?? "image";
//   return existingType ?? "image";
// }

// export function CreatePostModal({
//   open,
//   onOpenChange,
//   channelId,
//   editingPostId,
//   onSaved,
// }: CreatePostModalProps) {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const isEditMode = !!editingPostId;

//   const [caption, setCaption] = useState("");
//   const [captionTopic, setCaptionTopic] = useState("");
//   const [files, setFiles] = useState<File[]>([]);
//   const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>([]);
//   const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("now");
//   const [date, setDate] = useState("");
//   const [time, setTime] = useState("");
//   const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
//   const [accountId, setAccountId] = useState<string>("");

//   // Connected Instagram accounts — same query key/cache as the Accounts page,
//   // reused here only to populate accountId (required by the create/update payload).
//   const { data: accounts = [] } = useQuery<InstagramAccountOption[]>({
//     queryKey: ["/api/instagram/accounts"],
//     queryFn: async () => {
//       const response = await apiRequest("GET", "/api/instagram/accounts");
//       const json = await response.json();
//       return json.data ?? [];
//     },
//     enabled: open,
//   });

//   // Fetch the full post when opening in edit mode (per spec: GET before PATCH)
//   const { data: editingPost, isLoading: isLoadingPost } = useQuery<InstagramPostApi>({
//     queryKey: ["/api/instagram/posts", editingPostId],
//     queryFn: () => getInstagramPost(editingPostId as string),
//     enabled: open && isEditMode,
//   });

//   useEffect(() => {
//     if (!open) return;

//     if (isEditMode && editingPost) {
//       setCaption(editingPost.caption ?? "");
//       setExistingMediaUrls((editingPost.media ?? []).map((m) => m.url));
//       setFiles([]);
//       setAccountId(editingPost.instagramAccountId ?? "");
//       if (editingPost.scheduledAt) {
//         const d = new Date(editingPost.scheduledAt);
//         setScheduleMode("later");
//         setDate(d.toISOString().slice(0, 10));
//         setTime(d.toISOString().slice(11, 16));
//       } else {
//         setScheduleMode("now");
//         setDate("");
//         setTime("");
//       }
//     } else if (!isEditMode) {
//       setCaption("");
//       setFiles([]);
//       setExistingMediaUrls([]);
//       setScheduleMode("now");
//       setDate("");
//       setTime("");
//       if (!accountId && accounts.length > 0) {
//         setAccountId(accounts[0].id);
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [open, isEditMode, editingPost, accounts]);

//   const resetAndClose = () => {
//     setCaption("");
//     setCaptionTopic("");
//     setFiles([]);
//     setExistingMediaUrls([]);
//     setScheduleMode("now");
//     setDate("");
//     setTime("");
//     onOpenChange(false);
//   };

//   const handleFilesSelected = (fileList: FileList | null) => {
//     if (!fileList) return;
//     setFiles((prev) => [...prev, ...Array.from(fileList)]);
//   };

//   const removeNewFile = (index: number) => {
//     setFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   const removeExistingMedia = (index: number) => {
//     setExistingMediaUrls((prev) => prev.filter((_, i) => i !== index));
//   };

  
//   const handleGenerateCaption = async () => {
//   setIsGeneratingCaption(true);
//   try {
//     const response = await apiRequest("POST", "/api/instagram/generate-caption", {
//       channelId,
//       postType: inferPostType(totalMediaCount),
//       topic: captionTopic.trim() || undefined,
//     });
//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.error || "Failed to generate caption.");
//     }

//     setCaption(data.caption);
//   } catch (error: any) {
//     toast({
//       title: "Caption generation failed",
//       description: error.message || "Could not generate a caption. Check your AI settings.",
//       variant: "destructive",
//     });
//   } finally {
//     setIsGeneratingCaption(false);
//   }
// };

//   const invalidatePostsList = () => {
//     queryClient.invalidateQueries({ queryKey: ["/api/instagram/posts"] });
//   };

//   const createMutation = useMutation({
//     mutationFn: createInstagramPost,
//     onSuccess: () => {
//       invalidatePostsList();
//       toast({ title: "Post saved", description: "Your Instagram post was saved successfully." });
//       onSaved();
//       resetAndClose();
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Failed to save post",
//         description: error.message || "Something went wrong. Please try again.",
//         variant: "destructive",
//       });
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: (payload: Parameters<typeof updateInstagramPost>[1]) =>
//       updateInstagramPost(editingPostId as string, payload),
//     onSuccess: () => {
//       invalidatePostsList();
//       queryClient.invalidateQueries({ queryKey: ["/api/instagram/posts", editingPostId] });
//       toast({ title: "Post updated", description: "Your changes have been saved." });
//       onSaved();
//       resetAndClose();
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Failed to update post",
//         description: error.message || "Something went wrong. Please try again.",
//         variant: "destructive",
//       });
//     },
//   });

//   const isSaving = createMutation.isPending || updateMutation.isPending;
//   const isScheduleValid = scheduleMode === "now" || (!!date && !!time);
//   const totalMediaCount = files.length + existingMediaUrls.length;

//   const buildAndSubmit = async (publishType: PublishType) => {
//     if (!accountId) {
//       toast({
//         title: "Select an Instagram account",
//         description: "Connect or choose an Instagram account before saving this post.",
//         variant: "destructive",
//       });
//       return;
//     }

//     let mediaUrls = existingMediaUrls;
//     if (files.length > 0) {
//       try {
//         const uploadedUrls = await uploadInstagramMedia(files);
//         mediaUrls = [...existingMediaUrls, ...uploadedUrls];
//       } catch (error: any) {
//         toast({
//           title: "Media upload failed",
//           description: error.message || "Could not upload the selected media.",
//           variant: "destructive",
//         });
//         return;
//       }
//     }

//     const scheduledAt =
//       publishType === "scheduled" && date && time ? `${date}T${time}:00` : null;

//     const payload = {
//       accountId,
//       channelId,
//       caption,
//       mediaType: inferPostType(mediaUrls.length),
//       mediaUrls,
//       publishType,
//       scheduledAt,
//       hashtags: [],
//       firstComment: null,
//       locationId: null,
//       collaborators: [],
//     };

//     if (isEditMode) {
//       updateMutation.mutate(payload);
//     } else {
//       createMutation.mutate(payload);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
//       <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>{isEditMode ? "Edit Post" : "Create Post"}</DialogTitle>
//           <DialogDescription>
//             Compose your Instagram post, then publish now or schedule it for later.
//           </DialogDescription>
//         </DialogHeader>

//         {isEditMode && isLoadingPost ? (
//           <Loading />
//         ) : (
//           <div className="space-y-5 mt-2">
//             {/* Platform + Account */}
//             <div>
//               <Label className="text-sm text-gray-700">Platform</Label>
//               <div className="mt-1.5 flex items-center gap-2">
//                 <Badge
//                   variant="secondary"
//                   className="text-xs bg-pink-50 text-pink-700 border-pink-200 flex items-center gap-1 w-fit"
//                 >
//                   <Instagram className="w-3 h-3" /> Instagram
//                 </Badge>

//                 {accounts.length > 1 && (
//                   <select
//                     value={accountId}
//                     onChange={(e) => setAccountId(e.target.value)}
//                     className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
//                   >
//                     {accounts.map((acc) => (
//                       <option key={acc.id} value={acc.id}>
//                         @{acc.username}
//                       </option>
//                     ))}
//                   </select>
//                 )}
//                 {accounts.length === 1 && (
//                   <span className="text-xs text-gray-500">@{accounts[0].username}</span>
//                 )}
//               </div>
//             </div>

//             {/* Caption */}
//             {/* Caption */}
// <div>
//   <div className="flex items-center justify-between">
//     <Label htmlFor="post-caption" className="text-sm text-gray-700">
//       Caption
//     </Label>
//   </div>

//   {/* Topic input + Generate button — topic is optional, generic caption
//       is generated when left blank. */}
//   <div className="mt-1.5 flex items-center gap-2">
//     <Input
//       value={captionTopic}
//       onChange={(e) => setCaptionTopic(e.target.value)}
//       placeholder="Optional: what's this post about? e.g. summer sale"
//       className="text-sm h-8"
//     />
//     <Button
//       type="button"
//       variant="outline"
//       size="sm"
//       onClick={handleGenerateCaption}
//       disabled={isGeneratingCaption}
//       className="text-xs h-8 px-2.5 flex-shrink-0 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
//     >
//       {isGeneratingCaption ? (
//         <Loader2 className="w-3 h-3 mr-1 animate-spin" />
//       ) : (
//         <Sparkles className="w-3 h-3 mr-1" />
//       )}
//       Generate
//     </Button>
//   </div>

//   <Textarea
//     id="post-caption"
//     value={caption}
//     onChange={(e) => setCaption(e.target.value)}
//     placeholder="Write a caption for your post..."
//     rows={4}
//     className="mt-2 resize-none"
//   />
// </div>

//             {/* Media Upload */}
//             <div>
//               <Label className="text-sm text-gray-700">Media</Label>
//               <label
//                 htmlFor="post-media-upload"
//                 className="mt-1.5 flex flex-col items-center justify-center gap-1.5 border border-dashed border-gray-300 rounded-lg py-6 cursor-pointer hover:bg-gray-50 transition-colors"
//               >
//                 <Upload className="w-5 h-5 text-gray-400" />
//                 <span className="text-sm text-gray-600">Click to upload images or videos</span>
//                 <span className="text-xs text-gray-400">
//                   Multiple images will be posted as a carousel
//                 </span>
//                 <input
//                   id="post-media-upload"
//                   type="file"
//                   accept="image/*,video/*"
//                   multiple
//                   className="hidden"
//                   onChange={(e) => handleFilesSelected(e.target.files)}
//                 />
//               </label>

//               {totalMediaCount > 0 && (
//                 <div className="grid grid-cols-4 gap-2 mt-3">
//                   {existingMediaUrls.map((url, index) => (
//                     <div
//                       key={`existing-${url}-${index}`}
//                       className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-50"
//                     >
//                       <img src={url} alt="" className="w-full h-full object-cover" />
//                       <button
//                         type="button"
//                         onClick={() => removeExistingMedia(index)}
//                         className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </div>
//                   ))}
//                   {files.map((file, index) => (
//                     <div
//                       key={`${file.name}-${index}`}
//                       className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-50"
//                     >
//                       {file.type.startsWith("video") ? (
//                         <video
//                           src={URL.createObjectURL(file)}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <img
//                           src={URL.createObjectURL(file)}
//                           alt={file.name}
//                           className="w-full h-full object-cover"
//                         />
//                       )}
//                       <button
//                         type="button"
//                         onClick={() => removeNewFile(index)}
//                         className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Schedule Section */}
//             <div>
//               <Label className="text-sm text-gray-700">Schedule</Label>
//               <div className="mt-1.5 grid grid-cols-2 gap-2">
//                 <button
//                   type="button"
//                   onClick={() => setScheduleMode("now")}
//                   className={`flex items-center justify-center gap-2 text-sm rounded-lg border px-3 py-2 transition-colors ${
//                     scheduleMode === "now"
//                       ? "border-emerald-600 bg-emerald-50 text-emerald-700"
//                       : "border-gray-200 text-gray-600 hover:bg-gray-50"
//                   }`}
//                 >
//                   <Send className="w-4 h-4" /> Publish Now
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setScheduleMode("later")}
//                   className={`flex items-center justify-center gap-2 text-sm rounded-lg border px-3 py-2 transition-colors ${
//                     scheduleMode === "later"
//                       ? "border-emerald-600 bg-emerald-50 text-emerald-700"
//                       : "border-gray-200 text-gray-600 hover:bg-gray-50"
//                   }`}
//                 >
//                   <CalendarClock className="w-4 h-4" /> Schedule Later
//                 </button>
//               </div>

//               {scheduleMode === "later" && (
//                 <div className="grid grid-cols-2 gap-2 mt-2">
//                   <div>
//                     <Label htmlFor="post-date" className="text-xs text-gray-500">
//                       Date
//                     </Label>
//                     <input
//                       id="post-date"
//                       type="date"
//                       value={date}
//                       onChange={(e) => setDate(e.target.value)}
//                       className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="post-time" className="text-xs text-gray-500">
//                       Time
//                     </Label>
//                     <input
//                       id="post-time"
//                       type="time"
//                       value={time}
//                       onChange={(e) => setTime(e.target.value)}
//                       className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         <DialogFooter className="gap-2 sm:gap-2 mt-4 flex-wrap">
//           <Button variant="outline" onClick={resetAndClose} disabled={isSaving}>
//             Cancel
//           </Button>
//           <Button
//             variant="outline"
//             disabled={isSaving}
//             onClick={() => buildAndSubmit("draft")}
//           >
//             {isSaving ? (
//               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//             ) : (
//               <FileText className="w-4 h-4 mr-2" />
//             )}
//             Save Draft
//           </Button>
//           {scheduleMode === "later" ? (
//             <Button
//               disabled={!isScheduleValid || isSaving}
//               onClick={() => buildAndSubmit("scheduled")}
//               className="bg-emerald-600 hover:bg-emerald-700 text-white"
//             >
//               {isSaving ? (
//                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//               ) : (
//                 <CalendarClock className="w-4 h-4 mr-2" />
//               )}
//               Schedule
//             </Button>
//           ) : (
//             <Button
//               disabled={isSaving}
//               onClick={() => buildAndSubmit("now")}
//               className="bg-emerald-600 hover:bg-emerald-700 text-white"
//             >
//               {isSaving ? (
//                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//               ) : (
//                 <Send className="w-4 h-4 mr-2" />
//               )}
//               Publish
//             </Button>
//           )}
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }






import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import {
  Instagram,
  Sparkles,
  Upload,
  X,
  Loader2,
  CalendarClock,
  Send,
  FileText,
  Video,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import {
  createInstagramPost,
  updateInstagramPost,
  getInstagramPost,
  uploadInstagramMedia,
  type PostType,
  type PublishType,
  type InstagramPostApi,
} from "@/lib/api/instagram-posts-api";

type ScheduleMode = "now" | "later";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  editingPostId?: string | null;
  onSaved: () => void;
}

interface InstagramAccountOption {
  id: string;
  username: string;
  isActive?: boolean;
}

const MAX_CAPTION_LENGTH = 2200;

function inferPostType(fileCount: number, existingType?: PostType): PostType {
  if (fileCount > 1) return "carousel";
  if (fileCount === 1) return existingType ?? "image";
  return existingType ?? "image";
}

export function CreatePostModal({
  open,
  onOpenChange,
  channelId,
  editingPostId,
  onSaved,
}: CreatePostModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!editingPostId;

  const [caption, setCaption] = useState("");
  const [captionTopic, setCaptionTopic] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>([]);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("now");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [accountId, setAccountId] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const { data: accounts = [] } = useQuery<InstagramAccountOption[]>({
    queryKey: ["/api/instagram/accounts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/instagram/accounts");
      const json = await response.json();
      return json.data ?? [];
    },
    enabled: open,
  });

  const { data: editingPost, isLoading: isLoadingPost } = useQuery<InstagramPostApi>({
    queryKey: ["/api/instagram/posts", editingPostId],
    queryFn: () => getInstagramPost(editingPostId as string),
    enabled: open && isEditMode,
  });

  useEffect(() => {
    if (!open) return;

    if (isEditMode && editingPost) {
      setCaption(editingPost.caption ?? "");
      setExistingMediaUrls((editingPost.media ?? []).map((m) => m.url));
      setFiles([]);
      setAccountId(editingPost.instagramAccountId ?? "");
      if (editingPost.scheduledAt) {
        const d = new Date(editingPost.scheduledAt);
        setScheduleMode("later");
        setDate(d.toISOString().slice(0, 10));
        setTime(d.toISOString().slice(11, 16));
      } else {
        setScheduleMode("now");
        setDate("");
        setTime("");
      }
    } else if (!isEditMode) {
      setCaption("");
      setFiles([]);
      setExistingMediaUrls([]);
      setScheduleMode("now");
      setDate("");
      setTime("");
      if (!accountId && accounts.length > 0) {
        setAccountId(accounts[0].id);
      }
    }
  }, [open, isEditMode, editingPost, accounts]);

  const resetAndClose = () => {
    setCaption("");
    setCaptionTopic("");
    setFiles([]);
    setExistingMediaUrls([]);
    setScheduleMode("now");
    setDate("");
    setTime("");
    onOpenChange(false);
  };

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    setFiles((prev) => [...prev, ...Array.from(fileList)]);
  };

  const removeNewFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (index: number) => {
    setExistingMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateCaption = async () => {
    setIsGeneratingCaption(true);
    try {
      const response = await apiRequest("POST", "/api/instagram/generate-caption", {
        channelId,
        postType: inferPostType(totalMediaCount),
        topic: captionTopic.trim() || undefined,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate caption.");
      }

      setCaption(data.caption);
    } catch (error: any) {
      toast({
        title: "Caption generation failed",
        description: error.message || "Could not generate a caption. Check your AI settings.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const invalidatePostsList = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/instagram/posts"] });
  };

  const createMutation = useMutation({
    mutationFn: createInstagramPost,
    onSuccess: () => {
      invalidatePostsList();
      toast({ title: "Post saved", description: "Your Instagram post was saved successfully." });
      onSaved();
      resetAndClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save post",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateInstagramPost>[1]) =>
      updateInstagramPost(editingPostId as string, payload),
    onSuccess: () => {
      invalidatePostsList();
      queryClient.invalidateQueries({ queryKey: ["/api/instagram/posts", editingPostId] });
      toast({ title: "Post updated", description: "Your changes have been saved." });
      onSaved();
      resetAndClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update post",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isScheduleValid = scheduleMode === "now" || (!!date && !!time);
  const totalMediaCount = files.length + existingMediaUrls.length;
  const postTypeLabel = inferPostType(totalMediaCount);

  const buildAndSubmit = async (publishType: PublishType) => {
    if (!accountId) {
      toast({
        title: "Select an Instagram account",
        description: "Connect or choose an Instagram account before saving this post.",
        variant: "destructive",
      });
      return;
    }

    let mediaUrls = existingMediaUrls;
    if (files.length > 0) {
      try {
        const uploadedUrls = await uploadInstagramMedia(files);
        mediaUrls = [...existingMediaUrls, ...uploadedUrls];
      } catch (error: any) {
        toast({
          title: "Media upload failed",
          description: error.message || "Could not upload the selected media.",
          variant: "destructive",
        });
        return;
      }
    }

    const scheduledAt =
      publishType === "scheduled" && date && time ? `${date}T${time}:00` : null;

    const payload = {
      accountId,
      channelId,
      caption,
      mediaType: inferPostType(mediaUrls.length),
      mediaUrls,
      publishType,
      scheduledAt,
      hashtags: [],
      firstComment: null,
      locationId: null,
      collaborators: [],
    };

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {isEditMode ? "Edit Post" : "Create Post"}
            </DialogTitle>
            <Badge
              variant="outline"
              className="text-xs capitalize font-medium px-2.5 py-0.5 border-emerald-200 text-emerald-700 bg-emerald-50/50"
            >
              {postTypeLabel}
            </Badge>
          </div>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            Compose and configure media for your Instagram audience.
          </DialogDescription>
        </DialogHeader>

        {/* Content Body */}
        {isEditMode && isLoadingPost ? (
          <div className="p-12 flex justify-center items-center">
            <Loading />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Account Selector Section */}
            <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px] flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <Instagram className="w-4 h-4 text-rose-600" />
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-500">Target Account:</span>
              </div>

              {accounts.length > 1 ? (
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="text-xs font-semibold bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm transition-all"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      @{acc.username}
                    </option>
                  ))}
                </select>
              ) : accounts.length === 1 ? (
                <span className="text-xs font-bold text-gray-800 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                  @{accounts[0].username}
                </span>
              ) : (
                <span className="text-xs text-amber-600 font-medium">No account connected</span>
              )}
            </div>

            {/* Caption Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="post-caption" className="text-sm font-semibold text-gray-800">
                  Caption
                </Label>
                <span
                  className={`text-xs ${
                    caption.length > MAX_CAPTION_LENGTH
                      ? "text-rose-500 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {caption.length} / {MAX_CAPTION_LENGTH}
                </span>
              </div>

              {/* AI Assistant Banner */}
              <div className="bg-gradient-to-r from-emerald-50/60 to-teal-50/60 p-3 rounded-xl border border-emerald-100/80 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Assistant</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={captionTopic}
                    onChange={(e) => setCaptionTopic(e.target.value)}
                    placeholder="Topic or key idea (e.g. New summer collection launch)..."
                    className="text-xs h-9 bg-white border-emerald-200 focus:border-emerald-500 focus-visible:ring-emerald-500/20"
                  />
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleGenerateCaption}
                    disabled={isGeneratingCaption}
                    className="text-xs h-9 px-3.5 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all"
                  >
                    {isGeneratingCaption ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </div>
              </div>

              <Textarea
                id="post-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write an engaging caption for your post..."
                rows={4}
                maxLength={MAX_CAPTION_LENGTH}
                className="resize-none text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
              />
            </div>

            {/* Media Upload Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-800">Media Gallery</Label>
                <span className="text-xs text-gray-400 font-normal">
                  {totalMediaCount > 0 ? `${totalMediaCount} attached` : "Images or Videos"}
                </span>
              </div>

              <label
                htmlFor="post-media-upload"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files) handleFilesSelected(e.dataTransfer.files);
                }}
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-6 px-4 cursor-pointer transition-all ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-gray-200 hover:border-emerald-400 hover:bg-gray-50/50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-700">
                    Click to upload <span className="font-normal text-gray-500">or drag & drop</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Supports PNG, JPG, MP4 (Multiple files automatically form a carousel)
                  </p>
                </div>
                <input
                  id="post-media-upload"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
              </label>

              {/* Media Thumbnails Grid */}
              {totalMediaCount > 0 && (
                <div className="grid grid-cols-4 gap-2.5 pt-1">
                  {/* Existing Media */}
                  {existingMediaUrls.map((url, index) => (
                    <div
                      key={`existing-${url}-${index}`}
                      className="group relative rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-900 shadow-sm"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                      <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExistingMedia(index)}
                        className="absolute top-1.5 right-1.5 bg-rose-500/90 hover:bg-rose-600 text-white rounded-full p-1 opacity-90 transition-opacity shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* New Files */}
                  {files.map((file, index) => {
                    const orderIndex = existingMediaUrls.length + index + 1;
                    const isVid = file.type.startsWith("video");
                    return (
                      <div
                        key={`${file.name}-${index}`}
                        className="group relative rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-900 shadow-sm"
                      >
                        {isVid ? (
                          <video
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                          />
                        ) : (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                          />
                        )}
                        <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                          {orderIndex}
                        </span>
                        <div className="absolute bottom-1.5 left-1.5 text-white/80">
                          {isVid ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewFile(index)}
                          className="absolute top-1.5 right-1.5 bg-rose-500/90 hover:bg-rose-600 text-white rounded-full p-1 transition-opacity shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Schedule Section */}
            <div className="space-y-3 pt-2">
              <Label className="text-sm font-semibold text-gray-800">Publishing Schedule</Label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setScheduleMode("now")}
                  className={`flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-lg transition-all ${
                    scheduleMode === "now"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" /> Publish Immediately
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleMode("later")}
                  className={`flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-lg transition-all ${
                    scheduleMode === "later"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <CalendarClock className="w-3.5 h-3.5" /> Schedule for Later
                </button>
              </div>

              {scheduleMode === "later" && (
                <div className="grid grid-cols-2 gap-3 pt-1 animate-in fade-in-50 duration-150">
                  <div>
                    <Label htmlFor="post-date" className="text-xs font-medium text-gray-600">
                      Target Date
                    </Label>
                    <input
                      id="post-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-1 w-full text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="post-time" className="text-xs font-medium text-gray-600">
                      Target Time
                    </Label>
                    <input
                      id="post-time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="mt-1 w-full text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <DialogFooter className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="ghost"
            onClick={resetAndClose}
            disabled={isSaving}
            className="text-xs text-gray-600 hover:bg-gray-200/60"
          >
            Cancel
          </Button>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => buildAndSubmit("draft")}
              className="text-xs border-gray-200 hover:bg-gray-100"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
              )}
              Save Draft
            </Button>
            {scheduleMode === "later" ? (
              <Button
                disabled={!isScheduleValid || isSaving}
                onClick={() => buildAndSubmit("scheduled")}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <CalendarClock className="w-3.5 h-3.5 mr-1.5" />
                )}
                Schedule Post
              </Button>
            ) : (
              <Button
                disabled={isSaving}
                onClick={() => buildAndSubmit("now")}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                )}
                Publish Now
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}