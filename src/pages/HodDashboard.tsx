import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Users, TrendingUp, FileText, CalendarDays, LogOut, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DEPARTMENTS } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import AdminRequestRow from "@/components/admin/AdminRequestRow";
import { DbRequest, DbProfile } from "@/lib/types";

const STATUS_COLORS = { approved: "#10B981", coordinator_approved: "#3B82F6", pending: "#F59E0B", rejected: "#EF4444" };
const TYPE_COLORS = { od: "#2563EB", leave: "#8B5CF6", outpass: "#EC4899" };

const HodDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [requests, setRequests] = useState<DbRequest[]>([]);
  const [students, setStudents] = useState<DbProfile[]>([]);

  const fetchData = async () => {
    const [reqRes, stuRes] = await Promise.all([
      supabase.from("requests").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").not("roll_number", "is", null),
    ]);
    setRequests(reqRes.data || []);
    setStudents(stuRes.data || []);
  };

  useEffect(() => {
    fetchData();

    // Realtime: refresh when requests or profiles change
    const ch1 = supabase
      .channel("hod-requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, () => fetchData())
      .subscribe();
    const ch2 = supabase
      .channel("hod-profiles")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
    };
  }, []);

  const totalRequests = requests.length;
  const totalStudents = students.length;
  const avgAttendance = students.length > 0 ? Math.round(students.reduce((s, st) => s + (st.attendance || 0), 0) / students.length) : 0;
  
  // HOD actionable requests are those approved by coordinator
  const actionableRequests = requests.filter((r) => r.status === "coordinator_approved");
  const pendingAtCoordinator = requests.filter((r) => r.status === "pending").length;

  const deptData = useMemo(() => {
    return DEPARTMENTS.map((dept) => {
      const deptReqs = requests.filter((r) => r.department === dept);
      return { 
        name: dept, 
        total: deptReqs.length, 
        pending: deptReqs.filter((r) => r.status === "pending").length, 
        coordinator: deptReqs.filter((r) => r.status === "coordinator_approved").length,
        approved: deptReqs.filter((r) => r.status === "approved").length, 
        rejected: deptReqs.filter((r) => r.status === "rejected").length 
      };
    }).filter((d) => d.total > 0);
  }, [requests]);

  const typeData = useMemo(() => [
    { name: "OD", value: requests.filter((r) => r.type === "od").length, color: TYPE_COLORS.od },
    { name: "Leave", value: requests.filter((r) => r.type === "leave").length, color: TYPE_COLORS.leave },
    { name: "Outpass", value: requests.filter((r) => r.type === "outpass").length, color: TYPE_COLORS.outpass },
  ].filter((d) => d.value > 0), [requests]);

  const statusData = useMemo(() => [
    { name: "Final Approved", value: requests.filter((r) => r.status === "approved").length, color: STATUS_COLORS.approved },
    { name: "Awaiting HOD", value: requests.filter((r) => r.status === "coordinator_approved").length, color: STATUS_COLORS.coordinator_approved },
    { name: "At Coordinator", value: requests.filter((r) => r.status === "pending").length, color: STATUS_COLORS.pending },
    { name: "Rejected", value: requests.filter((r) => r.status === "rejected").length, color: STATUS_COLORS.rejected },
  ].filter((d) => d.value > 0), [requests]);

  const attendanceData = useMemo(() => {
    return DEPARTMENTS.map((dept) => {
      const deptStudents = students.filter((s) => s.department === dept);
      if (deptStudents.length === 0) return null;
      return { name: dept, avg: Math.round(deptStudents.reduce((s, st) => s + (st.attendance || 0), 0) / deptStudents.length), students: deptStudents.length };
    }).filter(Boolean) as { name: string; avg: number; students: number }[];
  }, [students]);

  const verifiedContacts = students.filter((s) => s.parent_phone_verified).length;
  const unverifiedContacts = students.filter((s) => !s.parent_phone_verified && s.parent_phone).length;

  const handleSignOut = async () => { await signOut(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 md:p-6 flex items-center gap-3">
        <button onClick={handleSignOut}
          className="shadow-raised-sm rounded-lg p-2 bg-background transition-shadow-neu hover:shadow-inset cursor-pointer" title="Sign Out">
          <LogOut className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-outfit font-semibold text-foreground">HOD Dashboard</h1>
          <p className="text-sm text-muted-foreground font-outfit">HOD Level Review & Analytics</p>
        </div>
        <div className="hidden md:block shadow-inset rounded-xl px-4 py-2 text-primary font-outfit font-medium transition-shadow-neu">
          {actionableRequests.length} pending your approval
        </div>
      </header>

      <div className="px-4 md:px-6 pb-8 space-y-6">
        {/* New Actionable Requests Section */}
        <div className="animate-float-up">
           <h3 className="text-sm font-outfit font-semibold text-primary mb-3 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Pending Final Approval ({actionableRequests.length})
          </h3>
          <div className="shadow-inset-deep rounded-2xl p-4 md:p-6 bg-background/50">
            {actionableRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 font-outfit">No requests awaiting HOD approval.</p>
            ) : (
              <div className="space-y-4">
                {actionableRequests.map((r) => (
                  <AdminRequestRow key={r.id} request={r} role="hod" onStatusChange={fetchData} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Requests", value: totalRequests, icon: FileText, color: "text-primary" },
            { label: "Awaiting HOD", value: actionableRequests.length, icon: CalendarDays, color: "text-blue-500" },
            { label: "At Coordinator", value: pendingAtCoordinator, icon: Clock, color: "text-pending" },
            { label: "Avg Attendance", value: `${avgAttendance}%`, icon: TrendingUp, color: "text-approved" },
          ].map((stat) => (
            <div key={stat.label} className="shadow-raised rounded-2xl bg-background p-5 animate-float-up">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground font-outfit uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className={`font-mono-data text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="shadow-raised rounded-2xl bg-background p-5">
            <h3 className="text-sm font-outfit font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Requests by Department
            </h3>
            <div className="h-52">
              {deptData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} barGap={2}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "3px 3px 8px #d1d9e6, -3px -3px 8px #ffffff", fontFamily: "Outfit", fontSize: 12 }} />
                    <Bar dataKey="approved" stackId="a" fill={STATUS_COLORS.approved} />
                    <Bar dataKey="coordinator" stackId="a" fill={STATUS_COLORS.coordinator_approved} />
                    <Bar dataKey="pending" stackId="a" fill={STATUS_COLORS.pending} />
                    <Bar dataKey="rejected" stackId="a" fill={STATUS_COLORS.rejected} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-16 font-outfit">No data yet</p>
              )}
            </div>
          </div>

          <div className="shadow-raised rounded-2xl bg-background p-5">
            <h3 className="text-sm font-outfit font-semibold text-foreground mb-4 uppercase tracking-wider">Request Type Breakdown</h3>
            <div className="flex items-center gap-6">
              <div className="h-44 w-44 shrink-0">
                {typeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={typeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                        {typeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "3px 3px 8px #d1d9e6, -3px -3px 8px #ffffff", fontFamily: "Outfit", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-16 font-outfit">No data</p>}
              </div>
              <div className="space-y-3">
                {typeData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-sm font-outfit text-foreground">{d.name}</span>
                    <span className="font-mono-data text-sm text-muted-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="shadow-raised rounded-2xl bg-background p-5">
            <h3 className="text-sm font-outfit font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-approved" /> Attendance by Department
            </h3>
            <div className="space-y-3">
              {attendanceData.length > 0 ? attendanceData.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="font-mono-data text-xs text-muted-foreground w-12">{d.name}</span>
                  <div className="flex-1 shadow-inset rounded-full h-5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${d.avg}%`, backgroundColor: d.avg >= 80 ? STATUS_COLORS.approved : d.avg >= 70 ? STATUS_COLORS.pending : STATUS_COLORS.rejected }} />
                  </div>
                  <span className="font-mono-data text-sm text-foreground font-medium w-12 text-right">{d.avg}%</span>
                </div>
              )) : <p className="text-center text-muted-foreground py-8 font-outfit">No student data yet</p>}
            </div>
          </div>

          <div className="space-y-6">
            <div className="shadow-raised rounded-2xl bg-background p-5">
              <h3 className="text-sm font-outfit font-semibold text-foreground mb-4 uppercase tracking-wider">Status Overviewstage</h3>
              <div className="flex gap-2">
                {statusData.length > 0 ? statusData.map((d) => (
                  <div key={d.name} className="flex-1 shadow-inset rounded-xl p-3 text-center">
                    <p className="font-mono-data text-lg font-semibold" style={{ color: d.color }}>{d.value}</p>
                    <p className="text-[10px] text-muted-foreground font-outfit mt-1 leading-tight">{d.name}</p>
                  </div>
                )) : <p className="text-center text-muted-foreground py-4 font-outfit">No data</p>}
              </div>
            </div>

            <div className="shadow-raised rounded-2xl bg-background p-5">
              <h3 className="text-sm font-outfit font-semibold text-foreground mb-4 uppercase tracking-wider">Parent Contact Status</h3>
              <div className="flex gap-4">
                <div className="flex-1 shadow-inset rounded-xl p-4 text-center">
                  <p className="font-mono-data text-xl font-semibold text-approved">{verifiedContacts}</p>
                  <p className="text-xs text-muted-foreground font-outfit mt-1">Verified</p>
                </div>
                <div className="flex-1 shadow-inset rounded-xl p-4 text-center">
                  <p className="font-mono-data text-xl font-semibold text-pending">{unverifiedContacts}</p>
                  <p className="text-xs text-muted-foreground font-outfit mt-1">Unverified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HodDashboard;
