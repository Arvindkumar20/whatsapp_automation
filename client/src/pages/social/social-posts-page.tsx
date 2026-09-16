import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Instagram, Facebook, AtSign, MessageCircle, Plus, Search, Trash2, AlertTriangle } from "lucide-react";

import Header from "@/components/layout/header";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { apiRequest } from "@/lib/queryClient";
import { ComingSoonPlaceholder } from "@/components/social-accounts/comming-soon-placeholder";
import { PostCard } from "@/components/social-accounts/post-card";
import { PostsEmptyState } from "@/components/social-accounts/posts-empty-state";
import { CreatePostModal } from "@/components/social-accounts/create-post-modal";
import { mapApiPostToSocialPost, type PostStatus, type SocialPost } from "@/lib/social-posts-types";
import {getInstagramPosts,
  getInstagramPost,
  createInstagramPost,
  updateInstagramPost,
  deleteInstagramPost,
  publishInstagramPost,
  type InstagramPostApi} from "../../lib/api/instagram-posts-api";

import { useChannelContext } from "@/contexts/channel-context";  

type PlatformTab = "instagram" | "facebook" | "threads" | "messenger";

const PLATFORM_TABS: {
  value: PlatformTab;
  label: string;
  icon: typeof Instagram;
  comingSoon?: boolean;
}[] = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook, comingSoon: true },
  { value: "threads", label: "Threads", icon: AtSign, comingSoon: true },
  { value: "messenger", label: "Messenger", icon: MessageCircle, comingSoon: true },
];

const STATUS_FILTERS: { value: PostStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
];

const PAGE_LIMIT = 10;

export function SocialPostsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedChannel } = useChannelContext();
  const channelId = selectedChannel?.id ?? "";

  const [activeTab, setActiveTab] = useState<PlatformTab>("instagram");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [page, setPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InstagramPostApi | null>(null);

  // Connected accounts — only used here to resolve a username for "Created By".
  const { data: accounts = [] } = useQuery<{ id: string; username: string }[]>({
    queryKey: ["/api/instagram/accounts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/instagram/accounts");
      const json = await response.json();
      return json.data ?? [];
    },
  });
  const accountsById = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, { username: a.username }])),
    [accounts]
  );

  const {
    data: postsResponse,
    isLoading: isLoadingPosts,
  } = useQuery({
    queryKey: ["/api/instagram/posts", channelId, page],
    queryFn: () => getInstagramPosts({ channelId, page, limit: PAGE_LIMIT }),
    enabled: !!channelId,
  });

  const rawPosts = postsResponse?.data ?? [];
  const total = postsResponse?.total ?? rawPosts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  // const posts: SocialPost[] = useMemo(
  //   () => rawPosts.map((p) => mapApiPostToSocialPost(p, accountsById)),
  //   [rawPosts, accountsById]
  // );

  const posts: SocialPost[] = useMemo(() => {
  console.log(rawPosts);
  return rawPosts.map((p) => mapApiPostToSocialPost(p, accountsById));
}, [rawPosts, accountsById]);

  // Search + status filter are applied client-side against the current page,
  // per spec ("Search: frontend only for now").
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesStatus = statusFilter === "all" || post.status === statusFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        post.caption.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [posts, statusFilter, searchQuery]);

  

  const hasActiveFilters = statusFilter !== "all" || searchQuery.trim().length > 0;

  const invalidatePostsList = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/instagram/posts"] });
  };

  const handleEdit = (post: SocialPost) => {
    setEditingPostId(post.id);
    setIsCreateOpen(true);
  };

  // No dedicated duplicate endpoint — compose it from GET + the existing
  // create endpoint, saved as a new draft.
  const duplicateMutation = useMutation({
    mutationFn: async (postId: string) => {
      const original = await getInstagramPost(postId);
      return createInstagramPost({
        accountId: original.accountId,
channelId: original.channelId,
caption: original.caption,
mediaType: original.mediaType,
mediaUrls: original.mediaUrls,
publishType: "draft",
scheduledAt: null,
hashtags: original.hashtags ?? [],
firstComment: original.firstComment,
locationId: original.locationId,
collaborators: original.collaborators ?? [],
      });
    },
    onSuccess: () => {
      invalidatePostsList();
      toast({ title: "Post duplicated", description: "A draft copy was created." });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to duplicate post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ASSUMPTION: no dedicated "publish now" endpoint was provided for this
  // task — this reuses the update-draft endpoint with publishType: "now".
  // Point this at a real publish endpoint if/when one exists.
  const publishNowMutation = useMutation({
  mutationFn: (postId: string) =>
    publishInstagramPost(postId),

  onSuccess: () => {
    invalidatePostsList();

    toast({
      title: "Post published",
      description: "Instagram post published successfully.",
    });
  },

  onError: (error: any) => {
    toast({
      title: "Publish failed",
      description: error.message,
      variant: "destructive",
    });
  },
});

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => deleteInstagramPost(postId),
    onSuccess: () => {
      invalidatePostsList();
      toast({ title: "Post deleted", description: "The post has been removed." });
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDuplicate = (post: SocialPost) => duplicateMutation.mutate(post.id);
  const handlePublishNow = (post: SocialPost) => publishNowMutation.mutate(post.id);
  const handleDeleteRequest = (post: SocialPost) => {
    const raw = rawPosts.find((p) => p.id === post.id);
    if (raw) setDeleteTarget(raw);
  };
  const confirmDelete = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  };

  return (
    <>
      <Header
        title="Social Media Posts"
        subtitle="Create, schedule and manage your social media content."
      />

      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PlatformTab)}>
            <TabsList className="w-full sm:w-auto">
              {PLATFORM_TABS.map(({ value, label, icon: Icon, comingSoon }) => (
                <TabsTrigger key={value} value={value} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {comingSoon && (
                    <span className="text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                      Soon
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Button
            onClick={() => {
              setEditingPostId(null);
              setIsCreateOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>

        <Tabs value={activeTab}>
          <TabsContent value="instagram" className="mt-0 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setStatusFilter(value)}
                    className={`text-xs sm:text-sm px-3 py-1.5 rounded-full border transition-colors ${
                      statusFilter === value
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts list */}
            {isLoadingPosts ? (
              <Loading />
            ) : filteredPosts.length === 0 ? (
              <div className="border border-gray-200 rounded-xl bg-white">
                <PostsEmptyState
                  onCreatePost={() => {
                    setEditingPostId(null);
                    setIsCreateOpen(true);
                  }}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onEdit={handleEdit}
                      onDuplicate={handleDuplicate}
                      onPublishNow={handlePublishNow}
                      onDelete={handleDeleteRequest}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="facebook" className="mt-0">
            <ComingSoonPlaceholder
              icon={Facebook}
              platformName="Facebook"
              iconColorClass="text-indigo-600"
              iconBgClass="bg-indigo-50"
            />
          </TabsContent>

          <TabsContent value="threads" className="mt-0">
            <ComingSoonPlaceholder
              icon={AtSign}
              platformName="Threads"
              iconColorClass="text-gray-800"
              iconBgClass="bg-gray-100"
            />
          </TabsContent>

          <TabsContent value="messenger" className="mt-0">
            <ComingSoonPlaceholder
              icon={MessageCircle}
              platformName="Messenger"
              iconColorClass="text-blue-600"
              iconBgClass="bg-blue-50"
            />
          </TabsContent>
        </Tabs>
      </div>

      <CreatePostModal
        open={isCreateOpen}
        onOpenChange={(o) => {
          setIsCreateOpen(o);
          if (!o) setEditingPostId(null);
        }}
        channelId={channelId}
        editingPostId={editingPostId}
        onSaved={() => setEditingPostId(null)}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="w-5 h-5" />
              Delete Post
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700">
              This will permanently remove the post{deleteTarget?.status === "published" ? " and its record" : ""}.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
