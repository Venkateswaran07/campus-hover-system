import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import StatusCard from "./StatusCard";

const StatusTracker = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      const { data } = await supabase
        .from("requests")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
      setRequests(data || []);
      setLoading(false);
    };
    fetchRequests();

    // Realtime subscription
    const channel = supabase
      .channel("student-requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "requests", filter: `student_id=eq.${user.id}` }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (loading) {
    return (
      <div className="shadow-raised rounded-2xl bg-background p-8 text-center animate-float-up">
        <p className="text-muted-foreground font-outfit animate-pulse">Loading requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="shadow-raised rounded-2xl bg-background p-8 text-center animate-float-up">
        <p className="text-muted-foreground font-outfit">No requests yet. Submit one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req, i) => (
        <div key={req.id} className="animate-float-up" style={{ animationDelay: `${i * 80}ms` }}>
          <StatusCard request={req} />
        </div>
      ))}
    </div>
  );
};

export default StatusTracker;
