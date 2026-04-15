import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield, BarChart3, ArrowLeft, LogIn, UserPlus, Lock, LucideIcon } from "lucide-react";
import VideoBackground from "@/components/VideoBackground";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DEPARTMENTS, YEARS, SECTIONS } from "@/lib/mock-data";

type RoleOption = "student" | "coordinator" | "hod";

const COORDINATOR_ACCESS_CODE = "COORD2025";

const roleConfig: Record<RoleOption, { icon: LucideIcon; title: string; desc: string }> = {
  student: { icon: GraduationCap, title: "Student Portal", desc: "Apply for OD, Leave & Outpass" },
  coordinator: { icon: Shield, title: "Coordinator Console", desc: "Review requests & verify contacts" },
  hod: { icon: BarChart3, title: "HOD Dashboard", desc: "Reports, statistics & oversight" },
};

const glassInput = "w-full rounded-lg px-4 py-3 bg-black/40 backdrop-blur-2xl border border-white/20 text-sm font-outfit text-white placeholder:text-white/50 outline-none focus:border-white/40 transition-colors";
const glassSelect = "w-full rounded-lg px-4 py-3 bg-black/40 backdrop-blur-2xl border border-white/20 text-sm font-outfit text-white outline-none cursor-pointer focus:border-white/40 transition-colors";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [section, setSection] = useState("");

  if (!selectedRole) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 relative">
        <VideoBackground />
        <div className="w-full max-w-lg animate-float-up">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-outfit font-bold text-white tracking-tight mb-2 drop-shadow-lg">
              Leave & Movement Registry
            </h1>
            <p className="text-white/70 font-outfit drop-shadow">Select your portal to continue</p>
          </div>
          <div className="flex flex-col gap-6">
            {(Object.keys(roleConfig) as RoleOption[]).map((r) => {
              const cfg = roleConfig[r];
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className="rounded-2xl p-8 backdrop-blur-2xl bg-black/40 border border-white/20 shadow-lg hover:bg-black/60 active:bg-black/70 transition-all duration-200 flex items-center gap-5 cursor-pointer group"
                >
                  <div className="rounded-xl p-3 backdrop-blur-md bg-white/10 border border-white/20">
                    <cfg.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-outfit font-semibold text-lg text-white">{cfg.title}</p>
                    <p className="text-sm text-white/70">{cfg.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const showSignUpToggle = selectedRole !== "hod";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (selectedRole === "hod") {
          toast.error("HOD accounts cannot be created. Please contact admin.");
          return;
        }

        if (selectedRole === "coordinator") {
          if (accessCode !== COORDINATOR_ACCESS_CODE) {
            toast.error("Invalid coordinator access code. Contact your department admin for the code.");
            return;
          }
        }

        const { error } = await signUp(email, password, {
          full_name: fullName,
          role: selectedRole,
          department: department || undefined,
          year: year ? Number(year) : undefined,
          roll_number: rollNumber || undefined,
          parent_phone: parentPhone || undefined,
          section: section || undefined,
        });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Account created! Signing you in...");
          const { error: signInErr } = await signIn(email, password);
          if (signInErr) {
            toast.error("Account created but sign-in failed. Please sign in manually.");
            setIsSignUp(false);
          } else {
            navigate(selectedRole === "student" ? "/student" : selectedRole === "coordinator" ? "/admin" : "/hod");
          }
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Login failed. Please try again.");
          return;
        }

        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        const actualRole = roleData?.role as RoleOption | null;
        const effectiveRole: RoleOption = actualRole ?? "student";

        if (effectiveRole !== selectedRole) {
          toast.error(`This account is registered as "${effectiveRole}". Please select the correct portal.`);
          await supabase.auth.signOut();
          return;
        }

        if (selectedRole === "hod" && email.toLowerCase() !== "310624104366@eec.srmrmp.edu.in") {
          toast.error("Only the designated HOD account can access this portal.");
          await supabase.auth.signOut();
          return;
        }

        toast.success("Signed in successfully!");
        navigate(effectiveRole === "student" ? "/student" : effectiveRole === "coordinator" ? "/admin" : "/hod");
      }
    } finally {
      setLoading(false);
    }
  };

  const cfg = roleConfig[selectedRole];

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative">
      <VideoBackground />
      <div className="w-full max-w-md animate-float-up">
        <button
          onClick={() => { setSelectedRole(null); setIsSignUp(false); setAccessCode(""); }}
          className="rounded-lg p-2 backdrop-blur-xl bg-black/40 border border-white/20 hover:bg-black/60 transition-all cursor-pointer mb-6"
          title="Go back"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="rounded-2xl backdrop-blur-2xl bg-black/40 border border-white/20 shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl p-3 bg-white/10 border border-white/20">
              <cfg.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-outfit font-semibold text-xl text-white">{cfg.title}</h2>
              {selectedRole === "hod" && (
                <p className="text-xs text-white/60">Authorized access only</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-sm text-white/70 font-outfit mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={glassInput}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm text-white/70 font-outfit mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={glassInput}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="text-sm text-white/70 font-outfit mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={glassInput}
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            {isSignUp && selectedRole === "coordinator" && (
              <div>
                <label className="text-sm text-white/70 font-outfit mb-1 block flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Coordinator Access Code
                </label>
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className={glassInput}
                  placeholder="Enter the access code provided by admin"
                  required
                />
              </div>
            )}

            {isSignUp && selectedRole === "student" && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-white/70 font-outfit mb-1 block">Department</label>
                    <select title="Select Department" value={department} onChange={(e) => setDepartment(e.target.value)} className={glassSelect} required>
                      <option value="">Select</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d} className="text-black">{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-white/70 font-outfit mb-1 block">Year</label>
                    <select title="Select Year" value={year} onChange={(e) => setYear(e.target.value)} className={glassSelect} required>
                      <option value="">Select</option>
                      {YEARS.map((y) => <option key={y} value={y} className="text-black">Year {y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-white/70 font-outfit mb-1 block">Section</label>
                    <select title="Select Section" value={section} onChange={(e) => setSection(e.target.value)} className={glassSelect} required>
                      <option value="">Select</option>
                      {SECTIONS.map((s) => <option key={s} value={s} className="text-black">{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/70 font-outfit mb-1 block">Roll Number</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className={glassInput}
                    placeholder="e.g. 21CS042"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70 font-outfit mb-1 block">Parent Phone</label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className={glassInput}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </>
            )}

            {isSignUp && selectedRole === "coordinator" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/70 font-outfit mb-1 block">Department</label>
                  <select title="Select Department" value={department} onChange={(e) => setDepartment(e.target.value)} className={glassSelect} required>
                    <option value="">Select</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d} className="text-black">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/70 font-outfit mb-1 block">Section</label>
                  <select title="Select Section" value={section} onChange={(e) => setSection(e.target.value)} className={glassSelect} required>
                    <option value="">Select</option>
                    {SECTIONS.map((s) => <option key={s} value={s} className="text-black">{s}</option>)}
                  </select>
                </div>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full backdrop-blur-xl bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-all" disabled={loading}>
              {loading ? (
                <span className="animate-pulse">Please wait...</span>
              ) : isSignUp ? (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </Button>
          </form>

          {showSignUpToggle && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-white/80 font-outfit hover:text-white hover:underline cursor-pointer"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
