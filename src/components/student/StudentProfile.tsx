import { useAppState } from "@/lib/app-context";
import { User, Phone, CheckCircle2, AlertCircle } from "lucide-react";

const StudentProfile = () => {
  const { student } = useAppState();

  return (
    <div className="shadow-raised rounded-2xl bg-background p-5 animate-float-up">
      <div className="flex items-center gap-4">
        <div className="shadow-inset rounded-xl p-3">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="font-outfit font-semibold text-lg text-foreground">{student.name}</h2>
          <p className="text-sm text-muted-foreground font-mono-data">
            {student.rollNumber} · {student.department} · Year {student.year}
          </p>
        </div>
        <div className="shadow-inset rounded-xl p-3 text-center min-w-[72px]">
          <p className="font-mono-data text-lg font-semibold text-primary">{student.attendance}%</p>
          <p className="text-xs text-muted-foreground font-outfit">Attendance</p>
        </div>
      </div>

      {/* Parent contact */}
      <div className="mt-3 flex items-center gap-2 text-sm">
        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="font-mono-data text-foreground">{student.parentContact.phone}</span>
        {student.parentContact.verified ? (
          <span className="flex items-center gap-1 text-xs text-approved font-outfit">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-pending font-outfit">
            <AlertCircle className="w-3 h-3" /> Pending verification
          </span>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
