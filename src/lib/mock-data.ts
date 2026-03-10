export type RequestType = "od" | "leave" | "outpass";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  year: number;
  attendance: number;
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
  // OD specific
  eventName?: string;
  eventDate?: string;
  // Leave specific
  fromDate?: string;
  toDate?: string;
  // Outpass specific
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
};

const now = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const fmtTime = (d: Date) => d.toISOString().slice(0, 16);

export const initialRequests: Request[] = [
  {
    id: "r1",
    studentId: "s1",
    studentName: "Arjun Mehta",
    rollNumber: "21CS042",
    department: "CSE",
    year: 3,
    type: "od",
    status: "approved",
    createdAt: fmt(new Date(now.getTime() - 86400000 * 3)),
    reason: "National hackathon participation",
    eventName: "HackSummit 2026",
    eventDate: fmt(new Date(now.getTime() + 86400000 * 2)),
  },
  {
    id: "r2",
    studentId: "s1",
    studentName: "Arjun Mehta",
    rollNumber: "21CS042",
    department: "CSE",
    year: 3,
    type: "leave",
    status: "pending",
    createdAt: fmt(new Date(now.getTime() - 86400000)),
    reason: "Family function",
    fromDate: fmt(new Date(now.getTime() + 86400000 * 5)),
    toDate: fmt(new Date(now.getTime() + 86400000 * 7)),
  },
  {
    id: "r3",
    studentId: "s1",
    studentName: "Arjun Mehta",
    rollNumber: "21CS042",
    department: "CSE",
    year: 3,
    type: "outpass",
    status: "rejected",
    createdAt: fmt(now),
    reason: "Medical appointment",
    exitTime: fmtTime(new Date(now.getTime() + 3600000)),
    returnBy: fmtTime(new Date(now.getTime() + 7200000)),
  },
  {
    id: "r4",
    studentId: "s2",
    studentName: "Priya Sharma",
    rollNumber: "22EC018",
    department: "ECE",
    year: 2,
    type: "od",
    status: "pending",
    createdAt: fmt(now),
    reason: "Paper presentation at IEEE conference",
    eventName: "IEEE TechCon 2026",
    eventDate: fmt(new Date(now.getTime() + 86400000 * 10)),
  },
  {
    id: "r5",
    studentId: "s3",
    studentName: "Karthik R",
    rollNumber: "23ME055",
    department: "MECH",
    year: 1,
    type: "leave",
    status: "pending",
    createdAt: fmt(new Date(now.getTime() - 86400000 * 2)),
    reason: "Semester break travel",
    fromDate: fmt(new Date(now.getTime() + 86400000 * 3)),
    toDate: fmt(new Date(now.getTime() + 86400000 * 6)),
  },
  {
    id: "r6",
    studentId: "s4",
    studentName: "Sneha Iyer",
    rollNumber: "21IT033",
    department: "IT",
    year: 3,
    type: "outpass",
    status: "pending",
    createdAt: fmt(now),
    reason: "Dental appointment",
    exitTime: fmtTime(new Date(now.getTime() + 1800000)),
    returnBy: fmtTime(new Date(now.getTime() + 5400000)),
  },
];
