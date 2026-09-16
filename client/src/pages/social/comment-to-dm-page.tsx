// import { useMemo, useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Plus, MessageCircle, Trash2, AlertTriangle } from "lucide-react";

// import Header from "@/components/layout/header";
// import { useToast } from "@/hooks/use-toast";
// import { Loading } from "@/components/ui/loading";
// import { apiRequest } from "@/lib/queryClient";
// import { useChannelContext } from "@/contexts/channel-context";

// import {InstagramAutomationCard} from "@/components/social-accounts/comment-to-dm/instagram-automation-card";
// import { CreateAutomationModal } from "@/components/social-accounts/comment-to-dm/create-automation-modal";
// import { AutomationLogsDialog } from "@/components/social-accounts/comment-to-dm/automation-logs-dialog";
// import {
//   getInstagramAutomations,
//   updateInstagramAutomation,
//   deleteInstagramAutomation,
//   type InstagramAutomationApi,
// } from "@/lib/api/instagram-automation-api";

// export function CommentToDmPage() {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const { selectedChannel } = useChannelContext();
//   const channelId = selectedChannel?.id ?? "";

//   const [isCreateOpen, setIsCreateOpen] = useState(false);
//   const [editingAutomation, setEditingAutomation] = useState<InstagramAutomationApi | null>(null);
//   const [logsAutomationId, setLogsAutomationId] = useState<string | null>(null);
//   const [logsAutomationName, setLogsAutomationName] = useState<string>("");
//   const [deleteTarget, setDeleteTarget] = useState<InstagramAutomationApi | null>(null);

//   const { data: accounts = [] } = useQuery<{ id: string; username: string }[]>({
//     queryKey: ["/api/instagram/accounts"],
//     queryFn: async () => {
//       const response = await apiRequest("GET", "/api/instagram/accounts");
//       const json = await response.json();
//       return json.data ?? [];
//     },
//   });
//   const accountsById = useMemo(
//     () => Object.fromEntries(accounts.map((a) => [a.id, a.username])),
//     [accounts]
//   );

//   const { data: automations = [], isLoading } = useQuery({
//     queryKey: ["/api/instagram/automations", channelId],
//     queryFn: () => getInstagramAutomations(channelId),
//     enabled: !!channelId,
//   });

//   const invalidateList = () => {
//     queryClient.invalidateQueries({ queryKey: ["/api/instagram/automations"] });
//   };

//   const toggleStatusMutation = useMutation({
//     mutationFn: (automation: InstagramAutomationApi) =>
//       updateInstagramAutomation(automation.id, {
//         status: automation.status === "active" ? "paused" : "active",
//       }),
//     onSuccess: (_data, automation) => {
//       invalidateList();
//       toast({
//         title: automation.status === "active" ? "Automation paused" : "Automation activated",
//       });
//     },
//     onError: (error: any) => {
//       toast({ title: "Failed to update automation", description: error.message, variant: "destructive" });
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (id: string) => deleteInstagramAutomation(id),
//     onSuccess: () => {
//       invalidateList();
//       toast({ title: "Automation deleted" });
//       setDeleteTarget(null);
//     },
//     onError: (error: any) => {
//       toast({ title: "Failed to delete automation", description: error.message, variant: "destructive" });
//     },
//   });

//   const handleEdit = (automation: InstagramAutomationApi) => {
//     setEditingAutomation(automation);
//     setIsCreateOpen(true);
//   };
//   const handleViewLogs = (automation: InstagramAutomationApi) => {
//     setLogsAutomationId(automation.id);
//     setLogsAutomationName(automation.name);
//   };

//   return (
//     <>
//       <Header
//         title="Comment → DM Automation"
//         subtitle="Auto-reply to comments and send DMs when a keyword matches."
//       />

//       <div className="p-4 sm:p-6 space-y-4">
//         <div className="flex items-center justify-between">
//           <p className="text-sm text-gray-500">
//             Runs on new Instagram comments — replies to the comment and/or sends a DM when a keyword matches.
//           </p>
//           <Button
//             onClick={() => {
//               setEditingAutomation(null);
//               setIsCreateOpen(true);
//             }}
//             className="bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0"
//           >
//             <Plus className="w-4 h-4 mr-2" />
//             Create Automation
//           </Button>
//         </div>

//         {isLoading ? (
//           <Loading />
//         ) : automations.length === 0 ? (
//           <div className="border border-gray-200 rounded-xl bg-white flex flex-col items-center justify-center text-center py-16 px-4">
//             <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
//               <MessageCircle className="w-8 h-8 text-emerald-600" />
//             </div>
//             <h3 className="text-base font-semibold text-gray-900">No automations yet</h3>
//             <p className="text-sm text-gray-500 mt-1 max-w-sm">
//               Create your first Comment → DM automation to reply and send DMs automatically.
//             </p>
//             <Button
//               onClick={() => {
//                 setEditingAutomation(null);
//                 setIsCreateOpen(true);
//               }}
//               className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
//             >
//               <Plus className="w-4 h-4 mr-2" />
//               Create Automation
//             </Button>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {automations.map((automation) => (
//               <InstagramAutomationCard
//                 key={automation.id}
//                 automation={automation}
//                 accountUsername={accountsById[automation.accountId]}
//                 onEdit={handleEdit}
//                 onToggleStatus={(a) => toggleStatusMutation.mutate(a)}
//                 onViewLogs={handleViewLogs}
//                 onDelete={(a) => setDeleteTarget(a)}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       <CreateAutomationModal
//         open={isCreateOpen}
//         onOpenChange={(o) => {
//           setIsCreateOpen(o);
//           if (!o) setEditingAutomation(null);
//         }}
//         channelId={channelId}
//         editingAutomation={editingAutomation}
//         onSaved={() => setEditingAutomation(null)}
//       />

//       <AutomationLogsDialog
//         automationId={logsAutomationId}
//         automationName={logsAutomationName}
//         onOpenChange={(open) => !open && setLogsAutomationId(null)}
//       />

//       {/* Delete confirmation */}
//       <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 text-red-700">
//               <Trash2 className="w-5 h-5" />
//               Delete Automation
//             </DialogTitle>
//             <DialogDescription>
//               Are you sure you want to delete "{deleteTarget?.name}"? This cannot be undone.
//             </DialogDescription>
//           </DialogHeader>

//           <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
//             <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
//             <p className="text-xs text-red-700">
//               Existing execution logs for this automation will remain, but it will stop running.
//             </p>
//           </div>

//           <DialogFooter className="gap-2 sm:gap-0">
//             <Button variant="outline" onClick={() => setDeleteTarget(null)}>
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
//               disabled={deleteMutation.isPending}
//             >
//               {deleteMutation.isPending ? "Deleting..." : "Delete"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }




import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  MessageCircle,
  Trash2,
  AlertTriangle,
  Search,
  Instagram,
  Facebook,
  AtSign,
  Zap,
  PauseCircle,
  CheckCircle2,
  Filter,
} from "lucide-react";

import Header from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { apiRequest } from "@/lib/queryClient";
import { useChannelContext } from "@/contexts/channel-context";

import { InstagramAutomationCard } from "@/components/social-accounts/comment-to-dm/instagram-automation-card";
import { CreateAutomationModal } from "@/components/social-accounts/comment-to-dm/create-automation-modal";
import { AutomationLogsDialog } from "@/components/social-accounts/comment-to-dm/automation-logs-dialog";
import { ComingSoonPlaceholder } from "@/components/social-accounts/comming-soon-placeholder";
import {
  getInstagramAutomations,
  updateInstagramAutomation,
  deleteInstagramAutomation,
  type InstagramAutomationApi,
} from "@/lib/api/instagram-automation-api";

type SocialPlatform = "instagram" | "facebook" | "threads" | "messenger";

const PLATFORM_TABS = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook, comingSoon: true },
  { value: "threads", label: "Threads", icon: AtSign, comingSoon: true },
  { value: "messenger", label: "Messenger", icon: MessageCircle, comingSoon: true },
];

export function CommentToDmPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedChannel } = useChannelContext();
  const channelId = selectedChannel?.id ?? "";

  const [activePlatform, setActivePlatform] = useState<SocialPlatform>("instagram");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<InstagramAutomationApi | null>(null);
  const [logsAutomationId, setLogsAutomationId] = useState<string | null>(null);
  const [logsAutomationName, setLogsAutomationName] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<InstagramAutomationApi | null>(null);

  const { data: accounts = [] } = useQuery<{ id: string; username: string }[]>({
    queryKey: ["/api/instagram/accounts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/instagram/accounts");
      const json = await response.json();
      return json.data ?? [];
    },
  });

  const accountsById = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a.username])),
    [accounts]
  );

  const { data: automations = [], isLoading } = useQuery({
    queryKey: ["/api/instagram/automations", channelId],
    queryFn: () => getInstagramAutomations(channelId),
    enabled: !!channelId,
  });

  const filteredAutomations = useMemo(() => {
    return automations.filter((auto) => {
      const matchesSearch =
        auto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (auto.keywords && auto.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesStatus =
        statusFilter === "all" ? true : auto.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [automations, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = automations.length;
    const active = automations.filter((a) => a.status === "active").length;
    const paused = automations.filter((a) => a.status === "paused").length;
    return { total, active, paused };
  }, [automations]);

  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/instagram/automations"] });
  };

  const toggleStatusMutation = useMutation({
    mutationFn: (automation: InstagramAutomationApi) =>
      updateInstagramAutomation(automation.id, {
        status: automation.status === "active" ? "paused" : "active",
      }),
    onSuccess: (_data, automation) => {
      invalidateList();
      toast({
        title: automation.status === "active" ? "Automation paused" : "Automation activated",
      });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update automation", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInstagramAutomation(id),
    onSuccess: () => {
      invalidateList();
      toast({ title: "Automation deleted" });
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete automation", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (automation: InstagramAutomationApi) => {
    setEditingAutomation(automation);
    setIsCreateOpen(true);
  };

  const handleViewLogs = (automation: InstagramAutomationApi) => {
    setLogsAutomationId(automation.id);
    setLogsAutomationName(automation.name);
  };

  return (
    <>
      <Header
        title="Comment → DM Automation"
        subtitle="Auto-reply to comments and send DMs when a keyword matches."
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Social Platforms Bar */}
        <Tabs value={activePlatform} onValueChange={(v) => setActivePlatform(v as SocialPlatform)}>
          <TabsList className="inline-flex h-auto bg-gray-100/80 p-1.5 gap-2 rounded-xl border-none">
            {PLATFORM_TABS.map(({ value, label, icon: Icon, comingSoon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all text-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {comingSoon && (
                  <span className="text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500 font-normal ml-1">
                    Soon
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {activePlatform !== "instagram" ? (
          <ComingSoonPlaceholder
            icon={
              activePlatform === "facebook"
                ? Facebook
                : activePlatform === "threads"
                ? AtSign
                : MessageCircle
            }
            platformName={activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1)}
            iconColorClass="text-emerald-600"
            iconBgClass="bg-emerald-50"
          />
        ) : (
          <>
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Total Rules</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-700">Active Automations</p>
                  <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.active}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-700">Paused Automations</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">{stats.paused}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                  <PauseCircle className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Controls: Search, Status Filter & Create Button */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by rule name or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white rounded-lg border-gray-200 focus-visible:ring-emerald-500"
                  />
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
                  {(["all", "active", "paused"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-md font-medium capitalize transition-all ${
                        statusFilter === status
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => {
                  setEditingAutomation(null);
                  setIsCreateOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Automation
              </Button>
            </div>

            {/* Content List / Empty State */}
            {isLoading ? (
              <Loading />
            ) : automations.length === 0 ? (
              <div className="border border-gray-200 rounded-xl bg-white flex flex-col items-center justify-center text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">No automations yet</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  Create your first Comment → DM automation to reply and send DMs automatically.
                </p>
                <Button
                  onClick={() => {
                    setEditingAutomation(null);
                    setIsCreateOpen(true);
                  }}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Automation
                </Button>
              </div>
            ) : filteredAutomations.length === 0 ? (
              <div className="border border-gray-200 rounded-xl bg-white flex flex-col items-center justify-center text-center py-12 px-4">
                <Filter className="w-8 h-8 text-gray-400 mb-2" />
                <h3 className="text-sm font-semibold text-gray-900">No matching automations found</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Try adjusting your search query or filter options.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAutomations.map((automation) => (
                  <InstagramAutomationCard
                    key={automation.id}
                    automation={automation}
                    accountUsername={accountsById[automation.accountId]}
                    onEdit={handleEdit}
                    onToggleStatus={(a) => toggleStatusMutation.mutate(a)}
                    onViewLogs={handleViewLogs}
                    onDelete={(a) => setDeleteTarget(a)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <CreateAutomationModal
        open={isCreateOpen}
        onOpenChange={(o) => {
          setIsCreateOpen(o);
          if (!o) setEditingAutomation(null);
        }}
        channelId={channelId}
        editingAutomation={editingAutomation}
        onSaved={() => setEditingAutomation(null)}
      />

      <AutomationLogsDialog
        automationId={logsAutomationId}
        automationName={logsAutomationName}
        onOpenChange={(open) => !open && setLogsAutomationId(null)}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="w-5 h-5" />
              Delete Automation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700">
              Existing execution logs for this automation will remain, but it will stop running.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
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