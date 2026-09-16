// /**
//  * ============================================================
//  * © 2025 Diploy — a brand of Bisht Technologies Private Limited
//  * ============================================================
//  *
//  * Mirrors EmbeddedSignupSettings.tsx (WA Onboarding tab) structure and
//  * conventions exactly — same isCreated/isEditing flow, same component set.
//  *
//  * NOTE: this uses plain English strings instead of t("...") translation
//  * keys, since no i18n keys exist yet for this section. If you want this
//  * localized like the rest of Settings, add keys under something like
//  * "settings.instagramApp.*" and swap the strings below for t() calls.
//  */

// import { useEffect, useState } from "react";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import {
//   Instagram,
//   Save,
//   RefreshCw,
//   Eye,
//   EyeOff,
//   Pencil,
// } from "lucide-react";
// import { apiRequest, queryClient } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/contexts/auth-context";

// export function InstagramAppConfigSettings() {
//   const { toast } = useToast();
//   const { user } = useAuth();
//   const isDemo = user?.username === "demoadmin" || user?.username === "demouser";

//   const [form, setForm] = useState({
//     appId: "",
//     appSecret: "",
//     redirectUri: "",
//     webhookVerifyToken: "",
//   });

//   const [showSecret, setShowSecret] = useState(false);
//   const [showVerifyToken, setShowVerifyToken] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);

//   const { data } = useQuery({
//     queryKey: ["/api/instagram-app-config"],
//     queryFn: async () => {
//       const res = await apiRequest("GET", "/api/instagram-app-config");
//       return res.json();
//     },
//   });

//   const isCreated = !!data;

//   useEffect(() => {
//     if (data) {
//       setForm({
//         appId: data.appId || "",
//         appSecret: data.appSecret || "",
//         redirectUri: data.redirectUri || "",
//         webhookVerifyToken: data.webhookVerifyToken || "",
//       });
//     }
//   }, [data]);

//   const saveMutation = useMutation({
//     mutationFn: async () => {
//       return apiRequest("POST", "/api/instagram-app-config", form);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/instagram-app-config"] });
//       setIsEditing(false);
//       toast({
//         title: isCreated ? "Instagram App config updated" : "Instagram App config created",
//         description: "Your changes have been saved successfully.",
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Failed to save",
//         description: error.message || "Something went wrong. Please try again.",
//         variant: "destructive",
//       });
//     },
//   });

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Instagram className="w-5 h-5" />
//               Instagram App Credentials
//               <Badge variant={isCreated ? "default" : "secondary"}>
//                 {isCreated ? "Configured" : "Not Configured"}
//               </Badge>
//             </div>
//             {isCreated && !isEditing && (
//               <Button size="sm" onClick={() => setIsEditing(true)}>
//                 <Pencil className="w-4 h-4 mr-1" />
//                 Edit
//               </Button>
//             )}
//           </CardTitle>
//           <CardDescription>
//             Used for the Instagram Login (direct OAuth) flow — the App ID, App Secret, and
//             Redirect URI from your Instagram App under developers.facebook.com &gt; Instagram
//             API setup with Instagram login.
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-4">
//           {!isCreated && (
//             <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
//               No Instagram App is configured yet. Users won't be able to connect Instagram
//               accounts until this is set up.
//             </div>
//           )}

//           <div className="space-y-2">
//             <Label>Instagram App ID</Label>
//             <Input
//               value={form.appId}
//               disabled={isCreated && !isEditing}
//               onChange={(e) => setForm({ ...form, appId: e.target.value })}
//               placeholder="e.g. 1196050526047560"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label>Instagram App Secret</Label>
//             <div className="relative">
//               <Input
//                 type={showSecret ? "text" : "password"}
//                 value={form.appSecret}
//                 disabled={isCreated && !isEditing}
//                 onChange={(e) => setForm({ ...form, appSecret: e.target.value })}
//                 className="pr-10"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowSecret(!showSecret)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2"
//               >
//                 {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label>Redirect URI</Label>
//             <Input
//               value={form.redirectUri}
//               disabled={isCreated && !isEditing}
//               onChange={(e) => setForm({ ...form, redirectUri: e.target.value })}
//               placeholder="https://yourapp.com/settings"
//             />
//             <p className="text-xs text-muted-foreground">
//               Must exactly match the OAuth redirect URI registered on the Instagram App.
//             </p>
//           </div>

//           <div className="space-y-2">
//             <Label>Webhook Verify Token (optional)</Label>
//             <div className="relative">
//               <Input
//                 type={showVerifyToken ? "text" : "password"}
//                 value={form.webhookVerifyToken}
//                 disabled={isCreated && !isEditing}
//                 onChange={(e) => setForm({ ...form, webhookVerifyToken: e.target.value })}
//                 className="pr-10"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowVerifyToken(!showVerifyToken)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2"
//               >
//                 {showVerifyToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>
//             <p className="text-xs text-muted-foreground">
//               Used to verify the webhook handshake — must match the token configured in the
//               Instagram App's Webhooks section.
//             </p>
//           </div>

//           <div className="flex justify-end gap-2">
//             {(isEditing || !isCreated) && (
//               <Button onClick={() => saveMutation.mutate()} disabled={isDemo}>
//                 {saveMutation.isPending ? (
//                   <>
//                     <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="w-4 h-4 mr-2" />
//                     {isCreated ? "Update" : "Create"}
//                   </>
//                 )}
//               </Button>
//             )}
//             {isEditing && (
//               <Button variant="outline" onClick={() => setIsEditing(false)}>
//                 Cancel
//               </Button>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }







/**
 * ============================================================
 * © 2025 Diploy — a brand of Bisht Technologies Private Limited
 * ============================================================
 *
 * Instagram App configuration + Meta Webhook settings.
 * ============================================================
 */

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Instagram,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Pencil,
  Copy,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

export function InstagramAppConfigSettings() {
  const { toast } = useToast();
  const { user } = useAuth();

  const isDemo =
    user?.username === "demoadmin" || user?.username === "demouser";

  const [form, setForm] = useState({
    appId: "",
    appSecret: "",
    redirectUri: "",
    webhookVerifyToken: "",
  });

  const [showSecret, setShowSecret] = useState(false);
  const [showVerifyToken, setShowVerifyToken] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  /**
   * Dynamic webhook URL.
   */
  const webhookCallbackUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/instagram/webhook`
      : "/api/instagram/webhook";

  const { data, isLoading } = useQuery({
    queryKey: ["/api/instagram-app-config"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/instagram-app-config");
      return res.json();
    },
  });

  const isCreated = !!data;

  useEffect(() => {
    if (data) {
      setForm({
        appId: data.appId || "",
        appSecret: data.appSecret || "",
        redirectUri: data.redirectUri || "",
        webhookVerifyToken: data.webhookVerifyToken || "",
      });
    }
  }, [data]);

  const handleCopy = async (
    text: string,
    setCopiedState: (v: boolean) => void,
    label: string
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      toast({
        title: "Copied",
        description: `${label} copied successfully.`,
      });
      setTimeout(() => setCopiedState(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: `Unable to copy ${label.toLowerCase()}.`,
        variant: "destructive",
      });
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/instagram-app-config", form);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/instagram-app-config"],
      });

      setIsEditing(false);

      toast({
        title: isCreated
          ? "Instagram App config updated"
          : "Instagram App config created",
        description: "Your changes have been saved successfully.",
      });
    },

    onError: (error: any) => {
      toast({
        title: "Failed to save",
        description:
          error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Account Warning */}
      {isDemo && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Demo mode active. Editing settings is disabled.</span>
        </div>
      )}

      <Card className="border border-gray-200 shadow-xs">
        <CardHeader className="border-b border-gray-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Instagram className="w-5 h-5 text-[#1c781f]" />
                <span>Instagram Settings</span>
              </CardTitle>
              <CardDescription className="mt-1 text-xs text-muted-foreground">
                Configure your Meta Developer App credentials and webhooks for Instagram messaging integration.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={isCreated ? "default" : "secondary"}
                className={isCreated ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100" : ""}
              >
                {isCreated ? "Configured" : "Not Configured"}
              </Badge>

              {isCreated && !isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="h-8"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 bg-white">
          {!isCreated && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
              No Instagram App is configured yet. Users won't be able to connect Instagram accounts until this is set up.
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* App ID */}
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Primary Color / App ID</Label>
              <Input
                value={form.appId}
                disabled={isCreated && !isEditing}
                onChange={(e) =>
                  setForm({ ...form, appId: e.target.value })
                }
                placeholder="e.g. 1196050526047560"
                className="bg-white border-gray-200"
              />
              <p className="text-xs text-muted-foreground">
                Found in Meta for Developers dashboard.
              </p>
            </div>

            {/* App Secret */}
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Instagram App Secret</Label>
              <div className="relative">
                <Input
                  type={showSecret ? "text" : "password"}
                  value={form.appSecret}
                  disabled={isCreated && !isEditing}
                  onChange={(e) =>
                    setForm({ ...form, appSecret: e.target.value })
                  }
                  placeholder="Enter App Secret"
                  className="pr-10 bg-white border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecret ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                App secret token provided by Meta.
              </p>
            </div>
          </div>

          {/* Redirect URI */}
          <div className="space-y-2">
            <Label className="font-semibold text-sm">OAuth Redirect URI</Label>
            <Input
              value={form.redirectUri}
              disabled={isCreated && !isEditing}
              onChange={(e) =>
                setForm({ ...form, redirectUri: e.target.value })
              }
              placeholder="https://yourapp.com/settings"
              className="bg-white border-gray-200"
            />
            <p className="text-xs text-muted-foreground">
              Must exactly match the OAuth redirect URI registered in your Meta App settings.
            </p>
          </div>

          <hr className="border-gray-200 my-6" />

          {/* Webhook Configuration Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-gray-900">
              Meta Webhook Configuration
            </h3>

            {/* Webhook Verify Token Input */}
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Webhook Verify Token</Label>
              <div className="relative">
                <Input
                  type={showVerifyToken ? "text" : "password"}
                  value={form.webhookVerifyToken}
                  disabled={isCreated && !isEditing}
                  onChange={(e) =>
                    setForm({ ...form, webhookVerifyToken: e.target.value })
                  }
                  placeholder="Enter a secure verify token"
                  className="pr-10 bg-white border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setShowVerifyToken(!showVerifyToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showVerifyToken ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                The same token must be entered in Meta Developer Webhook settings.
              </p>
            </div>

            {/* Readonly Copy Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Webhook Callback URL</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={webhookCallbackUrl}
                    className="font-mono text-xs bg-gray-50 border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleCopy(webhookCallbackUrl, setCopiedUrl, "Callback URL")
                    }
                    className="shrink-0"
                  >
                    {copiedUrl ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Verify Token for Meta</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    type={showVerifyToken ? "text" : "password"}
                    value={form.webhookVerifyToken}
                    className="font-mono text-xs bg-gray-50 border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!form.webhookVerifyToken}
                    onClick={() =>
                      handleCopy(
                        form.webhookVerifyToken,
                        setCopiedToken,
                        "Verify Token"
                      )
                    }
                    className="shrink-0"
                  >
                    {copiedToken ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Recommended Subscriptions */}
            <div className="pt-2">
              <Label className="text-xs font-semibold text-gray-700 block mb-2">
                Recommended Webhook Events
              </Label>
              <div className="flex flex-wrap gap-2">
                {["messages", "comments", "messaging_postbacks", "messaging_seen"].map(
                  (evt) => (
                    <Badge key={evt} variant="secondary" className="font-mono text-xs bg-gray-100 text-gray-700">
                      {evt}
                    </Badge>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Collapsible Setup Instructions */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/50">
            <button
              type="button"
              onClick={() => setInstructionsOpen(!instructionsOpen)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-100/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-sm text-gray-800">
                  How to configure Instagram Webhooks in Meta
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  instructionsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {instructionsOpen && (
              <div className="px-4 pb-4 border-t border-gray-200 text-xs md:text-sm text-gray-600 space-y-2 pt-3">
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>
                    Open{" "}
                    <a
                      href="https://developers.facebook.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1c781f] font-medium hover:underline inline-flex items-center gap-1"
                    >
                      Meta for Developers <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Select your Meta App used for Instagram integration.</li>
                  <li>Go to <strong>Webhooks</strong> menu in the sidebar.</li>
                  <li>Select <strong>Instagram</strong> and click <strong>Add Callback URL</strong>.</li>
                  <li>Paste the <strong>Webhook Callback URL</strong> and <strong>Verify Token</strong>.</li>
                  <li>Click <strong>Verify and Save</strong>.</li>
                  <li>Subscribe to the required events (e.g. <code>messages</code>).</li>
                </ol>
              </div>
            )}
          </div>

          {/* Action Buttons (Matches green #1c781f theme) */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            )}

            {(isEditing || !isCreated) && (
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={isDemo || saveMutation.isPending}
                className="bg-[#1c781f] hover:bg-[#166018] text-white"
              >
                {saveMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isCreated ? "Save Changes" : "Create Configuration"}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}