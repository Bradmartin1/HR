"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, Building2,
  AlertTriangle, Calendar, Clock, FileBarChart, Upload,
  Bell, Settings, TrendingUp, Award, ClipboardCheck,
  UserCheck, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { hasPermission } from "@/lib/auth/permissions";
import type { Permission } from "@/lib/auth/permissions";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: Permission;
  activePattern?: RegExp;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Employees", href: "/employees", icon: Users, permission: "employees.list" },
      { label: "Departments", href: "/departments", icon: Building2, permission: "departments.manage" },
      { label: "Onboarding", href: "/onboarding", icon: ClipboardCheck, permission: "onboarding.manage_templates" },
      { label: "My Tasks", href: "/onboarding/my-tasks", icon: ClipboardList },
      { label: "Recognition", href: "/recognition", icon: Award },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Attendance", href: "/attendance", icon: UserCheck, permission: "attendance.enter" },
      { label: "PTO", href: "/pto", icon: Calendar },
      { label: "Schedules", href: "/schedules", icon: Clock },
      { label: "Points", href: "/strikes", icon: AlertTriangle, permission: "strikes.issue" },
    ],
  },
  {
    label: "Performance",
    items: [
      { label: "Reviews", href: "/performance", icon: TrendingUp, permission: "performance.manage_cycles" },
      { label: "Surveys", href: "/surveys", icon: ClipboardList, permission: "surveys.manage" },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Reports", href: "/reports", icon: FileBarChart, permission: "reports.full" },
      { label: "Bulk Upload", href: "/bulk-upload", icon: Upload, permission: "bulk_upload.import" },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();

  const isActive = (item: NavItem) => {
    if (item.activePattern) return item.activePattern.test(pathname);
    if (item.href === "/dashboard") return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <aside className="flex h-full w-60 flex-col" style={{ backgroundColor: "hsl(343 23% 6%)" }}>
      <div className="flex h-14 items-center px-5 border-b" style={{ borderColor: "hsl(343 15% 14%)" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded" style={{ backgroundColor: "#2DBDB6" }}>
            <span className="text-xs font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>RP</span>
          </div>
          <div>
            <div className="text-sm leading-tight tracking-wide" style={{ color: "#FFEB95", fontFamily: "var(--font-heading)", letterSpacing: "0.08em" }}>RUSHTOWN</div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: "#2DBDB6" }}>HR Platform</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => {
            if (!user) return false;
            if (!item.permission) return true;
            return hasPermission(user.role, item.permission);
          });
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "hsl(77 3% 45%)" }}>
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-all duration-150"
                        style={active ? {
                          backgroundColor: "hsl(177 61% 46% / 0.15)",
                          color: "hsl(177 61% 66%)",
                          borderLeft: "2px solid hsl(177 61% 46%)",
                          paddingLeft: "calc(0.625rem - 2px)",
                          fontWeight: "500",
                        } : {
                          color: "hsl(0 0% 65%)",
                        }}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                        {active && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {user && (
        <div className="border-t p-3" style={{ borderColor: "hsl(343 15% 14%)" }}>
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2" style={{ backgroundColor: "hsl(343 20% 12%)" }}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ backgroundColor: "hsl(188 100% 26%)" }}>
              {(user.fullName ?? user.email ?? "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium" style={{ color: "hsl(0 0% 92%)" }}>
                {user.fullName ?? user.email}
              </div>
              <div className="text-[10px] capitalize" style={{ color: "hsl(77 3% 55%)" }}>
                {user.role.replace(/_/g, " ")}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
