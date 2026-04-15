import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, Search, Users, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DEPARTMENTS, YEARS, SECTIONS, RequestType } from "@/lib/mock-data";
import AdminRequestRow from "@/components/admin/AdminRequestRow";
import ParentContactPanel from "@/components/admin/ParentContactPanel";

import { DbRequest } from "@/lib/types";

const types: { value: RequestType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "od", label: "OD" },
  { value: "leave", label: "Leave" },
  { value: "outpass", label: "Outpass" },
];

type AdminTab = "requests" | "contacts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [requests, setRequests] = useState<DbRequest[]>([]);
  const [filterDept, setFilterDept] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterType, setFilterType] = useState<RequestType | "all">("all");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("requests");

  const fetchRequests = async () => {
    const { data } = await supabase.from("requests").select("*").order("created_at", { ascending: false });
    setRequests(data || []);
  };

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel("admin-requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, () => fetchRequests())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (filterDept !== "all" && r.department !== filterDept) return false;
      if (filterYear !== "all" && r.year !== Number(filterYear)) return false;
      if (filterType !== "all" && r.type !== filterType) return false;
      if (search && !r.student_name?.toLowerCase().includes(search.toLowerCase()) && !r.roll_number?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [requests, filterDept, filterYear, filterType, search]);

  const pending = filtered.filter((r) => r.status === "pending");
  const resolved = filtered.filter((r) => r.status !== "pending");

  const handleSignOut = async () => { await signOut(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 md:p-6 flex items-center gap-3">
        <button onClick={handleSignOut}
          className="shadow-raised-sm rounded-lg p-2 bg-background transition-shadow-neu hover:shadow-inset cursor-pointer" title="Sign Out">
          <LogOut className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-outfit font-semibold text-foreground">Coordinator Console</h1>
          <p className="text-sm text-muted-foreground font-mono-data">{pending.length} pending requests</p>
        </div>
      </header>

      <div className="px-4 md:px-6 mb-4">
        <div className="shadow-raised rounded-xl bg-background p-1.5 inline-flex gap-1">
          <button onClick={() => setActiveTab("requests")}
            className={`rounded-lg px-4 py-2 text-sm font-outfit font-medium transition-shadow-neu cursor-pointer ${activeTab === "requests" ? "shadow-inset text-primary" : "text-muted-foreground hover:shadow-inset"}`}>
            <Filter className="w-4 h-4 inline mr-1.5" />Requests
          </button>
          <button onClick={() => setActiveTab("contacts")}
            className={`rounded-lg px-4 py-2 text-sm font-outfit font-medium transition-shadow-neu cursor-pointer ${activeTab === "contacts" ? "shadow-inset text-primary" : "text-muted-foreground hover:shadow-inset"}`}>
            <Users className="w-4 h-4 inline mr-1.5" />Parent Contacts
          </button>
        </div>
      </div>

      <div className="px-4 md:px-6 pb-8">
        {activeTab === "contacts" ? (
          <ParentContactPanel />
        ) : (
          <>
            <div className="shadow-raised rounded-2xl bg-background p-4 mb-6">
              <div className="flex flex-wrap gap-3 items-center">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <div className="shadow-inset rounded-lg flex items-center gap-2 px-3 py-2 flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Search by name or roll no..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent outline-none text-sm font-outfit text-foreground placeholder:text-muted-foreground flex-1" />
                </div>
                <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} title="Filter by Department" className="shadow-inset rounded-lg px-3 py-2 bg-transparent text-sm font-outfit text-foreground outline-none cursor-pointer">
                  <option value="all">All Depts</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} title="Filter by Year" className="shadow-inset rounded-lg px-3 py-2 bg-transparent text-sm font-outfit text-foreground outline-none cursor-pointer">
                  <option value="all">All Years</option>
                  {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
                </select>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value as RequestType | "all")} title="Filter by Request Type" className="shadow-inset rounded-lg px-3 py-2 bg-transparent text-sm font-outfit text-foreground outline-none cursor-pointer">
                  {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div className="shadow-inset-deep rounded-2xl p-4 md:p-6">
              {pending.length === 0 && resolved.length === 0 ? (
                <p className="text-center text-muted-foreground py-12 font-outfit">No requests match your filters.</p>
              ) : (
                <div className="space-y-6">
                  {pending.length > 0 && (
                    <div>
                      <h3 className="text-sm font-outfit font-semibold text-pending mb-3 uppercase tracking-wider">Pending Review ({pending.length})</h3>
                      <div className="space-y-3">
                        {pending.map((r) => <AdminRequestRow key={r.id} request={r} role="coordinator" onStatusChange={fetchRequests} />)}
                      </div>
                    </div>
                  )}
                  {resolved.length > 0 && (
                    <div>
                      <h3 className="text-sm font-outfit font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Resolved ({resolved.length})</h3>
                      <div className="space-y-3">
                        {resolved.map((r) => <AdminRequestRow key={r.id} request={r} role="coordinator" onStatusChange={fetchRequests} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
