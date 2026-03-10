export type RequestType = "od" | "leave" | "outpass";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface ParentContact {
  phone: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  year: number;
  attendance: number;
  parentContact: ParentContact;
}

export interface Request {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  year: number;
  type: RequestType;
  status: RequestStatus;
  createdAt: string;
  reason: string;
  eventName?: string;
  eventDate?: string;
  fromDate?: string;
  toDate?: string;
  exitTime?: string;
  returnBy?: string;
}

export const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];
export const YEARS = [1, 2, 3, 4];

export const mockStudent: StudentProfile = {
  id: "s1",
  name: "Arjun Mehta",
  rollNumber: "21CS042",
  department: "CSE",
  year: 3,
  attendance: 82,
  parentContact: { phone: "+91 98765 43210", verified: true, verifiedBy: "Dr. Kumar", verifiedAt: "2026-02-15" },
};

export const allStudents: StudentProfile[] = [
  mockStudent,
  {
    id: "s2", name: "Priya Sharma", rollNumber: "22EC018", department: "ECE", year: 2, attendance: 78,
    parentContact: { phone: "+91 87654 32109", verified: false },
  },
  {
    id: "s3", name: "Karthik R", rollNumber: "23ME055", department: "MECH", year: 1, attendance: 91,
    parentContact: { phone: "+91 76543 21098", verified: true, verifiedBy: "Dr. Rajan", verifiedAt: "2026-01-20" },
  },
  {
    id: "s4", name: "Sneha Iyer", rollNumber: "21IT033", department: "IT", year: 3, attendance: 85,
    parentContact: { phone: "+91 65432 10987", verified: false },
  },
  {
    id: "s5", name: "Rahul Nair", rollNumber: "22CS061", department: "CSE", year: 2, attendance: 74,
    parentContact: { phone: "+91 54321 09876", verified: true, verifiedBy: "Dr. Kumar", verifiedAt: "2026-03-01" },
  },
  {
    id: "s6", name: "Deepa M", rollNumber: "21EE045", department: "EEE", year: 3, attendance: 88,
    parentContact: { phone: "+91 43210 98765", verified: false },
  },
];

const now = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const fmtTime = (d: Date) => d.toISOString().slice(0, 16);

export const initialRequests: Request[] = [
  {
    id: "r1", studentId: "s1", studentName: "Arjun Mehta", rollNumber: "21CS042", department: "CSE", year: 3,
    type: "od", status: "approved", createdAt: fmt(new Date(now.getTime() - 86400000 * 3)),
    reason: "National hackathon participation", eventName: "HackSummit 2026", eventDate: fmt(new Date(now.getTime() + 86400000 * 2)),
  },
  {
    id: "r2", studentId: "s1", studentName: "Arjun Mehta", rollNumber: "21CS042", department: "CSE", year: 3,
    type: "leave", status: "pending", createdAt: fmt(new Date(now.getTime() - 86400000)),
    reason: "Family function", fromDate: fmt(new Date(now.getTime() + 86400000 * 5)), toDate: fmt(new Date(now.getTime() + 86400000 * 7)),
  },
  {
    id: "r3", studentId: "s1", studentName: "Arjun Mehta", rollNumber: "21CS042", department: "CSE", year: 3,
    type: "outpass", status: "rejected", createdAt: fmt(now),
    reason: "Medical appointment", exitTime: fmtTime(new Date(now.getTime() + 3600000)), returnBy: fmtTime(new Date(now.getTime() + 7200000)),
  },
  {
    id: "r4", studentId: "s2", studentName: "Priya Sharma", rollNumber: "22EC018", department: "ECE", year: 2,
    type: "od", status: "pending", createdAt: fmt(now),
    reason: "Paper presentation at IEEE conference", eventName: "IEEE TechCon 2026", eventDate: fmt(new Date(now.getTime() + 86400000 * 10)),
  },
  {
    id: "r5", studentId: "s3", studentName: "Karthik R", rollNumber: "23ME055", department: "MECH", year: 1,
    type: "leave", status: "pending", createdAt: fmt(new Date(now.getTime() - 86400000 * 2)),
    reason: "Semester break travel", fromDate: fmt(new Date(now.getTime() + 86400000 * 3)), toDate: fmt(new Date(now.getTime() + 86400000 * 6)),
  },
  {
    id: "r6", studentId: "s4", studentName: "Sneha Iyer", rollNumber: "21IT033", department: "IT", year: 3,
    type: "outpass", status: "pending", createdAt: fmt(now),
    reason: "Dental appointment", exitTime: fmtTime(new Date(now.getTime() + 1800000)), returnBy: fmtTime(new Date(now.getTime() + 5400000)),
  },
  {
    id: "r7", studentId: "s5", studentName: "Rahul Nair", rollNumber: "22CS061", department: "CSE", year: 2,
    type: "od", status: "approved", createdAt: fmt(new Date(now.getTime() - 86400000 * 5)),
    reason: "Inter-college coding competition", eventName: "CodeWars 2026", eventDate: fmt(new Date(now.getTime() - 86400000 * 2)),
  },
  {
    id: "r8", studentId: "s6", studentName: "Deepa M", rollNumber: "21EE045", department: "EEE", year: 3,
    type: "leave", status: "approved", createdAt: fmt(new Date(now.getTime() - 86400000 * 7)),
    reason: "Sister's wedding", fromDate: fmt(new Date(now.getTime() - 86400000 * 4)), toDate: fmt(new Date(now.getTime() - 86400000 * 2)),
  },
  {
    id: "r9", studentId: "s2", studentName: "Priya Sharma", rollNumber: "22EC018", department: "ECE", year: 2,
    type: "outpass", status: "approved", createdAt: fmt(new Date(now.getTime() - 86400000 * 1)),
    reason: "Lab visit at IIT campus", exitTime: fmtTime(new Date(now.getTime() - 86400000)), returnBy: fmtTime(new Date(now.getTime() - 86400000 + 10800000)),
  },
];
