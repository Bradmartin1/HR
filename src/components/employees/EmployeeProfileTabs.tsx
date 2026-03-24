"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { type Role } from "@/lib/constants/roles";
import { hasPermission } from "@/lib/auth/permissions";

interface Tab {
  label: string;
  value: string;
  requireCompensation?: boolean;
  sensitiveOnly?: boolean;
}

const ALL_TABS: Tab[] = [
  { label: "Overview", value: "overview" },
  { label: "Personal", value: "personal" },
  { label: "Employment", value: "employment" },
  { label: "Compensation", value: "compensation", requireCompensation: true },
  { label: "Documents", value: "documents" },
  { label: "Onboarding", value: "onboarding" },
  { label: "Performance", value: "performance" },
  { label: "Recognition", value: "recognition" },
  { label: "Strikes", value: "strikes" },
  { label: "PTO", value: "pto" },
  { label: "Schedule", value: "schedule" },
  { label: "Attendance", value: "attendance" },
  { label: "Notes", value: "notes", sensitiveOnly: true },
];

interface Props {
  employeeId: string;
  activeTab: string;
  role: Role;
}

export function EmployeeProfileTabs({ employeeId, role }: Props) {
  const pathname = usePathname();
  const canViewComp = hasPermission(role, "compensation.view");
  const canViewNotes = hasPermission(role, "employees.edit");

  const visibleTabs = ALL_TABS.filter((tab) => {
    if (tab.requireCompensation && !canViewComp) return false;
    if (tab.sensitiveOnly && !canViewNotes) return false;
    return true;
  });

  return (
    <div className="border-b overflow-x-auto">
      <nav className="flex gap-0 -mb-px min-w-max">
        {visibleTabs.map((tab) => {
          const href = `/employees/${employeeId}/${tab.value}`;
          const isActive = pathname === href;
          return (
            <Link
              key={tab.value}
              href={href}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
