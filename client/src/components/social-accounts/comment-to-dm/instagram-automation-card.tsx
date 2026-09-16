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
  MessageCircle,
  Reply,
  Send,
  Clock,
  Repeat1,
  MoreVertical,
  Pencil,
  Pause,
  Play,
  ScrollText,
  Trash2,
} from "lucide-react";
import type { InstagramAutomationApi } from "@/lib/api/instagram-automation-api";

interface InstagramAutomationCardProps {
  automation: InstagramAutomationApi;
  accountUsername?: string;
  onEdit: (automation: InstagramAutomationApi) => void;
  onToggleStatus: (automation: InstagramAutomationApi) => void;
  onViewLogs: (automation: InstagramAutomationApi) => void;
  onDelete: (automation: InstagramAutomationApi) => void;
}

const MATCH_TYPE_LABEL: Record<string, string> = {
  contains: "Contains",
  equals: "Equals",
  starts_with: "Starts with",
};

export function InstagramAutomationCard({
  automation,
  accountUsername,
  onEdit,
  onToggleStatus,
  onViewLogs,
  onDelete,
}: InstagramAutomationCardProps) {
  const isActive = automation.status === "active";

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm sm:text-base truncate">{automation.name}</h3>
            <Badge
              variant="secondary"
              className={
                isActive
                  ? "text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "text-xs bg-gray-100 text-gray-500 border-gray-200"
              }
            >
              {isActive ? "Active" : "Paused"}
            </Badge>
            {accountUsername && (
              <span className="text-xs text-gray-400">@{accountUsername}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
            <MessageCircle className="w-3.5 h-3.5" />
            New Comment
            <span className="text-gray-300">•</span>
            {MATCH_TYPE_LABEL[automation.matchType] ?? automation.matchType}
            {automation.caseInsensitive ? " (case-insensitive)" : " (case-sensitive)"}
          </div>

          {automation.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {automation.keywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="text-xs bg-pink-50 text-pink-700 border-pink-200">
                  {kw}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-600">
            {automation.replyComment && (
              <span className="flex items-center gap-1">
                <Reply className="w-3.5 h-3.5 text-gray-400" /> Reply to comment
              </span>
            )}
            {automation.sendDm && (
              <span className="flex items-center gap-1">
                <Send className="w-3.5 h-3.5 text-gray-400" /> Send DM
              </span>
            )}
            {automation.delaySeconds > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" /> {automation.delaySeconds}s delay
              </span>
            )}
            {automation.runOnce && (
              <span className="flex items-center gap-1">
                <Repeat1 className="w-3.5 h-3.5 text-gray-400" /> Once per user
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="px-2 flex-shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(automation)}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus(automation)}>
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 mr-2" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" /> Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewLogs(automation)}>
              <ScrollText className="w-4 h-4 mr-2" /> View Logs
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(automation)}
              className="text-red-600 focus:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
