"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, Building2, Star, AlertTriangle,
  Calendar, Clock, FileBarChart, Upload, Bell, Settings, Shield,
  TrendingUp, Award, ClipboardCheck, UserCheck,
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

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/employees", icon: Users, permission: "employees.list" },
  { label: "Onboarding", href: "/onboarding", icon: ClipboardCheck, permission: "onboarding.manage_templates" },
  { label: "My Tasks", href: "/onboarding/my-tasks", icon: ClipboardList },
  { label: "Departments", href: "/departments", icon: Building2, permission: "departments.manage" },
  { label: "Performance", href: "/performance", icon: TrendingUp, permission: "performance.manage_cycles" },
  { label: "Recognition", href: "/recognition", icon: Award },
  { label: "Strikes", href: "/strikes", icon: AlertTriangle, permission: "strikes.issue" },
  { label: "PTO", href: "/pto", icon: Calendar },
  { label: "Schedules", href: "/schedules", icon: Clock },
  { label: "Attendance", href: "/attendance", icon: UserCheck, permission: "attendance.enter" },
  { label: "Surveys", href: "/surveys", icon: ClipboardList, permission: "surveys.manage" },
  { label: "Reports", href: "/reports", permission: "reports.full", icon: FileBarChart },
  { label: "Bulk Upload", href: "/bulk-upload", icon: Upload, permission: "bulk_upload.import" },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!user) return false;
    if (!item.permission) return true;
    return hasPermission(user.role, item.permission);
  });

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-14 items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-sidebar-primary" />
          <span className="font-semibold text-sidebar-foreground">Rushtown HR</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-0.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.activePattern
              ? item.activePattern.test(pathname)
              : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info */}
      {user && (
        <div className="border-t border-sidebar-border p-4">
          <div className="text-xs text-sidebar-foreground/60">
            <div className="font-medium text-sidebar-foreground truncate">{user.fullName ?? user.email}</div>
            <div className="capitalize">{user.role.replace("_", " ")}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
