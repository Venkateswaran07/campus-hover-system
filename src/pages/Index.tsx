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
    <div className="flex min-h-screen items-center justify-center p-4 relative">
      <VideoBackground />
      <div className="w-full max-w-lg animate-float-up">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-outfit font-bold text-white tracking-tight mb-2 drop-shadow-lg">
            Leave & Movement Registry
          </h1>
          <p className="text-white/70 font-outfit drop-shadow">
            L&M · OD · Leave · Outpass System
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {roles.map((role) => (
            <button
              key={role.path}
              onClick={() => navigate(role.path)}
              className="rounded-2xl p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg hover:bg-white/20 active:bg-white/25 transition-all duration-200 flex items-center gap-5 cursor-pointer group"
            >
              <div className="rounded-xl p-3 backdrop-blur-md bg-white/15 border border-white/25">
                <role.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <p className="font-outfit font-semibold text-lg text-white">{role.title}</p>
                <p className="text-sm text-white/70">{role.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
