import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, FileText, CalendarDays, LogOut, Clock, LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { DbRequest } from "@/lib/types";

const typeLabels: Record<string, string> = { od: "OD", leave: "Leave", outpass: "Outpass" };
const typeIcons: Record<string, LucideIcon> = { od: FileText, leave: CalendarDays, outpass: LogOut };

interface Props {
  request: DbRequest;
  onStatusChange?: () => void;
  role?: "coordinator" | "hod";
}

const AdminRequestRow = ({ request, onStatusChange, role = "coordinator" }: Props) => {
  const Icon = typeIcons[request.type] || FileText;
  
  const isPending = role === "hod" 
    ? request.status === "coordinator_approved" 
    : request.status === "pending";

  const handleUpdateStatus = async (newStatus: string) => {
    // If coordinator approves, it moves to coordinator_approved stage
    const finalStatus = (newStatus === "approved" && role === "coordinator") 
      ? "coordinator_approved" 
      : newStatus;

    const { error } = await supabase
      .from("requests")
      .update({ status: finalStatus })
      .eq("id", request.id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    if (finalStatus === "approved") {
      toast.success(`Approved ${request.student_name}'s ${typeLabels[request.type]} request`);
    } else if (finalStatus === "coordinator_approved") {
      toast.success(`Coordinator review completed for ${request.student_name}`);
    } else {
      toast.error(`Rejected ${request.student_name}'s ${typeLabels[request.type]} request`);
    }

    // Send notification
    try {
      await supabase.functions.invoke("send-notification", {
        body: {
          request_id: request.id,
          status: finalStatus,
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

  const renderStatus = () => {
    if (isPending) {
      return (
        <>
          <Button variant="approve" size="sm" onClick={() => handleUpdateStatus("approved")}>
            <CheckCircle2 className="w-3.5 h-3.5" /> {role === "coordinator" ? "Review" : "Approve"}
          </Button>
          <Button variant="reject" size="sm" onClick={() => handleUpdateStatus("rejected")}>
            <XCircle className="w-3.5 h-3.5" /> Reject
          </Button>
        </>
      );
    }

    const statusProps = {
      approved: { color: "text-approved", text: "Approved", icon: CheckCircle2 },
      coordinator_approved: { color: "text-pending", text: "Coordinator Approved", icon: CheckCircle2 },
      rejected: { color: "text-destructive", text: "Rejected", icon: XCircle },
      pending: { color: "text-pending", text: "Pending Review", icon: Clock },
    }[request.status as string] || { color: "text-muted-foreground", text: request.status, icon: Clock };

    const StatusIcon = statusProps.icon;

    return (
      <span className={`flex items-center gap-1 text-xs font-outfit font-medium ${statusProps.color}`}>
        <StatusIcon className="w-3.5 h-3.5" /> {statusProps.text}
      </span>
    );
  };

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
        {renderStatus()}
      </div>
    </div>
  );
};

export default AdminRequestRow;
