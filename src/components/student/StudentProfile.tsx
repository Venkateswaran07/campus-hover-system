import { useAppState } from "@/lib/app-context";
import { User, Percent } from "lucide-react";

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
    </div>
  );
};

export default StudentProfile;
