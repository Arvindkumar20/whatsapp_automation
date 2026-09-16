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
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import { apiRequest } from "@/lib/queryClient";
// import { Instagram, MessageCircle, Reply, Send, Loader2 } from "lucide-react";
// import {
//   createInstagramAutomation,
//   updateInstagramAutomation,
//   type InstagramAutomationApi,
//   type MatchType,
// } from "@/lib/api/instagram-automation-api";

// interface CreateAutomationModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   channelId: string;
//   editingAutomation: InstagramAutomationApi | null;
//   onSaved: () => void;
// }

// interface InstagramAccountOption {
//   id: string;
//   username: string;
// }

// const MATCH_TYPES: { value: MatchType; label: string }[] = [
//   { value: "contains", label: "Contains" },
//   { value: "equals", label: "Equals" },
//   { value: "starts_with", label: "Starts With" },
// ];

// export function CreateAutomationModal({
//   open,
//   onOpenChange,
//   channelId,
//   editingAutomation,
//   onSaved,
// }: CreateAutomationModalProps) {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const isEditMode = !!editingAutomation;

//   const [name, setName] = useState("");
//   const [accountId, setAccountId] = useState("");
//   const [keywordsInput, setKeywordsInput] = useState("");
//   const [matchType, setMatchType] = useState<MatchType>("contains");
//   const [caseInsensitive, setCaseInsensitive] = useState(true);
//   const [replyComment, setReplyComment] = useState(false);
//   const [replyCommentMessage, setReplyCommentMessage] = useState("");
//   const [sendDm, setSendDm] = useState(false);
//   const [dmMessage, setDmMessage] = useState("");
//   const [delaySeconds, setDelaySeconds] = useState(0);
//   const [runOnce, setRunOnce] = useState(true);

//   const { data: accounts = [] } = useQuery<InstagramAccountOption[]>({
//     queryKey: ["/api/instagram/accounts"],
//     queryFn: async () => {
//       const response = await apiRequest("GET", "/api/instagram/accounts");
//       const json = await response.json();
//       return json.data ?? [];
//     },
//     enabled: open,
//   });

//   useEffect(() => {
//     if (!open) return;

//     if (isEditMode && editingAutomation) {
//       setName(editingAutomation.name);
//       setAccountId(editingAutomation.accountId);
//       setKeywordsInput(editingAutomation.keywords.join(", "));
//       setMatchType(editingAutomation.matchType);
//       setCaseInsensitive(editingAutomation.caseInsensitive);
//       setReplyComment(editingAutomation.replyComment);
//       setReplyCommentMessage(editingAutomation.replyCommentMessage ?? "");
//       setSendDm(editingAutomation.sendDm);
//       setDmMessage(editingAutomation.dmMessage ?? "");
//       setDelaySeconds(editingAutomation.delaySeconds);
//       setRunOnce(editingAutomation.runOnce);
//     } else {
//       setName("");
//       setKeywordsInput("");
//       setMatchType("contains");
//       setCaseInsensitive(true);
//       setReplyComment(false);
//       setReplyCommentMessage("");
//       setSendDm(false);
//       setDmMessage("");
//       setDelaySeconds(0);
//       setRunOnce(true);
//       if (!accountId && accounts.length > 0) setAccountId(accounts[0].id);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [open, isEditMode, editingAutomation, accounts]);

//   const resetAndClose = () => {
//     setName("");
//     setKeywordsInput("");
//     onOpenChange(false);
//   };

//   const invalidateList = () => {
//     queryClient.invalidateQueries({ queryKey: ["/api/instagram/automations"] });
//   };

//   const createMutation = useMutation({
//     mutationFn: createInstagramAutomation,
//     onSuccess: () => {
//       invalidateList();
//       toast({ title: "Automation created", description: "Your automation is now active." });
//       onSaved();
//       resetAndClose();
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Failed to create automation",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: (payload: Parameters<typeof updateInstagramAutomation>[1]) =>
//       updateInstagramAutomation(editingAutomation!.id, payload),
//     onSuccess: () => {
//       invalidateList();
//       toast({ title: "Automation updated", description: "Your changes have been saved." });
//       onSaved();
//       resetAndClose();
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Failed to update automation",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const isSaving = createMutation.isPending || updateMutation.isPending;

//   const handleSave = () => {
//     if (!name.trim()) {
//       toast({ title: "Name is required", variant: "destructive" });
//       return;
//     }
//     if (!accountId) {
//       toast({ title: "Select an Instagram account", variant: "destructive" });
//       return;
//     }
//     const keywords = keywordsInput
//       .split(",")
//       .map((k) => k.trim())
//       .filter(Boolean);
//     if (keywords.length === 0) {
//       toast({ title: "Add at least one keyword", variant: "destructive" });
//       return;
//     }
//     if (!replyComment && !sendDm) {
//       toast({ title: "Enable at least one action", description: "Reply to comment or Send DM.", variant: "destructive" });
//       return;
//     }

//     const payload = {
//       name,
//       channelId,
//       accountId,
//       keywords,
//       matchType,
//       caseInsensitive,
//       replyComment,
//       replyCommentMessage: replyComment ? replyCommentMessage : null,
//       sendDm,
//       dmMessage: sendDm ? dmMessage : null,
//       delaySeconds,
//       runOnce,
//       status: (editingAutomation?.status ?? "active") as "active" | "paused",
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
//           <DialogTitle>{isEditMode ? "Edit Automation" : "Create Automation"}</DialogTitle>
//           <DialogDescription>
//             Automatically reply to comments and send DMs when a keyword matches.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-5 mt-2">
//           {/* Name + Account */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             <div>
//               <Label htmlFor="automation-name" className="text-sm text-gray-700">
//                 Name
//               </Label>
//               <Input
//                 id="automation-name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="e.g. Price DM auto-reply"
//                 className="mt-1.5"
//               />
//             </div>
//             <div>
//               <Label className="text-sm text-gray-700">Instagram Account</Label>
//               <select
//                 value={accountId}
//                 onChange={(e) => setAccountId(e.target.value)}
//                 className="mt-1.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
//               >
//                 {accounts.map((acc) => (
//                   <option key={acc.id} value={acc.id}>
//                     @{acc.username}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Trigger */}
//           <div>
//             <Label className="text-sm text-gray-700">Trigger</Label>
//             <div className="mt-1.5">
//               <Badge variant="secondary" className="text-xs flex items-center gap-1 w-fit">
//                 <MessageCircle className="w-3 h-3" /> New Instagram Comment
//               </Badge>
//             </div>
//           </div>

//           {/* Conditions */}
//           <div>
//             <Label htmlFor="automation-keywords" className="text-sm text-gray-700">
//               Keywords (comma separated)
//             </Label>
//             <Input
//               id="automation-keywords"
//               value={keywordsInput}
//               onChange={(e) => setKeywordsInput(e.target.value)}
//               placeholder="price, cost, how much"
//               className="mt-1.5"
//             />

//             <div className="mt-3 grid grid-cols-2 gap-3">
//               <div>
//                 <Label className="text-xs text-gray-500">Match Type</Label>
//                 <div className="mt-1.5 flex gap-1.5 flex-wrap">
//                   {MATCH_TYPES.map(({ value, label }) => (
//                     <button
//                       key={value}
//                       type="button"
//                       onClick={() => setMatchType(value)}
//                       className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
//                         matchType === value
//                           ? "bg-emerald-600 border-emerald-600 text-white"
//                           : "border-gray-200 text-gray-600 hover:bg-gray-50"
//                       }`}
//                     >
//                       {label}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <div>
//                 <Label className="text-xs text-gray-500">Case Sensitivity</Label>
//                 <div className="mt-1.5 flex gap-1.5">
//                   <button
//                     type="button"
//                     onClick={() => setCaseInsensitive(true)}
//                     className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
//                       caseInsensitive
//                         ? "bg-emerald-600 border-emerald-600 text-white"
//                         : "border-gray-200 text-gray-600 hover:bg-gray-50"
//                     }`}
//                   >
//                     Case-insensitive
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setCaseInsensitive(false)}
//                     className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
//                       !caseInsensitive
//                         ? "bg-emerald-600 border-emerald-600 text-white"
//                         : "border-gray-200 text-gray-600 hover:bg-gray-50"
//                     }`}
//                   >
//                     Case-sensitive
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="space-y-3">
//             <Label className="text-sm text-gray-700">Actions</Label>

//             <div className="border border-gray-200 rounded-lg p-3">
//               <button
//                 type="button"
//                 onClick={() => setReplyComment((v) => !v)}
//                 className="flex items-center justify-between w-full"
//               >
//                 <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                   <Reply className="w-4 h-4 text-gray-500" /> Reply to Comment
//                 </span>
//                 <span
//                   className={`text-xs px-2 py-1 rounded-full ${
//                     replyComment ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
//                   }`}
//                 >
//                   {replyComment ? "On" : "Off"}
//                 </span>
//               </button>
//               {replyComment && (
//                 <Textarea
//                   value={replyCommentMessage}
//                   onChange={(e) => setReplyCommentMessage(e.target.value)}
//                   placeholder="Thanks for your comment! Check your DMs 🙌"
//                   rows={2}
//                   className="mt-2 resize-none"
//                 />
//               )}
//             </div>

//             <div className="border border-gray-200 rounded-lg p-3">
//               <button
//                 type="button"
//                 onClick={() => setSendDm((v) => !v)}
//                 className="flex items-center justify-between w-full"
//               >
//                 <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                   <Send className="w-4 h-4 text-gray-500" /> Send Instagram DM
//                 </span>
//                 <span
//                   className={`text-xs px-2 py-1 rounded-full ${
//                     sendDm ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
//                   }`}
//                 >
//                   {sendDm ? "On" : "Off"}
//                 </span>
//               </button>
//               {sendDm && (
//                 <Textarea
//                   value={dmMessage}
//                   onChange={(e) => setDmMessage(e.target.value)}
//                   placeholder="Hey! Here's the info you asked for..."
//                   rows={2}
//                   className="mt-2 resize-none"
//                 />
//               )}
//             </div>
//           </div>

//           {/* Delay + Run once */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <Label htmlFor="automation-delay" className="text-sm text-gray-700">
//                 Delay (seconds)
//               </Label>
//               <Input
//                 id="automation-delay"
//                 type="number"
//                 min={0}
//                 value={delaySeconds}
//                 onChange={(e) => setDelaySeconds(Math.max(0, Number(e.target.value) || 0))}
//                 className="mt-1.5"
//               />
//             </div>
//             <div>
//               <Label className="text-sm text-gray-700">Run Once Per User</Label>
//               <button
//                 type="button"
//                 onClick={() => setRunOnce((v) => !v)}
//                 className={`mt-1.5 w-full text-xs px-3 py-2 rounded-lg border transition-colors ${
//                   runOnce
//                     ? "bg-emerald-50 border-emerald-200 text-emerald-700"
//                     : "border-gray-200 text-gray-600"
//                 }`}
//               >
//                 {runOnce ? "Enabled — won't repeat per user" : "Disabled — runs every time"}
//               </button>
//             </div>
//           </div>
//         </div>

//         <DialogFooter className="gap-2 sm:gap-2 mt-4">
//           <Button variant="outline" onClick={resetAndClose} disabled={isSaving}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleSave}
//             disabled={isSaving}
//             className="bg-emerald-600 hover:bg-emerald-700 text-white"
//           >
//             {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//             {isEditMode ? "Save Changes" : "Create Automation"}
//           </Button>
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Instagram,
  MessageCircle,
  Reply,
  Send,
  Loader2,
  Clock,
  Sparkles,
  UserCheck,
  Tag,
  AtSign,
  MessageSquarePlus
} from "lucide-react";



// Header me use karne ke liye:

import {
  createInstagramAutomation,
  updateInstagramAutomation,
  type InstagramAutomationApi,
  type MatchType,
} from "@/lib/api/instagram-automation-api";

interface CreateAutomationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  editingAutomation: InstagramAutomationApi | null;
  onSaved: () => void;
}

interface InstagramAccountOption {
  id: string;
  username: string;
}

const MATCH_TYPES: { value: MatchType; label: string }[] = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Exact Match" },
  { value: "starts_with", label: "Starts With" },
];

export function CreateAutomationModal({
  open,
  onOpenChange,
  channelId,
  editingAutomation,
  onSaved,
}: CreateAutomationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!editingAutomation;

  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [matchType, setMatchType] = useState<MatchType>("contains");
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [replyComment, setReplyComment] = useState(false);
  const [replyCommentMessage, setReplyCommentMessage] = useState("");
  const [sendDm, setSendDm] = useState(false);
  const [dmMessage, setDmMessage] = useState("");
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [runOnce, setRunOnce] = useState(true);

  const { data: accounts = [] } = useQuery<InstagramAccountOption[]>({
    queryKey: ["/api/instagram/accounts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/instagram/accounts");
      const json = await response.json();
      return json.data ?? [];
    },
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;

    if (isEditMode && editingAutomation) {
      setName(editingAutomation.name);
      setAccountId(editingAutomation.accountId);
      setKeywordsInput(editingAutomation.keywords.join(", "));
      setMatchType(editingAutomation.matchType);
      setCaseInsensitive(editingAutomation.caseInsensitive);
      setReplyComment(editingAutomation.replyComment);
      setReplyCommentMessage(editingAutomation.replyCommentMessage ?? "");
      setSendDm(editingAutomation.sendDm);
      setDmMessage(editingAutomation.dmMessage ?? "");
      setDelaySeconds(editingAutomation.delaySeconds);
      setRunOnce(editingAutomation.runOnce);
    } else {
      setName("");
      setKeywordsInput("");
      setMatchType("contains");
      setCaseInsensitive(true);
      setReplyComment(false);
      setReplyCommentMessage("");
      setSendDm(false);
      setDmMessage("");
      setDelaySeconds(0);
      setRunOnce(true);
      if (!accountId && accounts.length > 0) setAccountId(accounts[0].id);
    }
  }, [open, isEditMode, editingAutomation, accounts]);

  const resetAndClose = () => {
    setName("");
    setKeywordsInput("");
    onOpenChange(false);
  };

  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/instagram/automations"] });
  };

  const createMutation = useMutation({
    mutationFn: createInstagramAutomation,
    onSuccess: () => {
      invalidateList();
      toast({ title: "Automation created", description: "Your rule is active now." });
      onSaved();
      resetAndClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create automation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateInstagramAutomation>[1]) =>
      updateInstagramAutomation(editingAutomation!.id, payload),
    onSuccess: () => {
      invalidateList();
      toast({ title: "Automation updated", description: "Your changes have been saved." });
      onSaved();
      resetAndClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update automation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (!accountId) {
      toast({ title: "Select an Instagram account", variant: "destructive" });
      return;
    }
    const keywords = keywordsInput
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    if (keywords.length === 0) {
      toast({ title: "Add at least one keyword", variant: "destructive" });
      return;
    }
    if (!replyComment && !sendDm) {
      toast({
        title: "Enable at least one action",
        description: "Select Reply to comment or Send DM.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name,
      channelId,
      accountId,
      keywords,
      matchType,
      caseInsensitive,
      replyComment,
      replyCommentMessage: replyComment ? replyCommentMessage : null,
      sendDm,
      dmMessage: sendDm ? dmMessage : null,
      delaySeconds,
      runOnce,
      status: (editingAutomation?.status ?? "active") as "active" | "paused",
    };

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-gray-100 shadow-2xl">
        {/* Header with Styled Accent */}
        <div className="p-6 pb-4 border-b border-gray-100 bg-slate-50/50">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-emerald-100/60 text-emerald-700">
                <Sparkles className="w-5 h-5" />
              </span>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {isEditMode ? "Edit Automation Rule" : "Create Comment → DM Rule"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-gray-500">
              Auto-reply to Instagram comments and trigger direct messages instantly upon keyword match.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Rule Name & Account Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="automation-name" className="text-xs font-semibold text-gray-700">
                Rule Name
              </Label>
              <Input
                id="automation-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Price Inquiry Auto DM"
                className="h-10 text-sm rounded-xl border-gray-200 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Connected Account</Label>
              <div className="relative">
                <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium text-gray-800"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Trigger Banner */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Instagram className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-950">Trigger Event</p>
                <p className="text-[11px] text-emerald-700">Runs when a user comments on your post</p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none text-[10px]">
              Comment Event
            </Badge>
          </div>

          {/* Target Keywords & Match Settings */}
          <div className="space-y-3 p-4 bg-gray-50/60 rounded-xl border border-gray-100">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="automation-keywords" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-gray-500" /> Target Keywords
                </Label>
                <span className="text-[11px] text-gray-400">Comma separated</span>
              </div>
              <Input
                id="automation-keywords"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="price, cost, link, info, buy"
                className="h-10 text-sm bg-white border-gray-200 rounded-xl focus-visible:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <Label className="text-[11px] font-medium text-gray-500 mb-1.5 block">Match Strategy</Label>
                <div className="flex p-0.5 bg-gray-200/60 rounded-lg text-xs">
                  {MATCH_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMatchType(value)}
                      className={`flex-1 py-1 px-2 rounded-md font-medium transition-all text-center ${
                        matchType === value
                          ? "bg-white text-gray-900 shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-[11px] font-medium text-gray-500 mb-1.5 block">Case Match</Label>
                <div className="flex p-0.5 bg-gray-200/60 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setCaseInsensitive(true)}
                    className={`flex-1 py-1 px-2 rounded-md font-medium transition-all text-center ${
                      caseInsensitive ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Insensitive
                  </button>
                  <button
                    type="button"
                    onClick={() => setCaseInsensitive(false)}
                    className={`flex-1 py-1 px-2 rounded-md font-medium transition-all text-center ${
                      !caseInsensitive ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Exact Case
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Blocks */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-gray-700">Actions to Perform</Label>

            {/* Action 1: Public Comment */}
            <div className={`p-4 rounded-xl border transition-all ${
              replyComment ? "bg-white border-emerald-300 shadow-sm" : "bg-gray-50/50 border-gray-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    replyComment ? "bg-emerald-100 text-emerald-700" : "bg-gray-200/80 text-gray-500"
                  }`}>
                    <Reply className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Reply to Public Comment</p>
                    <p className="text-[11px] text-gray-500">Post a direct public reply under user's comment</p>
                  </div>
                </div>
                <Switch checked={replyComment} onCheckedChange={setReplyComment} />
              </div>

              {replyComment && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Textarea
                    value={replyCommentMessage}
                    onChange={(e) => setReplyCommentMessage(e.target.value)}
                    placeholder="Thanks for asking! Check your DMs for details 🙌"
                    rows={2}
                    className="text-xs resize-none rounded-lg border-gray-200 focus-visible:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Action 2: Direct Message */}
            <div className={`p-4 rounded-xl border transition-all ${
              sendDm ? "bg-white border-emerald-300 shadow-sm" : "bg-gray-50/50 border-gray-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    sendDm ? "bg-emerald-100 text-emerald-700" : "bg-gray-200/80 text-gray-500"
                  }`}>
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Send Direct Message (DM)</p>
                    <p className="text-[11px] text-gray-500">Send automated private message into user's DM inbox</p>
                  </div>
                </div>
                <Switch checked={sendDm} onCheckedChange={setSendDm} />
              </div>

              {sendDm && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Textarea
                    value={dmMessage}
                    onChange={(e) => setDmMessage(e.target.value)}
                    placeholder="Hey! Here is the link you requested: https://example.com"
                    rows={3}
                    className="text-xs resize-none rounded-lg border-gray-200 focus-visible:ring-emerald-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Execution Strategy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="automation-delay" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-500" /> Response Delay
              </Label>
              <div className="relative">
                <Input
                  id="automation-delay"
                  type="number"
                  min={0}
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(Math.max(0, Number(e.target.value) || 0))}
                  className="h-10 text-sm rounded-xl border-gray-200 pr-16 focus-visible:ring-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 pointer-events-none">
                  seconds
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-gray-500" /> Repeat Limit
              </Label>
              <button
                type="button"
                onClick={() => setRunOnce((v) => !v)}
                className={`w-full h-10 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                  runOnce
                    ? "bg-emerald-50/60 border-emerald-200 text-emerald-800"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{runOnce ? "Run once per user" : "Run every time"}</span>
                <span className={`w-2 h-2 rounded-full ${runOnce ? "bg-emerald-600" : "bg-gray-400"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={resetAndClose} disabled={isSaving} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs px-5"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditMode ? "Save Changes" : "Create Rule"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}