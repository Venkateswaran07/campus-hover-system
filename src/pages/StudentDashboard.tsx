import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, BarChart3, FileText, LogOut as LogOutIcon, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import StudentProfile from "@/components/student/StudentProfile";
import RequestForm from "@/components/student/RequestForm";
import StatusTracker from "@/components/student/StatusTracker";
import NotificationBell from "@/components/student/NotificationBell";
import type { RequestType } from "@/lib/mock-data";

const tabs = [
  { id: "status" as const, label: "Status", icon: BarChart3 },
  { id: "od" as const, label: "OD", icon: FileText },
  { id: "leave" as const, label: "Leave", icon: Clock },
  { id: "outpass" as const, label: "Outpass", icon: LogOutIcon },
];

type TabId = "status" | "od" | "leave" | "outpass";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>("status");
  const navigate = useNavigate();
  const { signOut, user, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center gap-3">
        <button
          onClick={handleSignOut}
          className="shadow-raised-sm rounded-lg p-2 bg-background transition-shadow-neu hover:shadow-inset cursor-pointer"
          title="Sign Out"
        >
          <LogOutIcon className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <h1 className="text-xl font-outfit font-semibold text-foreground">Student Portal</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <StudentProfile />
        
        <div className="mt-6">
          {activeTab === "status" && <StatusTracker />}
          {(activeTab === "od" || activeTab === "leave" || activeTab === "outpass") && (
            <RequestForm type={activeTab} onSubmitted={() => setActiveTab("status")} />
          )}
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <nav className="shadow-raised rounded-2xl bg-background p-2 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-2.5 flex items-center gap-2 transition-shadow-neu cursor-pointer text-sm font-outfit font-medium ${
                activeTab === tab.id
                  ? "shadow-inset text-primary"
                  : "text-muted-foreground hover:shadow-inset"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default StudentDashboard;
