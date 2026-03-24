export const ROLES = {
  OWNER: "owner",
  HR_MANAGER: "hr_manager",
  DEPARTMENT_MANAGER: "department_manager",
  EMPLOYEE: "employee",
  EXECUTIVE: "executive",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  hr_manager: "HR Manager",
  department_manager: "Dept. Manager",
  employee: "Employee",
  executive: "Executive",
};

export const ROLE_COLORS: Record<Role, string> = {
  owner: "bg-purple-100 text-purple-800",
  hr_manager: "bg-blue-100 text-blue-800",
  department_manager: "bg-green-100 text-green-800",
  employee: "bg-gray-100 text-gray-800",
  executive: "bg-amber-100 text-amber-800",
};

// Roles that can manage HR data
export const HR_ROLES: Role[] = [ROLES.OWNER, ROLES.HR_MANAGER];

// Roles that can view management-level data
export const MANAGER_ROLES: Role[] = [
  ROLES.OWNER,
  ROLES.HR_MANAGER,
  ROLES.DEPARTMENT_MANAGER,
];
