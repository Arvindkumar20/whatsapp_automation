import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Instagram,
  Plus,
  Trash2,
  XCircle,
  Info,
  AlertTriangle,
  Clock,
  Loader2,
  RefreshCw,
  Unplug,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/lib/i18n";
import { InstagramAccountCard } from "../social-accounts/instagram-account-card";

interface InstagramAccount {
  id: string;
  username: string;
  instagramBusinessId: string;
  instagramUserId?: string;
  facebookPageId?: string | null;
  channelId?: string | null;
  authMethod?: "instagram_login" | "facebook_login";
  connectedAt: string;
  isActive: boolean;
  connectionStatus?: "connected" | "warning" | "error";
  webhookStatus?: "subscribed" | "not_subscribed" | "unknown";
  accessTokenStatus?: "valid" | "expiring" | "expired";
  permissionsStatus?: "granted" | "partial" | "revoked";
  permissions?: string[];
  enabledFeatures?: string[];
  lastHealthCheck?: string;
  healthError?: string;
  profilePictureUrl?: string | null;
}

type ProcessingAction = "connect" | "reconnect";

// sessionStorage keys used to remember what we were doing across the
// full-page redirect to Instagram's authorize screen
const SS_ACTION_KEY = "ig_oauth_action";
const SS_ACCOUNT_ID_KEY = "ig_oauth_account_id";
const SS_CHANNEL_ID_KEY = "ig_oauth_channel_id";

// Pass the channelId this settings screen belongs to, e.g. from a route
// param or your channel context: <InstagramSettings channelId={channel.id} />
interface InstagramSettingsProps {
  channelId?: string;
}

export function InstagramSettings({ channelId }: InstagramSettingsProps) {
  const { t } = useTranslation();
  const [webhookSubStatus, setWebhookSubStatus] = useState<Record<string, "subscribed" | "not_subscribed" | "unknown" | "loading">>({});
  const [testingAccountId, setTestingAccountId] = useState<string | null>(null);
  const [showReconnectConfirm, setShowReconnectConfirm] = useState<string | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [accountProcessing, setAccountProcessing] = useState<{ status: "processing" | "error"; action: ProcessingAction; errorMessage?: string } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const handledCallback = useRef(false);
  const isDemoUser = user?.username === "demouser";

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/instagram/accounts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/instagram/accounts");
      const json = await response.json();
      return json.data ?? [];
    },
  });

  // 🔒 Is there already an active account? If yes, "Connect" must be blocked
  // until the user disconnects it — only one active connection at a time.
  const activeAccount = accounts.find((a: InstagramAccount) => a.isActive);
  const hasActiveAccount = !!activeAccount;

  const connectMutation = useMutation({
    mutationFn: async ({ code, channelId }: { code: string; channelId?: string | null }) => {
      return await apiRequest("POST", "/api/instagram/connect", { code, channelId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instagram/accounts"] });
      setAccountProcessing(null);
      toast({
        title: "Instagram Connected",
        description: "Your Instagram account has been connected successfully.",
      });
    },
    onError: (error: any) => {
      const isAlreadyConnected = error?.code === "ACCOUNT_ALREADY_CONNECTED";
      setAccountProcessing({
        status: "error",
        action: "connect",
        errorMessage: isAlreadyConnected
          ? error.message
          : error.message || "Something went wrong. Please try again.",
      });
    },
  });

  const subscribeWebhookMutation = useMutation({
    mutationFn: async (accountId: string) => {
      return await apiRequest("POST", `/api/instagram/${accountId}/webhook-subscription`, {
        fields: ["messages", "comments"],
      });
    },
    onSuccess: async (_data, accountId) => {
      await fetchWebhookSubStatus(accountId);
      toast({
        title: "Subscribed",
        description: "This account will now receive Instagram DM/comment events.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Subscribe Failed",
        description: error.message || "Could not subscribe to Instagram webhooks.",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (accountId: string) => {
      return await apiRequest("POST", "/api/instagram/test", { accountId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/instagram/accounts"] });
      toast({
        title: "Connection Healthy",
        description: "Your Instagram connection is working correctly.",
      });
      setTestingAccountId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Could not verify the Instagram connection.",
        variant: "destructive",
      });
      setTestingAccountId(null);
    },
  });

  const reconnectMutation = useMutation({
    mutationFn: async ({ accountId, code }: { accountId: string; code: string }) => {
      return await apiRequest("POST", "/api/instagram/reconnect", { accountId, code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instagram/accounts"] });
      setAccountProcessing(null);
      setShowReconnectConfirm(null);
      toast({
        title: "Instagram Reconnected",
        description: "Your Instagram account has been reconnected.",
      });
    },
    onError: (error: any) => {
      setAccountProcessing({
        status: "error",
        action: "reconnect",
        errorMessage: error.message || "Something went wrong. Please try again.",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (accountId: string) => {
      return await apiRequest("POST", "/api/instagram/disconnect", { accountId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instagram/accounts"] });
      setShowDisconnectConfirm(null);
      toast({
        title: "Account Disconnected",
        description: "The Instagram account has been disconnected. You can now connect a different account.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Disconnect Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: string) => {
      return await apiRequest("DELETE", `/api/instagram/${accountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instagram/accounts"] });
      setShowDeleteConfirm(null);
      toast({
        title: "Account Deleted",
        description: "The Instagram account has been permanently removed from the platform.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fetchWebhookSubStatus = async (accountId: string) => {
    setWebhookSubStatus((prev) => ({ ...prev, [accountId]: "loading" }));
    try {
      const response = await fetch(`/api/instagram/${accountId}/webhook-subscription`, { credentials: "include" });
      const data = await response.json();
      if (!response.ok) {
        setWebhookSubStatus((prev) => ({ ...prev, [accountId]: "unknown" }));
      } else {
        setWebhookSubStatus((prev) => ({
          ...prev,
          [accountId]: data.subscribed ? "subscribed" : "not_subscribed",
        }));
      }
    } catch {
      setWebhookSubStatus((prev) => ({ ...prev, [accountId]: "unknown" }));
    }
  };

  useEffect(() => {
    if (!accounts || accounts.length === 0) return;
    for (const acc of accounts) {
      if (!webhookSubStatus[acc.id]) {
        fetchWebhookSubStatus(acc.id);
      }
    }
  }, [accounts]);

  // Handle the redirect back from Instagram's authorize screen.
  useEffect(() => {
    if (handledCallback.current) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error_description") || params.get("error");

    if (!code && !error) return;
    handledCallback.current = true;

    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);

    const action = (sessionStorage.getItem(SS_ACTION_KEY) as ProcessingAction | null) ?? "connect";
    const pendingAccountId = sessionStorage.getItem(SS_ACCOUNT_ID_KEY);
    const pendingChannelId = sessionStorage.getItem(SS_CHANNEL_ID_KEY);
    sessionStorage.removeItem(SS_ACTION_KEY);
    sessionStorage.removeItem(SS_ACCOUNT_ID_KEY);
    sessionStorage.removeItem(SS_CHANNEL_ID_KEY);

    if (error) {
      toast({ title: "Instagram sign-in cancelled" });
      return;
    }
    if (!code) return;

    setAccountProcessing({ status: "processing", action });

    if (action === "reconnect" && pendingAccountId) {
      reconnectMutation.mutate({ accountId: pendingAccountId, code });
    } else {
      connectMutation.mutate({ code, channelId: pendingChannelId ?? channelId ?? null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redirectToInstagramLogin = async (
    action: ProcessingAction,
    accountId?: string,
    forChannelId?: string
  ) => {
    try {
      // 🔒 Block a fresh "connect" if an active account already exists.
      if (action === "connect" && hasActiveAccount) {
        toast({
          title: "Already Connected",
          description: `Please disconnect @${activeAccount.username} before connecting a different Instagram account.`,
          variant: "destructive",
        });
        return;
      }

      setAccountProcessing({ status: "processing", action });
      const response = await apiRequest("GET", "/api/instagram/oauth-url");
      const json = await response.json();

      if (!json?.url) {
        throw new Error("Could not build the Instagram sign-in link.");
      }

      sessionStorage.setItem(SS_ACTION_KEY, action);
      if (accountId) sessionStorage.setItem(SS_ACCOUNT_ID_KEY, accountId);
      if (forChannelId) sessionStorage.setItem(SS_CHANNEL_ID_KEY, forChannelId);

      window.location.href = json.url;
    } catch (error: any) {
      setAccountProcessing({
        status: "error",
        action,
        errorMessage: error.message || "Could not start Instagram sign-in. Please try again.",
      });
    }
  };

  const openConnect = () => {
    redirectToInstagramLogin("connect", undefined, channelId);
  };

  const handleTestConnection = (accountId: string) => {
    setTestingAccountId(accountId);
    testConnectionMutation.mutate(accountId);
  };

  const handleReconnect = (accountId: string) => {
    setShowReconnectConfirm(accountId);
  };

  const confirmReconnect = () => {
    if (showReconnectConfirm) {
      redirectToInstagramLogin("reconnect", showReconnectConfirm, channelId);
    }
  };

  const handleDisconnect = (accountId: string) => {
    setShowDisconnectConfirm(accountId);
  };

  const confirmDisconnect = () => {
    if (showDisconnectConfirm) {
      disconnectMutation.mutate(showDisconnectConfirm);
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    setShowDeleteConfirm(accountId);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteAccountMutation.mutate(showDeleteConfirm);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center text-base sm:text-lg min-w-0">
              <Instagram className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="truncate">Instagram Channels</span>
            </CardTitle>

            <Button
              onClick={openConnect}
              size="sm"
              disabled={isDemoUser || hasActiveAccount}
              title={hasActiveAccount ? "Disconnect the current account first" : undefined}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Connect Instagram
            </Button>
          </div>

          <CardDescription className="mt-2 text-sm sm:text-base">
            Connect your Instagram professional account to send and receive Instagram Direct Messages.
          </CardDescription>

          {hasActiveAccount && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Only one Instagram account can be connected at a time. Disconnect{" "}
                <strong>@{activeAccount.username}</strong> before connecting a different account.
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {accountsLoading ? (
            <Loading />
          ) : accounts.length === 0 ? (
            <div className="text-center py-12">
              <Instagram className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No Instagram accounts connected yet.</p>
              <Button onClick={openConnect} disabled={isDemoUser}>
                <Plus className="w-4 h-4 mr-2" />
                Connect Instagram
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account: InstagramAccount) => (
                <InstagramAccountCard
                  key={account.id}
                  account={account}
                  webhookStatus={webhookSubStatus[account.id]}
                  isDemoUser={isDemoUser}
                  isTesting={testingAccountId === account.id}
                  isReconnectDisabled={isDemoUser}
                  isDisconnectPending={isDemoUser || disconnectMutation.isPending}
                  isDeletePending={isDemoUser || deleteAccountMutation.isPending}
                  isSubscribePending={subscribeWebhookMutation.isPending}
                  onTestConnection={handleTestConnection}
                  onReconnect={handleReconnect}
                  onDisconnect={handleDisconnect}
                  onDelete={handleDeleteAccount}
                  onRefreshWebhook={fetchWebhookSubStatus}
                  onSubscribeWebhook={(id) => subscribeWebhookMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reconnect Confirmation Dialog */}
      <Dialog open={!!showReconnectConfirm} onOpenChange={() => setShowReconnectConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-700">
              <RefreshCw className="w-5 h-5" />
              Reconnect Instagram Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reconnect this Instagram account?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-orange-700 space-y-1">
                  <p className="font-medium">This will:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Open Instagram sign-in to refresh the access token and permissions</li>
                    <li>Re-subscribe to Instagram webhooks</li>
                    <li>Keep existing conversations and settings intact</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowReconnectConfirm(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirmReconnect}
              disabled={reconnectMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {reconnectMutation.isPending ? "Reconnecting..." : "Reconnect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={!!showDisconnectConfirm} onOpenChange={() => setShowDisconnectConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Unplug className="w-5 h-5" />
              Disconnect Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect this Instagram account?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-red-700 space-y-1">
                  <p className="font-medium">This will:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Stop all incoming and outgoing Instagram Direct Messages</li>
                    <li>Deregister the webhook subscription</li>
                    <li>Mark the account as inactive</li>
                  </ul>
                  <p className="mt-1">You'll be able to connect a new account after disconnecting this one.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDisconnectConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDisconnect}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="w-5 h-5" />
              Delete Instagram Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this Instagram account?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-red-700 space-y-1">
                  <p className="font-medium">This will permanently:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Remove the account from the platform</li>
                    <li>Remove it from the channel switcher</li>
                    <li>Delete all associated settings</li>
                  </ul>
                  <p className="mt-1 font-medium">This action cannot be undone.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connection Processing Dialog */}
      <Dialog open={!!accountProcessing} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {accountProcessing?.status === "processing" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  {accountProcessing.action === "reconnect"
                    ? "Reconnecting Your Instagram Account"
                    : "Connecting Your Instagram Account"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  We're setting up your Instagram account. This may take a few moments.
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Please don't close or leave this page.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-xs text-amber-700">This usually takes 10-30 seconds</span>
              </div>
            </div>
          )}
          {accountProcessing?.status === "error" && (
            <div className="flex flex-col items-center justify-center py-6 gap-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Connection Failed</h3>
                <p className="text-sm text-muted-foreground">{accountProcessing.errorMessage}</p>
              </div>
              <div className="flex gap-3 mt-2">
                <Button variant="outline" onClick={() => setAccountProcessing(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const action = accountProcessing.action;
                    setAccountProcessing(null);
                    if (action === "reconnect" && showReconnectConfirm) {
                      redirectToInstagramLogin("reconnect", showReconnectConfirm, channelId);
                    } else {
                      openConnect();
                    }
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}