import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";
import {
  getInstagramAutomationLogs,
  type ExecutionStatus,
} from "@/lib/api/instagram-automation-api";

interface AutomationLogsDialogProps {
  automationId: string | null;
  automationName?: string;
  onOpenChange: (open: boolean) => void;
}

const STATUS_META: Record<ExecutionStatus, { label: string; className: string; icon: typeof CheckCircle }> = {
  success: { label: "Executed", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  failed: { label: "Failed", className: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  matched: { label: "Matched", className: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle },
  skipped_no_match: { label: "No match", className: "bg-gray-100 text-gray-500 border-gray-200", icon: MinusCircle },
  skipped_run_once: { label: "Already ran for user", className: "bg-amber-50 text-amber-700 border-amber-200", icon: MinusCircle },
  skipped_duplicate: { label: "Duplicate event", className: "bg-gray-100 text-gray-500 border-gray-200", icon: MinusCircle },
};

export function AutomationLogsDialog({
  automationId,
  automationName,
  onOpenChange,
}: AutomationLogsDialogProps) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["/api/instagram/automation-logs", automationId],
    queryFn: () => getInstagramAutomationLogs(automationId as string),
    enabled: !!automationId,
  });

  return (
    <Dialog open={!!automationId} onOpenChange={() => onOpenChange(false)}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Execution Logs</DialogTitle>
          <DialogDescription>
            {automationName ? `Recent activity for "${automationName}"` : "Recent activity"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Loading />
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">No executions yet.</p>
        ) : (
          <div className="space-y-2 mt-2">
            {logs.map((log) => {
              const meta = STATUS_META[log.executionStatus] ?? STATUS_META.matched;
              const Icon = meta.icon;
              return (
                <div key={log.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      @{log.username || log.instagramUserId}
                    </span>
                    <Badge variant="secondary" className={`text-xs flex items-center gap-1 ${meta.className}`}>
                      <Icon className="w-3 h-3" /> {meta.label}
                    </Badge>
                  </div>
                  {log.commentText && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">"{log.commentText}"</p>
                  )}
                  {log.error && <p className="text-xs text-red-600 mt-1">{log.error}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
