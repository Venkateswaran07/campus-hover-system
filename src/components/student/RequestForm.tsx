import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RequestType } from "@/lib/mock-data";
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
  const { user, profile } = useAuth();
  const [reason, setReason] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [returnBy, setReturnBy] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("requests").insert({
        student_id: user.id,
        student_name: profile?.full_name || "Student",
        roll_number: profile?.roll_number || null,
        department: profile?.department || null,
        year: profile?.year || null,
        section: profile?.section || null,
        type,
        reason,
        event_name: type === "od" ? eventName : null,
        event_date: type === "od" ? eventDate : null,
        from_date: type === "leave" ? fromDate : null,
        to_date: type === "leave" ? toDate : null,
        exit_time: type === "outpass" ? exitTime : null,
        return_by: type === "outpass" ? returnBy : null,
      });

      if (error) throw error;
      toast.success("Request submitted successfully!");
      onSubmitted();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
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
              <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. HackSummit 2026"
                className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-outfit text-foreground placeholder:text-muted-foreground outline-none" required />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-outfit mb-1 block">Event Date</label>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-mono-data text-foreground outline-none" required />
            </div>
          </>
        )}

        {type === "leave" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground font-outfit mb-1 block">From</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-mono-data text-foreground outline-none" required />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-outfit mb-1 block">To</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-mono-data text-foreground outline-none" required />
            </div>
          </div>
        )}

        {type === "outpass" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground font-outfit mb-1 block">Exit Time</label>
              <input type="datetime-local" value={exitTime} onChange={(e) => setExitTime(e.target.value)}
                className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-mono-data text-foreground outline-none" required />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-outfit mb-1 block">Return By</label>
              <input type="datetime-local" value={returnBy} onChange={(e) => setReturnBy(e.target.value)}
                className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-mono-data text-foreground outline-none" required />
            </div>
          </div>
        )}

        <div>
          <label className="text-sm text-muted-foreground font-outfit mb-1 block">Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="Explain your request..." rows={3}
            className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-outfit text-foreground placeholder:text-muted-foreground outline-none resize-none" required />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          <Send className="w-4 h-4" />
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </div>
  );
};

export default RequestForm;
