import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield, BarChart3, ArrowLeft, LogIn, UserPlus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DEPARTMENTS, YEARS } from "@/lib/mock-data";

type RoleOption = "student" | "coordinator" | "hod";

const COORDINATOR_ACCESS_CODE = "COORD2025";

const roleConfig: Record<RoleOption, { icon: any; title: string; desc: string }> = {
  student: { icon: GraduationCap, title: "Student Portal", desc: "Apply for OD, Leave & Outpass" },
  coordinator: { icon: Shield, title: "Coordinator Console", desc: "Review requests & verify contacts" },
  hod: { icon: BarChart3, title: "HOD Dashboard", desc: "Reports, statistics & oversight" },
};

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

  if (!selectedRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-lg animate-float-up">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-outfit font-bold text-foreground tracking-tight mb-2">
              Campus Governance
            </h1>
            <p className="text-muted-foreground font-outfit">Select your portal to continue</p>
          </div>
          <div className="flex flex-col gap-6">
            {(Object.keys(roleConfig) as RoleOption[]).map((r) => {
              const cfg = roleConfig[r];
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className="shadow-raised rounded-2xl p-8 bg-background transition-shadow-neu hover:shadow-inset active:shadow-inset-deep flex items-center gap-5 cursor-pointer group"
                >
                  <div className="shadow-raised-sm rounded-xl p-3 bg-background transition-shadow-neu group-hover:shadow-inset">
                    <cfg.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-outfit font-semibold text-lg text-foreground">{cfg.title}</p>
                    <p className="text-sm text-muted-foreground">{cfg.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // HOD portal: only sign-in, no sign-up
  const showSignUpToggle = selectedRole !== "hod";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Block HOD signup entirely
        if (selectedRole === "hod") {
          toast.error("HOD accounts cannot be created. Please contact admin.");
          return;
        }

        // Validate coordinator access code
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
        });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Account created! Please check your email to verify, then sign in.");
          setIsSignUp(false);
        }
      } else {
        // Sign in
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
          return;
        }

        // After sign-in, verify the user's actual role matches the selected portal
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

        // If no role in user_roles, default to student
        const effectiveRole: RoleOption = actualRole ?? "student";

        if (effectiveRole !== selectedRole) {
          toast.error(`This account is registered as "${effectiveRole}". Please select the correct portal.`);
          await supabase.auth.signOut();
          return;
        }

        // HOD portal: only allow the designated email
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-float-up">
        <button
          onClick={() => { setSelectedRole(null); setIsSignUp(false); setAccessCode(""); }}
          className="shadow-raised-sm rounded-lg p-2 bg-background transition-shadow-neu hover:shadow-inset cursor-pointer mb-6"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        <div className="shadow-raised rounded-2xl bg-background p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="shadow-inset rounded-xl p-3">
              <cfg.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-outfit font-semibold text-xl text-foreground">{cfg.title}</h2>
              {selectedRole === "hod" && (
                <p className="text-xs text-muted-foreground">Authorized access only</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-sm text-muted-foreground font-outfit mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-outfit text-foreground placeholder:text-muted-foreground outline-none"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm text-muted-foreground font-outfit mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-outfit text-foreground placeholder:text-muted-foreground outline-none"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground font-outfit mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-outfit text-foreground placeholder:text-muted-foreground outline-none"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            {/* Coordinator access code */}
            {isSignUp && selectedRole === "coordinator" && (
              <div>
                <label className="text-sm text-muted-foreground font-outfit mb-1 block flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Coordinator Access Code
                </label>
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-outfit text-foreground placeholder:text-muted-foreground outline-none"
                  placeholder="Enter the access code provided by admin"
                  required
                />
              </div>
            )}

            {isSignUp && selectedRole === "student" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground font-outfit mb-1 block">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-outfit text-foreground outline-none cursor-pointer"
                      required
                    >
                      <option value="">Select</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground font-outfit mb-1 block">Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-outfit text-foreground outline-none cursor-pointer"
                      required
                    >
                      <option value="">Select</option>
                      {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground font-outfit mb-1 block">Roll Number</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-outfit text-foreground placeholder:text-muted-foreground outline-none"
                    placeholder="e.g. 21CS042"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground font-outfit mb-1 block">Parent Phone</label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-outfit text-foreground placeholder:text-muted-foreground outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </>
            )}

            {isSignUp && selectedRole === "coordinator" && (
              <div>
                <label className="text-sm text-muted-foreground font-outfit mb-1 block">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full shadow-inset rounded-lg px-4 py-3 bg-transparent text-sm font-outfit text-foreground outline-none cursor-pointer"
                >
                  <option value="">All Departments</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
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
                className="text-sm text-primary font-outfit hover:underline cursor-pointer"
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
