// import { LucideIcon } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

// interface ComingSoonPlaceholderProps {
//   icon: LucideIcon;
//   platformName: string;
//   description?: string;
//   iconColorClass?: string; // e.g. "text-blue-600"
//   iconBgClass?: string; // e.g. "bg-blue-50"
// }

// /**
//  * Generic "Coming Soon" placeholder used for any social platform tab
//  * that isn't wired up to a real integration yet (Messenger, Facebook, Threads...).
//  * Swap this out for the real settings component once the integration ships —
//  * no changes needed anywhere else.
//  */
// export function ComingSoonPlaceholder({
//   icon: Icon,
//   platformName,
//   description,
//   iconColorClass = "text-gray-500",
//   iconBgClass = "bg-gray-100",
// }: ComingSoonPlaceholderProps) {
//   return (
//     <Card>
//       <CardContent className="py-16">
//         <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
//           <div
//             className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconBgClass}`}
//           >
//             <Icon className={`w-8 h-8 ${iconColorClass}`} />
//           </div>
//           <div className="flex items-center gap-2 mb-2">
//             <h3 className="text-lg font-semibold">{platformName}</h3>
//             <Badge variant="secondary" className="text-xs">
//               Coming Soon
//             </Badge>
//           </div>
//           <p className="text-sm text-muted-foreground">
//             {description ??
//               `${platformName} integration is on the way. You'll be able to connect and manage ${platformName} accounts right here.`}
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }






// import { LucideIcon, Sparkles } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

// interface ComingSoonPlaceholderProps {
//   icon: LucideIcon;
//   platformName: string;
//   description?: string;
//   iconColorClass?: string; // e.g. "text-blue-600"
//   iconBgClass?: string; // e.g. "bg-blue-50 border-blue-100"
//   badgeGradientClass?: string;
// }

// export function ComingSoonPlaceholder({
//   icon: Icon,
//   platformName,
//   description,
//   iconColorClass = "text-indigo-600",
//   iconBgClass = "bg-indigo-50 border-indigo-100",
//   badgeGradientClass = "from-indigo-500/10 to-purple-500/10 text-indigo-700 border-indigo-200/60",
// }: ComingSoonPlaceholderProps) {
//   return (
//     <Card className="relative overflow-hidden border-2 border-dashed border-gray-200/80 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30 shadow-xs">
//       {/* Background Decorative Glow */}
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-indigo-100/40 via-purple-100/30 to-pink-100/30 rounded-full blur-3xl pointer-events-none" />

//       <CardContent className="py-16 px-6 relative z-10">
//         <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto">
//           {/* Platform Icon Avatar */}
//           <div className="relative mb-5">
//             <div
//               className={`w-20 h-20 rounded-2xl border flex items-center justify-center shadow-xs transition-transform duration-300 hover:scale-105 ${iconBgClass}`}
//             >
//               <Icon className={`w-10 h-10 ${iconColorClass}`} />
//             </div>
//             {/* Floating Sparkle Badge */}
//             <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-md border-2 border-white">
//               <Sparkles className="w-3 h-3 fill-current" />
//             </div>
//           </div>

//           {/* Title & Badge */}
//           <div className="flex items-center justify-center gap-2 mb-2.5 flex-wrap">
//             <h3 className="text-xl font-bold text-gray-900 tracking-tight">
//               {platformName}
//             </h3>
//             <Badge
//               variant="outline"
//               className={`text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gradient-to-r ${badgeGradientClass}`}
//             >
//               Coming Soon
//             </Badge>
//           </div>

//           {/* Description */}
//           <p className="text-sm text-gray-500 leading-relaxed">
//             {description ??
//               `${platformName} integration is currently in development. You'll be able to connect and manage your ${platformName} accounts right here soon.`}
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }





import { LucideIcon, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ComingSoonPlaceholderProps {
  icon: LucideIcon;
  platformName: string;
  description?: string;
  iconColorClass?: string; // e.g. "text-blue-600"
  iconBgClass?: string; // e.g. "bg-blue-50 border-blue-100"
  badgeGradientClass?: string;
  showBadgeIcon?: boolean; // Toggle option for the corner badge icon
  onNotifyMe?: () => void; // Optional CTA — omit to hide the button
}

export function ComingSoonPlaceholder({
  icon: Icon,
  platformName,
  description,
  iconColorClass = "text-indigo-600",
  iconBgClass = "bg-indigo-50 border-indigo-100",
  badgeGradientClass = "from-indigo-500/10 to-purple-500/10 text-indigo-700 border-indigo-200/60",
  showBadgeIcon = false,
  onNotifyMe,
}: ComingSoonPlaceholderProps) {
  return (
    <Card className="group relative overflow-hidden border-2 border-dashed border-gray-200/80 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30 shadow-xs transition-colors duration-300 hover:border-gray-300/80 dark:border-gray-800 dark:from-gray-900/40 dark:via-gray-950 dark:to-gray-900/20 dark:hover:border-gray-700">
      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          color: "rgb(99 102 241)",
        }}
      />

      {/* Background Decorative Glow — now gently animated */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-indigo-100/40 via-purple-100/30 to-pink-100/30 rounded-full blur-3xl pointer-events-none animate-pulse [animation-duration:4s] dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />

      <CardContent className="py-16 px-6 relative z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto">
          {/* Platform Icon Avatar */}
          <div className="relative mb-5">
            {/* Soft ring pulse behind icon */}
            <div
              className={`absolute inset-0 rounded-2xl ${iconBgClass} opacity-60 blur-md scale-110 transition-opacity duration-300 group-hover:opacity-90`}
            />
            <div
              className={`relative w-20 h-20 rounded-2xl border flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md ${iconBgClass}`}
            >
              <Icon className={`w-10 h-10 ${iconColorClass}`} />
            </div>

            {/* Optional Floating Badge (disabled by default) */}
            {showBadgeIcon && (
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-md border-2 border-white animate-bounce [animation-duration:2s]">
                <span className="text-xs font-bold">⚡</span>
              </div>
            )}
          </div>

          {/* Title & Badge */}
          <div className="flex items-center justify-center gap-2 mb-2.5 flex-wrap">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight dark:text-gray-100">
              {platformName}
            </h3>
            <Badge
              variant="outline"
              className={`relative overflow-hidden text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gradient-to-r ${badgeGradientClass}`}
            >
              <span className="relative z-10">Coming Soon</span>
              {/* Shimmer sweep */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent group-hover:animate-[shimmer_1.2s_ease-in-out]" />
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed dark:text-gray-400">
            {description ??
              `${platformName} feature is currently in development and will be available soon.`}
          </p>

          {/* Optional CTA */}
          {onNotifyMe && (
            <Button
              onClick={onNotifyMe}
              variant="outline"
              size="sm"
              className="mt-5 gap-1.5 text-xs font-medium rounded-full border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 transition-colors dark:border-gray-700 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30"
            >
              <Bell className="w-3.5 h-3.5" />
              Notify me when it's ready
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}