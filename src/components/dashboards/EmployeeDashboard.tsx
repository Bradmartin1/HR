"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ClipboardList, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface PtoBalance {
  pto_type: string;
  balance_hours: number;
}

export function EmployeeDashboard() {
  const { user } = useCurrentUser();
  const [balances, setBalances] = useState<PtoBalance[]>([]);
  const [pendingTasks, setPendingTasks] = useState(0);

  useEffect(() => {
    if (!user?.employeeId) return;
    const load = async () => {
      const supabase = createClient();
      const year = new Date().getFullYear();

      const [{ data: bal }, { count: tasks }] = await Promise.all([
        supabase.from("pto_balances").select("pto_type, balance_hours")
          .eq("employee_id", user.employeeId!).eq("year", year),
        supabase.from("employee_onboarding_progress").select("id", { count: "exact" })
          .eq("employee_id", user.employeeId!).eq("status", "pending"),
      ]);

      if (bal) setBalances(bal);
      setPendingTasks(tasks ?? 0);
    };
    load();
  }, [user?.employeeId]);

  const quickLinks = [
    { label: "My Profile", href: user?.employeeId ? `/employees/${user.employeeId}` : "#", icon: User },
    { label: "Request PTO", href: "/pto/requests/new", icon: Calendar },
    { label: "My Schedule", href: "/schedules", icon: Clock },
    { label: "Onboarding Tasks", href: "/onboarding/my-tasks", icon: ClipboardList, badge: pendingTasks },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-3 pt-4 pb-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{link.label}</p>
                    {link.badge ? (
                      <p className="text-xs text-muted-foreground">{link.badge} pending</p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* PTO Balances */}
      {balances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">PTO Balances — {new Date().getFullYear()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {balances.map((b) => (
                <div key={b.pto_type} className="text-sm">
                  <div className="font-medium capitalize">{b.pto_type.replace("_", " ")}</div>
                  <div className="text-2xl font-bold">{b.balance_hours}h</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
