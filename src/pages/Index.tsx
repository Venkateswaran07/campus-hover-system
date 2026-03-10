import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-float-up">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-outfit font-bold text-foreground tracking-tight mb-2">
            Campus Governance
          </h1>
          <p className="text-muted-foreground font-outfit">
            Unified OD · Leave · Outpass System
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <button
            onClick={() => navigate("/student")}
            className="shadow-raised rounded-2xl p-8 bg-background transition-shadow-neu hover:shadow-inset active:shadow-inset-deep flex items-center gap-5 cursor-pointer group"
          >
            <div className="shadow-raised-sm rounded-xl p-3 bg-background transition-shadow-neu group-hover:shadow-inset">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-outfit font-semibold text-lg text-foreground">Student Portal</p>
              <p className="text-sm text-muted-foreground">Apply for OD, Leave & Outpass</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/admin")}
            className="shadow-raised rounded-2xl p-8 bg-background transition-shadow-neu hover:shadow-inset active:shadow-inset-deep flex items-center gap-5 cursor-pointer group"
          >
            <div className="shadow-raised-sm rounded-xl p-3 bg-background transition-shadow-neu group-hover:shadow-inset">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-outfit font-semibold text-lg text-foreground">Admin Console</p>
              <p className="text-sm text-muted-foreground">Review & manage student requests</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
