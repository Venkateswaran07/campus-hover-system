import { useState } from "react";
import { useAppState } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { RequestType, mockStudent } from "@/lib/mock-data";
import { Send, CalendarDays, Clock, FileText } from "lucide-react";
import { toast } from "sonner";

interface Props {
  type: RequestType;
  onSubmitted: () => void;
}

const titles: Record<RequestType, string> = {
  od: "On-Duty Request",
  leave: "Leave Application",
  outpass: "Outpass Request",
};

const RequestForm = ({ type, onSubmitted }: Props) => {
  const { addRequest } = useAppState();
  const [reason, setReason] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [returnBy, setReturnBy] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    addRequest({
      studentId: mockStudent.id,
      studentName: mockStudent.name,
      rollNumber: mockStudent.rollNumber,
      department: mockStudent.department,
      year: mockStudent.year,
      type,
      reason,
      ...(type === "od" && { eventName, eventDate }),
      ...(type === "leave" && { fromDate, toDate }),
      ...(type === "outpass" && { exitTime, returnBy }),
    });

    toast.success("Request submitted successfully!");
    onSubmitted();
  };

  return (
    <div className="shadow-raised rounded-2xl bg-background p-5 animate-float-up">
      <h3 className="font-outfit font-semibold text-lg text-foreground mb-5 flex items-center gap-2">
        {type === "od" && <FileText className="w-5 h-5 text-primary" />}
        {type === "leave" && <CalendarDays className="w-5 h-5 text-primary" />}
        {type === "outpass" && <Clock className="w-5 h-5 text-primary" />}
        {titles[type]}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === "od" && (
          <>
            <div>
              <label className="text-sm text-muted-foreground font-outfit mb-1 block">Event Name</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. HackSummit 2026"
                className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-outfit text-foreground placeholder:text-muted-foreground outline-none"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-outfit mb-1 block">Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-mono-data text-foreground outline-none"
                required
              />
            </div>
          </>
        )}

        {type === "leave" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground font-outfit mb-1 block">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-mono-data text-foreground outline-none"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-outfit mb-1 block">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-mono-data text-foreground outline-none"
                required
              />
            </div>
          </div>
        )}

        {type === "outpass" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground font-outfit mb-1 block">Exit Time</label>
              <input
                type="datetime-local"
                value={exitTime}
                onChange={(e) => setExitTime(e.target.value)}
                className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-mono-data text-foreground outline-none"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-outfit mb-1 block">Return By</label>
              <input
                type="datetime-local"
                value={returnBy}
                onChange={(e) => setReturnBy(e.target.value)}
                className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-mono-data text-foreground outline-none"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-sm text-muted-foreground font-outfit mb-1 block">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain your request..."
            rows={3}
            className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-outfit text-foreground placeholder:text-muted-foreground outline-none resize-none"
            required
          />
        </div>

        <Button type="submit" size="lg" className="w-full">
          <Send className="w-4 h-4" />
          Submit Request
        </Button>
      </form>
    </div>
  );
};

export default RequestForm;
