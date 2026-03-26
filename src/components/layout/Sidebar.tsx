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
    <aside className="flex h-full w-60 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Brand */}
      <div className="flex h-14 items-center px-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <span className="font-heading text-sm font-bold text-white tracking-wide">RP</span>
          </div>
          <div>
            <div className="font-heading text-[15px] leading-tight tracking-widest text-[#FFEB95]">RUSHTOWN</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-accent">HR Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => {
            if (!user) return false;
            if (!item.permission) return true;
            return hasPermission(user.role, item.permission);
          });
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/35">
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
                        className={cn(
                          "group flex items-center gap-3 rounded-md px-2.5 py-[7px] text-[13px] transition-all duration-150",
                          active
                            ? "bg-sidebar-primary/15 text-sidebar-primary font-medium border-l-2 border-sidebar-primary pl-[calc(0.625rem-2px)]"
                            : "text-sidebar-foreground/60 hover:text-sidebar-foreground/85 hover:bg-sidebar-accent/50"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                        {active && <ChevronRight className="ml-auto h-3 w-3 opacity-40" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User */}
      {user && (
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-sidebar-accent px-2.5 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {(user.fullName ?? user.email ?? "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-sidebar-foreground/90">
                {user.fullName ?? user.email}
              </div>
              <div className="text-[10px] capitalize text-sidebar-foreground/40">
                {user.role.replace(/_/g, " ")}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
