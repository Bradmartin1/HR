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
  owner: "bg-[#e6f7f6] text-[#005f6d]",
  hr_manager: "bg-[#e0f4f3] text-[#007384]",
  department_manager: "bg-[#fff4cc] text-[#7a5e00]",
  employee: "bg-[#f0efee] text-[#5c5b59]",
  executive: "bg-[#fde8e1] text-[#a33a14]",
};

export const HR_ROLES: Role[] = [ROLES.OWNER, ROLES.HR_MANAGER];

export const MANAGER_ROLES: Role[] = [
  ROLES.OWNER,
  ROLES.HR_MANAGER,
  ROLES.DEPARTMENT_MANAGER,
];
