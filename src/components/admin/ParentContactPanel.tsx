import { useAppState } from "@/lib/app-context";
import { Phone, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ParentContactPanel = () => {
  const { students, verifyParentContact } = useAppState();

  const unverified = students.filter((s) => !s.parentContact.verified);
  const verified = students.filter((s) => s.parentContact.verified);

  const handleVerify = (studentId: string) => {
    verifyParentContact(studentId, "Coordinator");
    toast.success("Parent contact verified successfully");
  };

  return (
    <div className="space-y-6">
      {/* Unverified */}
      {unverified.length > 0 && (
        <div>
          <h3 className="text-sm font-outfit font-semibold text-pending mb-3 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Pending Verification ({unverified.length})
          </h3>
          <div className="shadow-inset-deep rounded-2xl p-4 space-y-3">
            {unverified.map((s) => (
              <div key={s.id} className="rounded-xl bg-background p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-outfit font-medium text-foreground text-sm">{s.name}</p>
                    <span className="text-xs font-mono-data text-muted-foreground">{s.rollNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-mono-data text-foreground">{s.parentContact.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono-data text-muted-foreground shrink-0">
                  <span className="shadow-inset rounded-md px-2 py-1">{s.department}</span>
                  <span className="shadow-inset rounded-md px-2 py-1">Y{s.year}</span>
                </div>
                <Button variant="approve" size="sm" onClick={() => handleVerify(s.id)}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verify
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified */}
      {verified.length > 0 && (
        <div>
          <h3 className="text-sm font-outfit font-semibold text-approved mb-3 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Verified ({verified.length})
          </h3>
          <div className="shadow-inset-deep rounded-2xl p-4 space-y-3">
            {verified.map((s) => (
              <div key={s.id} className="rounded-xl bg-background p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-outfit font-medium text-foreground text-sm">{s.name}</p>
                    <span className="text-xs font-mono-data text-muted-foreground">{s.rollNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5 text-approved" />
                    <span className="text-sm font-mono-data text-foreground">{s.parentContact.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono-data text-muted-foreground shrink-0">
                  <span className="shadow-inset rounded-md px-2 py-1">{s.department}</span>
                  <span className="shadow-inset rounded-md px-2 py-1">Y{s.year}</span>
                </div>
                <span className="text-xs font-outfit text-approved flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  by {s.parentContact.verifiedBy} · {s.parentContact.verifiedAt}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentContactPanel;
