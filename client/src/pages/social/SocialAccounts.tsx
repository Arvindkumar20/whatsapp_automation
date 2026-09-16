// // import { useState } from "react";
// // import { Instagram, MessageCircle, Facebook, AtSign } from "lucide-react";
// // import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// // // Existing, unmodified Instagram logic — imported, never duplicated.
// // import { InstagramSettings } from "@/components/settings/InstagramSettings";
// // import { ComingSoonPlaceholder } from "@/components/social-accounts/comming-soon-placeholder";
// // // Existing app header — same one used on every other page.
// // import Header from "@/components/layout/header";

// // type SocialTab = "instagram" | "messenger" | "facebook" | "threads";

// // const TABS: { value: SocialTab; label: string; icon: typeof Instagram }[] = [
// //   { value: "instagram", label: "Instagram", icon: Instagram },
// //   { value: "messenger", label: "Messenger", icon: MessageCircle },
// //   { value: "facebook", label: "Facebook", icon: Facebook },
// //   { value: "threads", label: "Threads", icon: AtSign },
// // ];

// // export function SocialAccountsPage() {
// //   const [activeTab, setActiveTab] = useState<SocialTab>("instagram");

// //   return (
// //     <>
// //       <Header
// //         title="Accounts"
// //         subtitle="Connect and manage your social media accounts."
// //       />

// //       <div className="p-4 sm:p-6 space-y-4">
// //         <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SocialTab)}>
// //         <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-grid">
// //           {TABS.map(({ value, label, icon: Icon }) => (
// //             <TabsTrigger key={value} value={value} className="flex items-center gap-2">
// //               <Icon className="w-4 h-4" />
// //               <span className="hidden sm:inline">{label}</span>
// //             </TabsTrigger>
// //           ))}
// //         </TabsList>

// //         <TabsContent value="instagram" className="mt-4">
// //           <InstagramSettings />
// //         </TabsContent>

// //         <TabsContent value="messenger" className="mt-4">
// //           <ComingSoonPlaceholder
// //             icon={MessageCircle}
// //             platformName="Messenger"
// //             iconColorClass="text-blue-600"
// //             iconBgClass="bg-blue-50"
// //           />
// //         </TabsContent>

// //         <TabsContent value="facebook" className="mt-4">
// //           <ComingSoonPlaceholder
// //             icon={Facebook}
// //             platformName="Facebook"
// //             iconColorClass="text-indigo-600"
// //             iconBgClass="bg-indigo-50"
// //           />
// //         </TabsContent>

// //         <TabsContent value="threads" className="mt-4">
// //           <ComingSoonPlaceholder
// //             icon={AtSign}
// //             platformName="Threads"
// //             iconColorClass="text-gray-800"
// //             iconBgClass="bg-gray-100"
// //           />
// //         </TabsContent>
// //         </Tabs>
// //       </div>
// //     </>
// //   );
// // }





// import { useState } from "react";
// import { Instagram, MessageCircle, Facebook, AtSign } from "lucide-react";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// // Existing, unmodified Instagram logic — imported, never duplicated.
// import { InstagramSettings } from "@/components/settings/InstagramSettings";
// import { ComingSoonPlaceholder } from "@/components/social-accounts/comming-soon-placeholder";
// // Existing app header — same one used on every other page.
// import Header from "@/components/layout/header";

// type SocialTab = "instagram" | "messenger" | "facebook" | "threads";

// const TABS: {
//   value: SocialTab;
//   label: string;
//   icon: typeof Instagram;
//   comingSoon?: boolean;
// }[] = [
//   { value: "instagram", label: "Instagram", icon: Instagram },
//   { value: "messenger", label: "Messenger", icon: MessageCircle, comingSoon: true },
//   { value: "facebook", label: "Facebook", icon: Facebook, comingSoon: true },
//   { value: "threads", label: "Threads", icon: AtSign, comingSoon: true },
// ];

// export function SocialAccountsPage() {
//   const [activeTab, setActiveTab] = useState<SocialTab>("instagram");

//   return (
//     <>
//       <Header
//         title="Social Media Accounts"
//         subtitle="Connect and manage your social media channels in one place."
//       />

//       <div className="p-4 sm:p-6 space-y-4">
//         <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SocialTab)}>
//         <TabsList className="inline-flex h-auto bg-transparent p-0 gap-1 border-b border-gray-200 rounded-none w-full sm:w-auto">
//           {TABS.map(({ value, label, icon: Icon, comingSoon }) => (
//             <TabsTrigger
//               key={value}
//               value={value}
//               disabled={comingSoon}
//               className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-3 py-2.5 data-[state=active]:border-pink-600 data-[state=active]:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <Icon className="w-4 h-4" />
//               <span>{label}</span>
//               {comingSoon && (
//                 <span className="text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
//                   Soon
//                 </span>
//               )}
//             </TabsTrigger>
//           ))}
//         </TabsList>

//         <TabsContent value="instagram" className="mt-4">
//           <InstagramSettings />
//         </TabsContent>

//         <TabsContent value="messenger" className="mt-4">
//           <ComingSoonPlaceholder
//             icon={MessageCircle}
//             platformName="Messenger"
//             iconColorClass="text-blue-600"
//             iconBgClass="bg-blue-50"
//           />
//         </TabsContent>

//         <TabsContent value="facebook" className="mt-4">
//           <ComingSoonPlaceholder
//             icon={Facebook}
//             platformName="Facebook"
//             iconColorClass="text-indigo-600"
//             iconBgClass="bg-indigo-50"
//           />
//         </TabsContent>

//         <TabsContent value="threads" className="mt-4">
//           <ComingSoonPlaceholder
//             icon={AtSign}
//             platformName="Threads"
//             iconColorClass="text-gray-800"
//             iconBgClass="bg-gray-100"
//           />
//         </TabsContent>
//         </Tabs>
//       </div>
//     </>
//   );
// }




import { useState } from "react";
import { Instagram, MessageCircle, Facebook, AtSign } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { InstagramSettings } from "@/components/settings/InstagramSettings";
import { ComingSoonPlaceholder } from "@/components/social-accounts/comming-soon-placeholder";
import Header from "@/components/layout/header";
import { useChannelContext } from "@/contexts/channel-context";

type SocialTab = "instagram" | "facebook" | "threads" | "messenger";

const TABS: {
  value: SocialTab;
  label: string;
  icon: typeof Instagram;
  comingSoon?: boolean;
}[] = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook, comingSoon: true },
  { value: "threads", label: "Threads", icon: AtSign, comingSoon: true },
  { value: "messenger", label: "Messenger", icon: MessageCircle, comingSoon: true },
];

export function SocialAccountsPage() {
  const [activeTab, setActiveTab] = useState<SocialTab>("instagram");
  const { selectedChannel } = useChannelContext();
  const channelId = selectedChannel?.id ?? "";

  return (
    <>
      <Header
        title="Accounts"
        subtitle="Connect and manage your social media accounts."
      />

      <div className="p-4 sm:p-6 space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SocialTab)}>
          <TabsList className="inline-flex h-auto bg-gray-100/80 p-1.5 gap-2 rounded-xl border-none">
            {TABS.map(({ value, label, icon: Icon, comingSoon }) => (
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

          <TabsContent value="instagram" className="mt-4">
            <InstagramSettings channelId={channelId} />
          </TabsContent>

          <TabsContent value="facebook" className="mt-4">
            <ComingSoonPlaceholder
              icon={Facebook}
              platformName="Facebook"
              iconColorClass="text-indigo-600"
              iconBgClass="bg-indigo-50"
            />
          </TabsContent>

          <TabsContent value="threads" className="mt-4">
            <ComingSoonPlaceholder
              icon={AtSign}
              platformName="Threads"
              iconColorClass="text-gray-800"
              iconBgClass="bg-gray-100"
            />
          </TabsContent>

          <TabsContent value="messenger" className="mt-4">
            <ComingSoonPlaceholder
              icon={MessageCircle}
              platformName="Messenger"
              iconColorClass="text-blue-600"
              iconBgClass="bg-blue-50"
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}