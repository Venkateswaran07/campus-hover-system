import { CheckCircle2, Clock, XCircle, CalendarDays, FileText, LogOut } from "lucide-react";
import QRCodeDisplay from "./QRCodeDisplay";

const typeIcons = {
  od: FileText,
  leave: CalendarDays,
  outpass: LogOut,
};

const typeLabels = {
  od: "On-Duty",
  leave: "Leave",
  outpass: "Outpass",
};

interface Props {
  request: any;
}

const StatusCard = ({ request }: Props) => {
  const Icon = typeIcons[request.type as keyof typeof typeIcons] || FileText;
  const isApproved = request.status === "approved";

  return (
    <div
      className={`rounded-2xl bg-background p-5 transition-shadow-neu ${
        isApproved ? "shadow-inset" : "shadow-raised"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="shadow-raised-sm rounded-lg p-2 bg-background">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-outfit font-medium text-foreground">{typeLabels[request.type]}</p>
            <p className="text-xs text-muted-foreground font-mono-data">
              {request.created_at ? new Date(request.created_at).toLocaleDateString() : ""}
            </p>
          </div>
        </div>

        <StatusBadge status={request.status} />
      </div>

      <p className="mt-3 text-sm text-muted-foreground font-outfit">{request.reason}</p>

      {request.type === "od" && request.event_name && (
        <p className="mt-1 text-xs text-muted-foreground font-mono-data">
          {request.event_name} · {request.event_date}
        </p>
      )}
      {request.type === "leave" && (
        <p className="mt-1 text-xs text-muted-foreground font-mono-data">
          {request.from_date} → {request.to_date}
        </p>
      )}
      {request.type === "outpass" && request.return_by && (
        <ReturnTimer returnBy={request.return_by} />
      )}

      {isApproved && <QRCodeDisplay requestId={request.id} />}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "approved") {
    return (
      <span className="flex items-center gap-1 text-xs font-outfit font-medium text-approved">
        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="flex items-center gap-1 text-xs font-outfit font-medium text-pending">
        <Clock className="w-3.5 h-3.5" /> Pending
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-outfit font-medium text-destructive">
      <XCircle className="w-3.5 h-3.5" /> Rejected
    </span>
  );
};

const ReturnTimer = ({ returnBy }: { returnBy: string }) => {
  const returnDate = new Date(returnBy);
  const now = new Date();
  const diffMs = returnDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return (
      <p className="mt-1 text-xs font-mono-data text-destructive">Return time elapsed</p>
    );
  }

  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);

  return (
    <p className="mt-1 text-xs font-mono-data text-primary">
      Return in {hours}h {minutes}m
    </p>
  );
};

export default StatusCard;
