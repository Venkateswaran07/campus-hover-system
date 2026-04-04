import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Phone, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ParentContactPanel = () => {
  const { profile } = useAuth();
  const [students, setStudents] = useState<any[]>([]);

  const fetchStudents = async () => {
    const { data } = await supabase.from("profiles").select("*").not("roll_number", "is", null);
    setStudents(data || []);
  };

  useEffect(() => { fetchStudents(); }, []);

  const unverified = students.filter((s) => !s.parent_phone_verified && s.parent_phone);
  const verified = students.filter((s) => s.parent_phone_verified);

  const handleVerify = async (studentUserId: string) => {
    const { error } = await supabase.from("profiles").update({
      parent_phone_verified: true,
      parent_phone_verified_by: profile?.full_name || "Coordinator",
      parent_phone_verified_at: new Date().toISOString(),
    }).eq("user_id", studentUserId);

    if (error) {
      toast.error("Failed to verify contact");
      return;
    }
    toast.success("Parent contact verified successfully");
    fetchStudents();
  };

  return (
    <div className="space-y-6">
      {unverified.length > 0 && (
        <div>
          <h3 className="text-sm font-outfit font-semibold text-pending mb-3 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Pending Verification ({unverified.length})
          </h3>
          <div className="shadow-inset-deep rounded-2xl p-4 space-y-3">
            {unverified.map((s) => (
              <div key={s.id} className="rounded-xl bg-background p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-outfit font-medium text-foreground text-sm">{s.full_name}</p>
                    <span className="text-xs font-mono-data text-muted-foreground">{s.roll_number}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-mono-data text-foreground">{s.parent_phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono-data text-muted-foreground shrink-0">
                  <span className="shadow-inset rounded-md px-2 py-1">{s.department}</span>
                  <span className="shadow-inset rounded-md px-2 py-1">Y{s.year}</span>
                </div>
                <Button variant="approve" size="sm" onClick={() => handleVerify(s.user_id)}>
                  <ShieldCheck className="w-3.5 h-3.5" /> Verify
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {verified.length > 0 && (
        <div>
          <h3 className="text-sm font-outfit font-semibold text-approved mb-3 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Verified ({verified.length})
          </h3>
          <div className="shadow-inset-deep rounded-2xl p-4 space-y-3">
            {verified.map((s) => (
              <div key={s.id} className="rounded-xl bg-background p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-outfit font-medium text-foreground text-sm">{s.full_name}</p>
                    <span className="text-xs font-mono-data text-muted-foreground">{s.roll_number}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5 text-approved" />
                    <span className="text-sm font-mono-data text-foreground">{s.parent_phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono-data text-muted-foreground shrink-0">
                  <span className="shadow-inset rounded-md px-2 py-1">{s.department}</span>
                  <span className="shadow-inset rounded-md px-2 py-1">Y{s.year}</span>
                </div>
                <span className="text-xs font-outfit text-approved flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  by {s.parent_phone_verified_by}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {unverified.length === 0 && verified.length === 0 && (
        <div className="shadow-raised rounded-2xl bg-background p-8 text-center">
          <p className="text-muted-foreground font-outfit">No students with parent contacts found.</p>
        </div>
      )}
    </div>
  );
};

export default ParentContactPanel;
