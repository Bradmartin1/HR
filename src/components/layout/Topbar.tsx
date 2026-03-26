"use client";

import { Bell, LogOut, Settings, User, ChevronDown } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNotifications } from "@/hooks/useNotifications";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils/format";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/employees": "Employees",
  "/departments": "Departments",
  "/onboarding": "Onboarding",
  "/onboarding/my-tasks": "My Tasks",
  "/performance": "Performance Reviews",
  "/recognition": "Recognition",
  "/strikes": "Strikes & Discipline",
  "/pto": "PTO Management",
  "/schedules": "Schedules",
  "/attendance": "Attendance",
  "/surveys": "Surveys",
  "/reports": "Reports",
  "/bulk-upload": "Bulk Upload",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/employees/") && pathname.split("/").length > 3) return "Employee Profile";
  if (pathname.startsWith("/dashboard/")) return "Dashboard";
  return PAGE_TITLES[pathname] ?? "Rushtown HR";
}

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { unreadCount } = useNotifications(user?.id);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div>
        <h1 className="text-base font-semibold text-foreground">{getPageTitle(pathname)}</h1>
        <p className="text-xs text-muted-foreground hidden sm:block">Rushtown Poultry · Internal HR Platform</p>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => router.push("/notifications")} className="relative h-9 w-9 rounded-full">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: "hsl(16 88% 54%)" }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-2 rounded-full">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[11px] font-semibold text-white" style={{ backgroundColor: "hsl(188 100% 26%)" }}>
                  {getInitials(user?.fullName ?? user?.email)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block text-foreground">{user?.fullName ?? user?.email}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{user?.fullName}</span>
                <span className="text-xs text-muted-foreground capitalize">{user?.role?.replace(/_/g, " ")}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <User className="mr-2 h-4 w-4" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
