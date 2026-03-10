import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Users, TrendingUp, FileText, CalendarDays, LogOut } from "lucide-react";
import { useAppState } from "@/lib/app-context";
import { DEPARTMENTS } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const STATUS_COLORS = {
  approved: "#10B981",
  pending: "#F59E0B",
  rejected: "#EF4444",
};

const TYPE_COLORS = {
  od: "#2563EB",
  leave: "#8B5CF6",
  outpass: "#EC4899",
};

const HodDashboard = () => {
  const navigate = useNavigate();
  const { requests, students } = useAppState();

  // Summary stats
  const totalRequests = requests.length;
  const totalStudents = students.length;
  const avgAttendance = Math.round(students.reduce((s, st) => s + st.attendance, 0) / students.length);
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  // Requests by department
  const deptData = useMemo(() => {
    return DEPARTMENTS.map((dept) => {
      const deptReqs = requests.filter((r) => r.department === dept);
      return {
        name: dept,
        total: deptReqs.length,
        pending: deptReqs.filter((r) => r.status === "pending").length,
        approved: deptReqs.filter((r) => r.status === "approved").length,
        rejected: deptReqs.filter((r) => r.status === "rejected").length,
      };
    }).filter((d) => d.total > 0);
  }, [requests]);

  // Requests by type
  const typeData = useMemo(() => {
    const od = requests.filter((r) => r.type === "od").length;
    const leave = requests.filter((r) => r.type === "leave").length;
    const outpass = requests.filter((r) => r.type === "outpass").length;
    return [
      { name: "OD", value: od, color: TYPE_COLORS.od },
      { name: "Leave", value: leave, color: TYPE_COLORS.leave },
      { name: "Outpass", value: outpass, color: TYPE_COLORS.outpass },
    ].filter((d) => d.value > 0);
  }, [requests]);

  // Status breakdown
  const statusData = useMemo(() => [
    { name: "Approved", value: requests.filter((r) => r.status === "approved").length, color: STATUS_COLORS.approved },
    { name: "Pending", value: requests.filter((r) => r.status === "pending").length, color: STATUS_COLORS.pending },
    { name: "Rejected", value: requests.filter((r) => r.status === "rejected").length, color: STATUS_COLORS.rejected },
  ].filter((d) => d.value > 0), [requests]);

  // Attendance by department
  const attendanceData = useMemo(() => {
    return DEPARTMENTS.map((dept) => {
      const deptStudents = students.filter((s) => s.department === dept);
      if (deptStudents.length === 0) return null;
      return {
        name: dept,
        avg: Math.round(deptStudents.reduce((s, st) => s + st.attendance, 0) / deptStudents.length),
        students: deptStudents.length,
      };
    }).filter(Boolean) as { name: string; avg: number; students: number }[];
  }, [students]);

  // Contact verification stats
  const verifiedContacts = students.filter((s) => s.parentContact.verified).length;
  const unverifiedContacts = students.filter((s) => !s.parentContact.verified).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 md:p-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="shadow-raised-sm rounded-lg p-2 bg-background transition-shadow-neu hover:shadow-inset cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-outfit font-semibold text-foreground">HOD Dashboard</h1>
          <p className="text-sm text-muted-foreground font-outfit">Department reports & statistics</p>
        </div>
      </header>

      <div className="px-4 md:px-6 pb-8 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Requests", value: totalRequests, icon: FileText, color: "text-primary" },
            { label: "Pending", value: pendingCount, icon: CalendarDays, color: "text-pending" },
            { label: "Students", value: totalStudents, icon: Users, color: "text-foreground" },
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

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requests by Department */}
          <div className="shadow-raised rounded-2xl bg-background p-5">
            <h3 className="text-sm font-outfit font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Requests by Department
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} barGap={2}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "3px 3px 8px #d1d9e6, -3px -3px 8px #ffffff", fontFamily: "Outfit", fontSize: 12 }} />
                  <Bar dataKey="approved" stackId="a" fill={STATUS_COLORS.approved} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill={STATUS_COLORS.pending} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="rejected" stackId="a" fill={STATUS_COLORS.rejected} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Request Type Breakdown */}
          <div className="shadow-raised rounded-2xl bg-background p-5">
            <h3 className="text-sm font-outfit font-semibold text-foreground mb-4 uppercase tracking-wider">
              Request Type Breakdown
            </h3>
            <div className="flex items-center gap-6">
              <div className="h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={typeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                      {typeData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "3px 3px 8px #d1d9e6, -3px -3px 8px #ffffff", fontFamily: "Outfit", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
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

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance by dept */}
          <div className="shadow-raised rounded-2xl bg-background p-5">
            <h3 className="text-sm font-outfit font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-approved" />
              Attendance by Department
            </h3>
            <div className="space-y-3">
              {attendanceData.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="font-mono-data text-xs text-muted-foreground w-12">{d.name}</span>
                  <div className="flex-1 shadow-inset rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${d.avg}%`,
                        backgroundColor: d.avg >= 80 ? STATUS_COLORS.approved : d.avg >= 70 ? STATUS_COLORS.pending : STATUS_COLORS.rejected,
                      }}
                    />
                  </div>
                  <span className="font-mono-data text-sm text-foreground font-medium w-12 text-right">{d.avg}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status overview + contact stats */}
          <div className="space-y-6">
            <div className="shadow-raised rounded-2xl bg-background p-5">
              <h3 className="text-sm font-outfit font-semibold text-foreground mb-4 uppercase tracking-wider">
                Status Overview
              </h3>
              <div className="flex gap-4">
                {statusData.map((d) => (
                  <div key={d.name} className="flex-1 shadow-inset rounded-xl p-4 text-center">
                    <p className="font-mono-data text-xl font-semibold" style={{ color: d.color }}>{d.value}</p>
                    <p className="text-xs text-muted-foreground font-outfit mt-1">{d.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="shadow-raised rounded-2xl bg-background p-5">
              <h3 className="text-sm font-outfit font-semibold text-foreground mb-4 uppercase tracking-wider">
                Parent Contact Status
              </h3>
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
