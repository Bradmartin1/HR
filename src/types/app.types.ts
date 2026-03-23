import { type Role } from "@/lib/constants/roles";

export interface EmployeeWithRelations {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  status: string;
  employment_type: string;
  hire_date: string;
  termination_date: string | null;
  department_id: string | null;
  job_title_id: string | null;
  location_id: string | null;
  manager_id: string | null;
  work_email: string | null;
  work_phone: string | null;
  departments?: { id: string; name: string; code: string } | null;
  job_titles?: { id: string; title: string } | null;
  locations?: { id: string; name: string } | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  employeeId: string | null;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  column: string;
  direction: "asc" | "desc";
}

export interface FilterParams {
  search?: string;
  department_id?: string;
  status?: string;
  location_id?: string;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BulkUploadRow {
  employee_number?: string;
  first_name: string;
  last_name: string;
  department: string;
  job_title: string;
  hire_date: string;
  employment_type?: string;
  work_email?: string;
  personal_phone?: string;
  pay_type?: string;
  pay_amount?: string;
  [key: string]: string | undefined;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingPtoRequests: number;
  openReviews: number;
  recentStrikes: number;
  onboardingInProgress: number;
}

export type EmployeeStatus = "active" | "inactive" | "terminated" | "on_leave";
export type EmploymentType = "full_time" | "part_time" | "contractor" | "seasonal";
