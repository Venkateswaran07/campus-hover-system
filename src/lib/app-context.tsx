import React, { createContext, useContext, useState, useCallback } from "react";
import { Request, RequestStatus, initialRequests, mockStudent, StudentProfile } from "@/lib/mock-data";

interface AppState {
  requests: Request[];
  student: StudentProfile;
  addRequest: (req: Omit<Request, "id" | "createdAt" | "status">) => void;
  updateStatus: (id: string, status: RequestStatus) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
};

let nextId = 100;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [student, setStudent] = useState<StudentProfile>(mockStudent);

  const addRequest = useCallback((req: Omit<Request, "id" | "createdAt" | "status">) => {
    const newReq: Request = {
      ...req,
      id: `r${nextId++}`,
      createdAt: new Date().toISOString().split("T")[0],
      status: "pending",
    };
    setRequests((prev) => [newReq, ...prev]);
  }, []);

  const updateStatus = useCallback((id: string, status: RequestStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    // Simulate attendance bump when OD approved
    if (status === "approved") {
      setRequests((prev) => {
        const req = prev.find((r) => r.id === id);
        if (req?.type === "od" && req.studentId === student.id) {
          setStudent((s) => ({ ...s, attendance: Math.min(100, s.attendance + 2) }));
        }
        return prev;
      });
    }
  }, [student.id]);

  return (
    <AppContext.Provider value={{ requests, student, addRequest, updateStatus }}>
      {children}
    </AppContext.Provider>
  );
};
