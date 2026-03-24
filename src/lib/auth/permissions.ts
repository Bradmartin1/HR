import { type Role, ROLES } from "@/lib/constants/roles";

export type Permission =
  // Employees
  | "employees.list"
  | "employees.create"
  | "employees.edit"
  | "employees.delete"
  | "employees.view_any"
  | "employees.view_own"
  // Compensation
  | "compensation.view"
  | "compensation.edit"
  // Documents
  | "documents.upload"
  | "documents.view_sensitive"
  | "documents.view_nonsensitive"
  // Onboarding
  | "onboarding.manage_templates"
  | "onboarding.complete_tasks"
  | "onboarding.mark_others_tasks"
  // Performance
  | "performance.manage_cycles"
  | "performance.conduct_reviews"
  | "performance.view_team_reviews"
  | "performance.acknowledge_own"
  // Recognition
  | "recognition.give"
  | "recognition.manage_categories"
  // Strikes
  | "strikes.issue"
  | "strikes.void"
  | "strikes.configure_rules"
  | "strikes.view_team"
  // PTO
  | "pto.approve"
  | "pto.configure_policies"
  // Schedules
  | "schedules.manage"
  // Attendance
  | "attendance.enter"
  // Surveys
  | "surveys.manage"
  // Bulk Upload
  | "bulk_upload.import"
  // Reports
  | "reports.full"
  | "reports.scoped"
  | "reports.export"
  // Audit
  | "audit.view"
  // Admin
  | "admin.app_config"
  | "admin.manage_users"
  // Departments
  | "departments.manage";

// Maps each role to its set of permissions
const rolePermissions: Record<Role, Permission[]> = {
  owner: [
    "employees.list", "employees.create", "employees.edit", "employees.delete",
    "employees.view_any", "employees.view_own",
    "compensation.view", "compensation.edit",
    "documents.upload", "documents.view_sensitive", "documents.view_nonsensitive",
    "onboarding.manage_templates", "onboarding.complete_tasks", "onboarding.mark_others_tasks",
    "performance.manage_cycles", "performance.conduct_reviews",
    "performance.view_team_reviews", "performance.acknowledge_own",
    "recognition.give", "recognition.manage_categories",
    "strikes.issue", "strikes.void", "strikes.configure_rules", "strikes.view_team",
    "pto.approve", "pto.configure_policies",
    "schedules.manage",
    "attendance.enter",
    "surveys.manage",
    "bulk_upload.import",
    "reports.full", "reports.scoped", "reports.export",
    "audit.view",
    "admin.app_config", "admin.manage_users",
    "departments.manage",
  ],
  hr_manager: [
    "employees.list", "employees.create", "employees.edit", "employees.delete",
    "employees.view_any", "employees.view_own",
    "compensation.view", "compensation.edit",
    "documents.upload", "documents.view_sensitive", "documents.view_nonsensitive",
    "onboarding.manage_templates", "onboarding.complete_tasks", "onboarding.mark_others_tasks",
    "performance.manage_cycles", "performance.conduct_reviews",
    "performance.view_team_reviews", "performance.acknowledge_own",
    "recognition.give", "recognition.manage_categories",
    "strikes.issue", "strikes.void", "strikes.configure_rules", "strikes.view_team",
    "pto.approve", "pto.configure_policies",
    "schedules.manage",
    "attendance.enter",
    "surveys.manage",
    "bulk_upload.import",
    "reports.full", "reports.scoped", "reports.export",
    "admin.app_config",
    "departments.manage",
  ],
  department_manager: [
    "employees.list", "employees.edit", "employees.view_any", "employees.view_own",
    "documents.view_nonsensitive",
    "onboarding.complete_tasks", "onboarding.mark_others_tasks",
    "performance.conduct_reviews", "performance.view_team_reviews", "performance.acknowledge_own",
    "recognition.give",
    "strikes.issue", "strikes.view_team",
    "pto.approve",
    "schedules.manage",
    "attendance.enter",
    "reports.scoped",
  ],
  employee: [
    "employees.view_own",
    "documents.view_nonsensitive",
    "onboarding.complete_tasks",
    "performance.acknowledge_own",
  ],
  executive: [
    "employees.view_any",
    "reports.full",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function getPermissions(role: Role): Permission[] {
  return rolePermissions[role] ?? [];
}

export function canAccess(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function canAccessAny(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
