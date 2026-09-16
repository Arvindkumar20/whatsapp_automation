// import { useState } from "react";
// import { formatDistanceToNow } from "date-fns";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   TestTube,
//   RefreshCw,
//   Unplug,
//   Trash2,
//   MoreVertical,
//   ChevronDown,
//   ChevronUp,
//   Shield,
//   Zap,
//   Activity,
//   Webhook,
//   KeyRound,
//   ShieldCheck,
//   AlertTriangle,
//   CheckCircle,
//   XCircle,
//   Loader2,
//   Radio,
// } from "lucide-react";

// export interface InstagramAccountCardData {
//   id: string;
//   username: string;
//   instagramBusinessId: string;
//   facebookPageId?: string | null;
//   connectedAt: string;
//   isActive: boolean;
//   connectionStatus?: "connected" | "warning" | "error";
//   accessTokenStatus?: "valid" | "expiring" | "expired";
//   permissionsStatus?: "granted" | "partial" | "revoked";
//   permissions?: string[];
//   enabledFeatures?: string[];
//   lastHealthCheck?: string;
//   healthError?: string;
//   profilePictureUrl?: string | null;
// }

// interface InstagramAccountCardProps {
//   account: InstagramAccountCardData;
//   webhookStatus: "subscribed" | "not_subscribed" | "unknown" | "loading" | undefined;
//   isDemoUser: boolean;
//   isTesting: boolean;
//   isReconnectDisabled: boolean;
//   isDisconnectPending: boolean;
//   isDeletePending: boolean;
//   isSubscribePending: boolean;
//   onTestConnection: (accountId: string) => void;
//   onReconnect: (accountId: string) => void;
//   onDisconnect: (accountId: string) => void;
//   onDelete: (accountId: string) => void;
//   onRefreshWebhook: (accountId: string) => void;
//   onSubscribeWebhook: (accountId: string) => void;
// }

// const ALL_PERMISSIONS = [
//   "instagram_business_basic",
//   "instagram_business_manage_messages",
//   "instagram_business_manage_comments",
// ];

// const ALL_FEATURES = [
//   "Team Inbox",
//   "Automation",
//   "Comment Reply",
//   "Comment \u2192 DM",
//   "Analytics",
//   "AI Assistant",
// ];

// function ConnectionStatusBadge({ status }: { status?: string }) {
//   const variant =
//     status === "connected"
//       ? "success"
//       : status === "warning"
//       ? "warning"
//       : status === "error"
//       ? "destructive"
//       : "secondary";
//   const label =
//     status === "connected"
//       ? "Connected"
//       : status === "warning"
//       ? "Warning"
//       : status === "error"
//       ? "Error"
//       : "Unknown";
//   return (
//     <Badge variant={variant as any} className="capitalize">
//       {label}
//     </Badge>
//   );
// }

// function WebhookStatusBadge({
//   status,
// }: {
//   status: InstagramAccountCardProps["webhookStatus"];
// }) {
//   if (status === "loading") {
//     return (
//       <Badge variant="secondary" className="text-xs flex items-center gap-1">
//         <Loader2 className="w-3 h-3 animate-spin" /> Checking...
//       </Badge>
//     );
//   }
//   if (status === "subscribed") {
//     return (
//       <Badge
//         variant="secondary"
//         className="text-xs flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
//       >
//         <CheckCircle className="w-3 h-3" /> Subscribed
//       </Badge>
//     );
//   }
//   if (status === "not_subscribed") {
//     return (
//       <Badge
//         variant="secondary"
//         className="text-xs flex items-center gap-1 bg-red-50 text-red-700 border-red-200"
//       >
//         <XCircle className="w-3 h-3" /> Not Subscribed
//       </Badge>
//     );
//   }
//   return (
//     <Badge
//       variant="secondary"
//       className="text-xs flex items-center gap-1 bg-gray-50 text-gray-600 border-gray-200"
//     >
//       <AlertTriangle className="w-3 h-3" /> Unknown
//     </Badge>
//   );
// }

// export function InstagramAccountCard({
//   account,
//   webhookStatus,
//   isDemoUser,
//   isTesting,
//   isReconnectDisabled,
//   isDisconnectPending,
//   isDeletePending,
//   isSubscribePending,
//   onTestConnection,
//   onReconnect,
//   onDisconnect,
//   onDelete,
//   onRefreshWebhook,
//   onSubscribeWebhook,
// }: InstagramAccountCardProps) {
//   const [healthOpen, setHealthOpen] = useState(false);

//   const displayUsername = isDemoUser
//     ? account.username.slice(0, -1).replace(/./g, "*") + account.username.slice(-1)
//     : account.username;

//   const displayId = isDemoUser
//     ? account.instagramBusinessId?.slice(0, -4).replace(/./g, "*") +
//       account.instagramBusinessId?.slice(-4)
//     : account.instagramBusinessId;

//   const initials = account.username?.slice(0, 2).toUpperCase() || "IG";

//   return (
//     <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
//       {/* Top row: avatar, username, status, actions */}
//       <div className="flex items-start justify-between gap-3 flex-wrap">
//         <div className="flex items-center gap-3 min-w-0">
//           <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden flex-shrink-0">
//             {account.profilePictureUrl ? (
//               <img
//                 src={account.profilePictureUrl}
//                 alt={displayUsername}
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <span className="text-xs font-semibold text-pink-700">{initials}</span>
//             )}
//           </div>
//           <div className="min-w-0">
//             <div className="flex items-center gap-2 flex-wrap">
//               <h3 className="font-semibold text-sm sm:text-base truncate">
//                 @{displayUsername}
//               </h3>
//               {account.isActive ? (
//                 <Badge variant="success" className="text-xs">
//                   Active
//                 </Badge>
//               ) : (
//                 <Badge variant="destructive" className="text-xs">
//                   Disconnected
//                 </Badge>
//               )}
//             </div>
//             <p className="text-xs text-gray-500 font-mono truncate">{displayId}</p>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <ConnectionStatusBadge status={account.connectionStatus} />
//           <Button
//             variant="outline"
//             size="sm"
//             disabled={isDemoUser || isTesting}
//             onClick={() => onTestConnection(account.id)}
//             className="text-xs"
//           >
//             {isTesting ? (
//               <Loader2 className="w-3.5 h-3.5 sm:mr-1 animate-spin" />
//             ) : (
//               <TestTube className="w-3.5 h-3.5 sm:mr-1" />
//             )}
//             <span className="hidden sm:inline">Test Connection</span>
//           </Button>

//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" size="sm" className="px-2" disabled={isDemoUser}>
//                 <MoreVertical className="w-4 h-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem
//                 disabled={isReconnectDisabled}
//                 onClick={() => onReconnect(account.id)}
//                 className="text-orange-600 focus:text-orange-700"
//               >
//                 <RefreshCw className="w-4 h-4 mr-2" /> Reconnect
//               </DropdownMenuItem>
//               <DropdownMenuItem
//                 disabled={isDisconnectPending}
//                 onClick={() => onDisconnect(account.id)}
//                 className="text-red-600 focus:text-red-700"
//               >
//                 <Unplug className="w-4 h-4 mr-2" /> Disconnect
//               </DropdownMenuItem>
//               <DropdownMenuItem
//                 disabled={isDeletePending}
//                 onClick={() => onDelete(account.id)}
//                 className="text-red-600 focus:text-red-700"
//               >
//                 <Trash2 className="w-4 h-4 mr-2" /> Delete
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       {/* Compact meta row */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs sm:text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
//         <div>
//           <span className="text-gray-400">Connected</span>{" "}
//           {account.connectedAt
//             ? formatDistanceToNow(new Date(account.connectedAt), { addSuffix: true })
//             : "Not set"}
//         </div>
//         <div className="flex items-center gap-1">
//           <span className="text-gray-400">Webhook</span>
//           <WebhookStatusBadge status={webhookStatus} />
//         </div>
//         {account.facebookPageId && (
//           <div className="truncate">
//             <span className="text-gray-400">FB Page ID</span> {account.facebookPageId}
//           </div>
//         )}
//       </div>

//       {/* Permissions */}
//       <div className="mt-3 pt-3 border-t border-gray-100">
//         <div className="flex items-center gap-2 mb-2">
//           <Shield className="w-4 h-4 text-gray-500 flex-shrink-0" />
//           <span className="text-sm font-medium text-gray-700">Permissions</span>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           {(account.permissions ?? ALL_PERMISSIONS).map((perm) => (
//             <Badge
//               key={perm}
//               variant="secondary"
//               className="text-xs bg-pink-50 text-pink-700 border-pink-200"
//             >
//               {perm}
//             </Badge>
//           ))}
//         </div>
//       </div>

//       {/* Enabled Features */}
//       <div className="mt-3 pt-3 border-t border-gray-100">
//         <div className="flex items-center gap-2 mb-2">
//           <Zap className="w-4 h-4 text-gray-500 flex-shrink-0" />
//           <span className="text-sm font-medium text-gray-700">Enabled Features</span>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           {(account.enabledFeatures ?? ALL_FEATURES).map((feature) => (
//             <Badge key={feature} variant="secondary" className="text-xs">
//               {feature}
//             </Badge>
//           ))}
//         </div>
//       </div>

//       {/* Delivery webhook subscribe (only shown when actionable) */}
//       {(webhookStatus === "not_subscribed" || webhookStatus === "loading") && (
//         <div className="mt-3 pt-3 border-t border-gray-100">
//           <div className="flex items-center justify-between gap-2 flex-wrap">
//             <div className="flex items-center gap-2">
//               <Radio className="w-4 h-4 text-gray-500 flex-shrink-0" />
//               <span className="text-sm font-medium text-gray-700">Delivery Webhooks</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => onRefreshWebhook(account.id)}
//                 disabled={webhookStatus === "loading"}
//                 className="text-xs px-2"
//                 title="Refresh subscription status"
//               >
//                 <RefreshCw className="w-3 h-3" />
//               </Button>
//               {webhookStatus === "not_subscribed" && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => onSubscribeWebhook(account.id)}
//                   disabled={isSubscribePending}
//                   className="text-xs h-7 px-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
//                 >
//                   {isSubscribePending ? (
//                     <Loader2 className="w-3 h-3 mr-1 animate-spin" />
//                   ) : (
//                     <Radio className="w-3 h-3 mr-1" />
//                   )}
//                   Subscribe
//                 </Button>
//               )}
//             </div>
//           </div>
//           {webhookStatus === "not_subscribed" && (
//             <p className="text-xs text-red-600 mt-2 flex items-start gap-1">
//               <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
//               Not subscribed to Instagram webhooks — message/comment delivery may be delayed.
//             </p>
//           )}
//         </div>
//       )}

//       {/* Channel Health — collapsible, collapsed by default */}
//       <div className="mt-3 pt-3 border-t border-gray-100">
//         <button
//           onClick={() => setHealthOpen((v) => !v)}
//           className="flex items-center justify-between w-full text-left"
//         >
//           <div className="flex items-center gap-2">
//             <Shield className="w-4 h-4 text-gray-500 flex-shrink-0" />
//             <span className="text-sm font-medium text-gray-700">Channel Health</span>
//             {account.lastHealthCheck && (
//               <span className="text-[10px] sm:text-xs text-gray-400">
//                 checked {formatDistanceToNow(new Date(account.lastHealthCheck), { addSuffix: true })}
//               </span>
//             )}
//           </div>
//           {healthOpen ? (
//             <ChevronUp className="w-4 h-4 text-gray-400" />
//           ) : (
//             <ChevronDown className="w-4 h-4 text-gray-400" />
//           )}
//         </button>

//         {healthOpen && (
//           <div className="mt-3">
//             {account.healthError ? (
//               <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs sm:text-sm">
//                 <p className="text-red-700 font-medium break-words">
//                   Error: {account.healthError}
//                 </p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
//                 <div
//                   className={`p-2.5 sm:p-3 rounded-lg border ${
//                     account.connectionStatus === "connected"
//                       ? "bg-green-50 border-green-200"
//                       : "bg-yellow-50 border-yellow-200"
//                   }`}
//                 >
//                   <div className="flex items-center space-x-2 mb-1">
//                     <Activity
//                       className={`w-3.5 h-3.5 flex-shrink-0 ${
//                         account.connectionStatus === "connected"
//                           ? "text-green-600"
//                           : "text-yellow-600"
//                       }`}
//                     />
//                     <span className="text-[10px] sm:text-xs font-medium text-gray-600">
//                       Connection
//                     </span>
//                   </div>
//                   <p
//                     className={`font-semibold text-sm ${
//                       account.connectionStatus === "connected"
//                         ? "text-green-700"
//                         : "text-yellow-700"
//                     }`}
//                   >
//                     {account.connectionStatus === "connected" ? "Connected" : "Warning"}
//                   </p>
//                 </div>

//                 <div
//                   className={`p-2.5 sm:p-3 rounded-lg border ${
//                     webhookStatus === "subscribed"
//                       ? "bg-emerald-50 border-emerald-200"
//                       : "bg-amber-50 border-amber-200"
//                   }`}
//                 >
//                   <div className="flex items-center space-x-2 mb-1">
//                     <Webhook
//                       className={`w-3.5 h-3.5 flex-shrink-0 ${
//                         webhookStatus === "subscribed" ? "text-emerald-600" : "text-amber-600"
//                       }`}
//                     />
//                     <span className="text-[10px] sm:text-xs font-medium text-gray-600">
//                       Webhook
//                     </span>
//                   </div>
//                   <p
//                     className={`font-semibold text-sm ${
//                       webhookStatus === "subscribed" ? "text-emerald-700" : "text-amber-700"
//                     }`}
//                   >
//                     {webhookStatus === "subscribed"
//                       ? "Subscribed"
//                       : webhookStatus === "not_subscribed"
//                       ? "Not Subscribed"
//                       : "Unknown"}
//                   </p>
//                 </div>

//                 <div
//                   className={`p-2.5 sm:p-3 rounded-lg border ${
//                     account.accessTokenStatus === "valid"
//                       ? "bg-blue-50 border-blue-200"
//                       : account.accessTokenStatus === "expiring"
//                       ? "bg-amber-50 border-amber-200"
//                       : "bg-red-50 border-red-200"
//                   }`}
//                 >
//                   <div className="flex items-center space-x-2 mb-1">
//                     <KeyRound
//                       className={`w-3.5 h-3.5 flex-shrink-0 ${
//                         account.accessTokenStatus === "valid"
//                           ? "text-blue-600"
//                           : account.accessTokenStatus === "expiring"
//                           ? "text-amber-600"
//                           : "text-red-600"
//                       }`}
//                     />
//                     <span className="text-[10px] sm:text-xs font-medium text-gray-600">
//                       Access Token
//                     </span>
//                   </div>
//                   <p
//                     className={`font-semibold text-sm capitalize ${
//                       account.accessTokenStatus === "valid"
//                         ? "text-blue-700"
//                         : account.accessTokenStatus === "expiring"
//                         ? "text-amber-700"
//                         : "text-red-700"
//                     }`}
//                   >
//                     {account.accessTokenStatus ?? "Unknown"}
//                   </p>
//                 </div>

//                 <div
//                   className={`p-2.5 sm:p-3 rounded-lg border ${
//                     account.permissionsStatus === "granted"
//                       ? "bg-teal-50 border-teal-200"
//                       : "bg-gray-50 border-gray-200"
//                   }`}
//                 >
//                   <div className="flex items-center space-x-2 mb-1">
//                     <ShieldCheck
//                       className={`w-3.5 h-3.5 flex-shrink-0 ${
//                         account.permissionsStatus === "granted"
//                           ? "text-teal-600"
//                           : "text-gray-600"
//                       }`}
//                     />
//                     <span className="text-[10px] sm:text-xs font-medium text-gray-600">
//                       Permissions
//                     </span>
//                   </div>
//                   <p
//                     className={`font-semibold text-sm capitalize ${
//                       account.permissionsStatus === "granted"
//                         ? "text-teal-700"
//                         : "text-gray-700"
//                     }`}
//                   >
//                     {account.permissionsStatus ?? "Unknown"}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }









import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TestTube,
  RefreshCw,
  Unplug,
  Trash2,
  MoreVertical,
  Shield,
  Zap,
  Activity,
  Webhook,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Radio,
  Calendar,
  Layers,
} from "lucide-react";

export interface InstagramAccountCardData {
  id: string;
  username: string;
  instagramBusinessId: string;
  facebookPageId?: string | null;
  connectedAt: string;
  isActive: boolean;
  connectionStatus?: "connected" | "warning" | "error";
  accessTokenStatus?: "valid" | "expiring" | "expired";
  permissionsStatus?: "granted" | "partial" | "revoked";
  permissions?: string[];
  enabledFeatures?: string[];
  lastHealthCheck?: string;
  healthError?: string;
  profilePictureUrl?: string | null;
}

interface InstagramAccountCardProps {
  account: InstagramAccountCardData;
  webhookStatus: "subscribed" | "not_subscribed" | "unknown" | "loading" | undefined;
  isDemoUser: boolean;
  isTesting: boolean;
  isReconnectDisabled: boolean;
  isDisconnectPending: boolean;
  isDeletePending: boolean;
  isSubscribePending: boolean;
  onTestConnection: (accountId: string) => void;
  onReconnect: (accountId: string) => void;
  onDisconnect: (accountId: string) => void;
  onDelete: (accountId: string) => void;
  onRefreshWebhook: (accountId: string) => void;
  onSubscribeWebhook: (accountId: string) => void;
}

const ALL_PERMISSIONS = [
  "instagram_business_basic",
  "instagram_business_manage_messages",
  "instagram_business_manage_comments",
  "instagram_business_content_publish"
];

const ALL_FEATURES = [
  "Team Inbox",
  "Automation",
  "Comment Reply",
  "Comment \u2192 DM",
  "Analytics",
  "AI Assistant",
];

function ConnectionStatusBadge({ status }: { status?: string }) {
  const variant =
    status === "connected"
      ? "success"
      : status === "warning"
      ? "warning"
      : status === "error"
      ? "destructive"
      : "secondary";
  const label =
    status === "connected"
      ? "Connected"
      : status === "warning"
      ? "Warning"
      : status === "error"
      ? "Error"
      : "Unknown";
  return (
    <Badge variant={variant as any} className="capitalize text-xs">
      {label}
    </Badge>
  );
}

function WebhookStatusBadge({
  status,
}: {
  status: InstagramAccountCardProps["webhookStatus"];
}) {
  if (status === "loading") {
    return (
      <Badge variant="secondary" className="text-xs flex items-center gap-1">
        <Loader2 className="w-3 h-3 animate-spin" /> Checking...
      </Badge>
    );
  }
  if (status === "subscribed") {
    return (
      <Badge
        variant="secondary"
        className="text-xs flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
      >
        <CheckCircle className="w-3 h-3" /> Subscribed
      </Badge>
    );
  }
  if (status === "not_subscribed") {
    return (
      <Badge
        variant="secondary"
        className="text-xs flex items-center gap-1 bg-red-50 text-red-700 border-red-200"
      >
        <XCircle className="w-3 h-3" /> Not Subscribed
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="text-xs flex items-center gap-1 bg-gray-50 text-gray-600 border-gray-200"
    >
      <AlertTriangle className="w-3 h-3" /> Unknown
    </Badge>
  );
}

export function InstagramAccountCard({
  account,
  webhookStatus,
  isDemoUser,
  isTesting,
  isReconnectDisabled,
  isDisconnectPending,
  isDeletePending,
  isSubscribePending,
  onTestConnection,
  onReconnect,
  onDisconnect,
  onDelete,
  onRefreshWebhook,
  onSubscribeWebhook,
}: InstagramAccountCardProps) {
  const displayUsername = isDemoUser
    ? account.username.slice(0, -1).replace(/./g, "*") + account.username.slice(-1)
    : account.username;

  const displayId = isDemoUser
    ? account.instagramBusinessId?.slice(0, -4).replace(/./g, "*") +
      account.instagramBusinessId?.slice(-4)
    : account.instagramBusinessId;

  const initials = account.username?.slice(0, 2).toUpperCase() || "IG";

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-4">
      {/* Header: Avatar, Username & Primary Actions */}
      <div className="flex items-start justify-between gap-3 flex-wrap border-b border-gray-100 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-pink-200">
            {account.profilePictureUrl ? (
              <img
                src={account.profilePictureUrl}
                alt={displayUsername}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-pink-700">{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base truncate text-gray-900">
                @{displayUsername}
              </h3>
              {account.isActive ? (
                <Badge variant="success" className="text-xs">
                  Active
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  Disconnected
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 font-mono truncate">{displayId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ConnectionStatusBadge status={account.connectionStatus} />
          <Button
            variant="outline"
            size="sm"
            disabled={isDemoUser || isTesting}
            onClick={() => onTestConnection(account.id)}
            className="text-xs h-8"
          >
            {isTesting ? (
              <Loader2 className="w-3.5 h-3.5 sm:mr-1 animate-spin" />
            ) : (
              <TestTube className="w-3.5 h-3.5 sm:mr-1" />
            )}
            <span className="hidden sm:inline">Test Connection</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2 h-8" disabled={isDemoUser}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={isReconnectDisabled}
                onClick={() => onReconnect(account.id)}
                className="text-orange-600 focus:text-orange-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Reconnect
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isDisconnectPending}
                onClick={() => onDisconnect(account.id)}
                className="text-red-600 focus:text-red-700"
              >
                <Unplug className="w-4 h-4 mr-2" /> Disconnect
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isDeletePending}
                onClick={() => onDelete(account.id)}
                className="text-red-600 focus:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-3">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <Layers className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="features" className="text-xs sm:text-sm">
            <Zap className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="health" className="text-xs sm:text-sm">
            <Activity className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
            Health
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-3 mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 flex items-center gap-1 text-xs">
                <Calendar className="w-3 h-3" /> Connected
              </span>
              <span className="font-medium text-gray-700">
                {account.connectedAt
                  ? formatDistanceToNow(new Date(account.connectedAt), { addSuffix: true })
                  : "Not set"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs">Webhook Status</span>
              <div>
                <WebhookStatusBadge status={webhookStatus} />
              </div>
            </div>

            {account.facebookPageId && (
              <div className="flex flex-col gap-1 truncate">
                <span className="text-gray-400 text-xs">FB Page ID</span>
                <span className="font-mono text-gray-700 truncate">{account.facebookPageId}</span>
              </div>
            )}
          </div>

          {/* Webhook Quick Action Banner */}
          {(webhookStatus === "not_subscribed" || webhookStatus === "loading") && (
            <div className="p-3 border border-amber-200 bg-amber-50/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-amber-900">
                    Delivery Webhooks
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRefreshWebhook(account.id)}
                    disabled={webhookStatus === "loading"}
                    className="text-xs px-2 h-7"
                    title="Refresh subscription status"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                  {webhookStatus === "not_subscribed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSubscribeWebhook(account.id)}
                      disabled={isSubscribePending}
                      className="text-xs h-7 px-2 text-emerald-700 border-emerald-200 bg-white hover:bg-emerald-50"
                    >
                      {isSubscribePending ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Radio className="w-3 h-3 mr-1" />
                      )}
                      Subscribe
                    </Button>
                  )}
                </div>
              </div>
              {webhookStatus === "not_subscribed" && (
                <p className="text-xs text-red-600 flex items-start gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  Not subscribed to Instagram webhooks — message/comment delivery may be delayed.
                </p>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Permissions & Features */}
        <TabsContent value="features" className="space-y-4 mt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Permissions</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(account.permissions ?? ALL_PERMISSIONS).map((perm) => (
                <Badge
                  key={perm}
                  variant="secondary"
                  className="text-xs bg-pink-50 text-pink-700 border-pink-200"
                >
                  {perm}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Enabled Features</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(account.enabledFeatures ?? ALL_FEATURES).map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Health */}
        <TabsContent value="health" className="space-y-3 mt-0">
          {account.lastHealthCheck && (
            <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
              <span>Health Status Check</span>
              <span>
                checked {formatDistanceToNow(new Date(account.lastHealthCheck), { addSuffix: true })}
              </span>
            </div>
          )}

          {account.healthError ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs sm:text-sm">
              <p className="text-red-700 font-medium break-words">
                Error: {account.healthError}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div
                className={`p-2.5 rounded-lg border ${
                  account.connectionStatus === "connected"
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <Activity
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      account.connectionStatus === "connected"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  />
                  <span className="text-xs font-medium text-gray-600">Connection</span>
                </div>
                <p
                  className={`font-semibold text-xs sm:text-sm ${
                    account.connectionStatus === "connected"
                      ? "text-green-700"
                      : "text-yellow-700"
                  }`}
                >
                  {account.connectionStatus === "connected" ? "Connected" : "Warning"}
                </p>
              </div>

              <div
                className={`p-2.5 rounded-lg border ${
                  webhookStatus === "subscribed"
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <Webhook
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      webhookStatus === "subscribed" ? "text-emerald-600" : "text-amber-600"
                    }`}
                  />
                  <span className="text-xs font-medium text-gray-600">Webhook</span>
                </div>
                <p
                  className={`font-semibold text-xs sm:text-sm ${
                    webhookStatus === "subscribed" ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {webhookStatus === "subscribed"
                    ? "Subscribed"
                    : webhookStatus === "not_subscribed"
                    ? "Not Subscribed"
                    : "Unknown"}
                </p>
              </div>

              <div
                className={`p-2.5 rounded-lg border ${
                  account.accessTokenStatus === "valid"
                    ? "bg-blue-50 border-blue-200"
                    : account.accessTokenStatus === "expiring"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <KeyRound
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      account.accessTokenStatus === "valid"
                        ? "text-blue-600"
                        : account.accessTokenStatus === "expiring"
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  />
                  <span className="text-xs font-medium text-gray-600">Access Token</span>
                </div>
                <p
                  className={`font-semibold text-xs sm:text-sm capitalize ${
                    account.accessTokenStatus === "valid"
                      ? "text-blue-700"
                      : account.accessTokenStatus === "expiring"
                      ? "text-amber-700"
                      : "text-red-700"
                  }`}
                >
                  {account.accessTokenStatus ?? "Unknown"}
                </p>
              </div>

              <div
                className={`p-2.5 rounded-lg border ${
                  account.permissionsStatus === "granted"
                    ? "bg-teal-50 border-teal-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <ShieldCheck
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      account.permissionsStatus === "granted"
                        ? "text-teal-600"
                        : "text-gray-600"
                    }`}
                  />
                  <span className="text-xs font-medium text-gray-600">Permissions</span>
                </div>
                <p
                  className={`font-semibold text-xs sm:text-sm capitalize ${
                    account.permissionsStatus === "granted"
                      ? "text-teal-700"
                      : "text-gray-700"
                  }`}
                >
                  {account.permissionsStatus ?? "Unknown"}
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}