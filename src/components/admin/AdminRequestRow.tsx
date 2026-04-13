import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, FileText, CalendarDays, LogOut } from "lucide-react";
import { toast } from "sonner";

const typeLabels: Record<string, string> = { od: "OD", leave: "Leave", outpass: "Outpass" };
const typeIcons: Record<string, any> = { od: FileText, leave: CalendarDays, outpass: LogOut };

interface Props {
  request: any;
  onStatusChange?: () => void;
}

const AdminRequestRow = ({ request, onStatusChange }: Props) => {
  const Icon = typeIcons[request.type] || FileText;
  const isPending = request.status === "pending";

  const handleUpdateStatus = async (status: string) => {
    const { error } = await supabase
      .from("requests")
      .update({ status })
      .eq("id", request.id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    if (status === "approved") {
      toast.success(`Approved ${request.student_name}'s ${typeLabels[request.type]} request`);
    } else {
      toast.error(`Rejected ${request.student_name}'s ${typeLabels[request.type]} request`);
    }

    // Send notification
    try {
      await supabase.functions.invoke("send-notification", {
        body: {
          request_id: request.id,
          status,
          student_name: request.student_name,
          request_type: request.type,
        },
      });
    } catch (e) {
      console.log("Notification send attempted");
    }

    onStatusChange?.();
  };

  const createdDate = request.created_at ? new Date(request.created_at).toLocaleDateString() : "";

  return (
    <div className="rounded-xl bg-background p-4 flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Icon className="w-4 h-4 text-primary shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-outfit font-medium text-foreground text-sm truncate">{request.student_name}</p>
            <span className="text-xs font-mono-data text-muted-foreground">{request.roll_number}</span>
          </div>
          <p className="text-xs text-muted-foreground font-outfit truncate">{request.reason}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-mono-data text-muted-foreground shrink-0">
        <span className="shadow-inset rounded-md px-2 py-1">{request.department}{request.section ? `-${request.section}` : ""}</span>
        <span className="shadow-inset rounded-md px-2 py-1">Y{request.year}</span>
        <span className="shadow-inset rounded-md px-2 py-1 uppercase">{typeLabels[request.type]}</span>
        <span className="shadow-inset rounded-md px-2 py-1">{createdDate}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isPending ? (
          <>
            <Button variant="approve" size="sm" onClick={() => handleUpdateStatus("approved")}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
            </Button>
            <Button variant="reject" size="sm" onClick={() => handleUpdateStatus("rejected")}>
              <XCircle className="w-3.5 h-3.5" /> Reject
            </Button>
          </>
        ) : (
          <span className={`flex items-center gap-1 text-xs font-outfit font-medium ${request.status === "approved" ? "text-approved" : "text-destructive"}`}>
            {request.status === "approved" ? <><CheckCircle2 className="w-3.5 h-3.5" /> Approved</> : <><XCircle className="w-3.5 h-3.5" /> Rejected</>}
          </span>
        )}
      </div>
    </div>
  );
};

export default AdminRequestRow;
