import React, { createContext, useContext, useState, useCallback } from "react";
import { Request, RequestStatus, initialRequests, mockStudent, StudentProfile, allStudents } from "@/lib/mock-data";

interface AppState {
  requests: Request[];
  student: StudentProfile;
  students: StudentProfile[];
  addRequest: (req: Omit<Request, "id" | "createdAt" | "status">) => void;
  updateStatus: (id: string, status: RequestStatus) => void;
  verifyParentContact: (studentId: string, coordinatorName: string) => void;
  updateParentPhone: (studentId: string, phone: string) => void;
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
  const [students, setStudents] = useState<StudentProfile[]>(allStudents);

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

  const verifyParentContact = useCallback((studentId: string, coordinatorName: string) => {
    const now = new Date().toISOString().split("T")[0];
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, parentContact: { ...s.parentContact, verified: true, verifiedBy: coordinatorName, verifiedAt: now } }
          : s
      )
    );
    if (studentId === student.id) {
      setStudent((s) => ({ ...s, parentContact: { ...s.parentContact, verified: true, verifiedBy: coordinatorName, verifiedAt: now } }));
    }
  }, [student.id]);

  const updateParentPhone = useCallback((studentId: string, phone: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, parentContact: { phone, verified: false } }
          : s
      )
    );
    if (studentId === student.id) {
      setStudent((s) => ({ ...s, parentContact: { phone, verified: false } }));
    }
  }, [student.id]);

  return (
    <AppContext.Provider value={{ requests, student, students, addRequest, updateStatus, verifyParentContact, updateParentPhone }}>
      {children}
    </AppContext.Provider>
  );
};
