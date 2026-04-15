import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield, BarChart3 } from "lucide-react";
import VideoBackground from "@/components/VideoBackground";

const roles = [
  {
    path: "/student",
    icon: GraduationCap,
    title: "Student Portal",
    desc: "Apply for OD, Leave & Outpass",
  },
  {
    path: "/admin",
    icon: Shield,
    title: "Coordinator Console",
    desc: "Review requests & verify contacts",
  },
  {
    path: "/hod",
    icon: BarChart3,
    title: "HOD Dashboard",
    desc: "Reports, statistics & oversight",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background/0 p-4 relative">
      <VideoBackground />
      <div className="w-full max-w-lg animate-float-up">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-outfit font-bold text-foreground tracking-tight mb-2">
            Leave & Movement Registry
          </h1>
          <p className="text-muted-foreground font-outfit">
            L&M · OD · Leave · Outpass System
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {roles.map((role) => (
            <button
              key={role.path}
              onClick={() => navigate(role.path)}
              className="shadow-raised rounded-2xl p-8 bg-background transition-shadow-neu hover:shadow-inset active:shadow-inset-deep flex items-center gap-5 cursor-pointer group"
            >
              <div className="shadow-raised-sm rounded-xl p-3 bg-background transition-shadow-neu group-hover:shadow-inset">
                <role.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-outfit font-semibold text-lg text-foreground">{role.title}</p>
                <p className="text-sm text-muted-foreground">{role.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
