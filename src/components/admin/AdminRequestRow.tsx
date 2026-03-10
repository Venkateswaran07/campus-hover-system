import { Request } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, FileText, CalendarDays, LogOut } from "lucide-react";
import { toast } from "sonner";

const typeLabels = { od: "OD", leave: "Leave", outpass: "Outpass" };
const typeIcons = { od: FileText, leave: CalendarDays, outpass: LogOut };

interface Props {
  request: Request;
}

const AdminRequestRow = ({ request }: Props) => {
  const { updateStatus } = useAppState();
  const Icon = typeIcons[request.type];
  const isPending = request.status === "pending";

  const handleApprove = () => {
    updateStatus(request.id, "approved");
    toast.success(`Approved ${request.studentName}'s ${typeLabels[request.type]} request`);
  };

  const handleReject = () => {
    updateStatus(request.id, "rejected");
    toast.error(`Rejected ${request.studentName}'s ${typeLabels[request.type]} request`);
  };

  return (
    <div className="rounded-xl bg-background p-4 flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Icon className="w-4 h-4 text-primary shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-outfit font-medium text-foreground text-sm truncate">{request.studentName}</p>
            <span className="text-xs font-mono-data text-muted-foreground">{request.rollNumber}</span>
          </div>
          <p className="text-xs text-muted-foreground font-outfit truncate">{request.reason}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-mono-data text-muted-foreground shrink-0">
        <span className="shadow-inset rounded-md px-2 py-1">{request.department}</span>
        <span className="shadow-inset rounded-md px-2 py-1">Y{request.year}</span>
        <span className="shadow-inset rounded-md px-2 py-1 uppercase">{typeLabels[request.type]}</span>
        <span className="shadow-inset rounded-md px-2 py-1">{request.createdAt}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isPending ? (
          <>
            <Button variant="approve" size="sm" onClick={handleApprove}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve
            </Button>
            <Button variant="reject" size="sm" onClick={handleReject}>
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </Button>
          </>
        ) : (
          <span
            className={`flex items-center gap-1 text-xs font-outfit font-medium ${
              request.status === "approved" ? "text-approved" : "text-destructive"
            }`}
          >
            {request.status === "approved" ? (
              <><CheckCircle2 className="w-3.5 h-3.5" /> Approved</>
            ) : (
              <><XCircle className="w-3.5 h-3.5" /> Rejected</>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default AdminRequestRow;
