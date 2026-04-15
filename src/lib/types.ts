import { LucideIcon } from "lucide-react";

export type RequestType = "od" | "leave" | "outpass";
export type RequestStatus = "pending" | "coordinator_approved" | "approved" | "rejected";

export interface DbRequest {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  reason: string;
  department: string;
  section?: string | null;
  year: number;
  type: RequestType;
  status: RequestStatus;
  created_at: string;
  event_name?: string;
  event_date?: string;
  from_date?: string;
  to_date?: string;
  exit_time?: string;
  return_by?: string;
}

export interface DbProfile {
  user_id: string;
  full_name: string;
  department?: string | null;
  year?: number | null;
  roll_number?: string | null;
  parent_phone?: string | null;
  parent_phone_verified?: boolean | null;
  section?: string | null;
  attendance?: number | null;
}
