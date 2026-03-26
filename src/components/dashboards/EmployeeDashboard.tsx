"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Award, ClipboardList, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PtoBalance {
  pto_type: string;
  balance_hours: number;
  used_hours: number;
}

interface Task {
  id: string;
  status: string;
  onboarding_tasks: { title: string } | null;
}

export function EmployeeDashboard() {
  const { user } = useCurrentUser();
  const [ptoBalances, setPtoBalances] = useState<PtoBalance[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.employeeId) { setLoading(false); return; }
    async function load() {
      const supabase = createClient();
      const year = new Date().getFullYear();
      const [ptoRes, taskRes] = await Promise.all([
        supabase.from("pto_balances").select("pto_type, balance_hours, used_hours").eq("employee_id", user!.employeeId!).eq("year", year),
        supabase.from("employee_onboarding_progress").select("id, status, onboarding_tasks(title)").eq("employee_id", user!.employeeId!).neq("status", "completed").limit(5),
      ]);
      setPtoBalances(ptoRes.data ?? []);
      setTasks((taskRes.data ?? []) as unknown as Task[]);
      setLoading(false);
    }
    load();
  }, [user?.employeeId]);

  const pendingTasks = tasks.filter(t => t.status !== "completed" && t.status !== "waived");
  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="overflow-hidden border-0" style={{ background: "linear-gradient(135deg, #007384 0%, #2DBDB6 100%)" }}>
        <CardContent className="p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-75">Welcome back</p>
              <h2 className="font-heading mt-0.5 text-3xl tracking-wide uppercase">{user?.fullName ?? "Employee"}</h2>
              <p className="mt-1 text-sm opacity-60 capitalize">{user?.role?.replace(/_/g, " ")}</p>
            </div>
            <div className="text-right text-sm opacity-60 hidden sm:block">
              <div>{today.toLocaleDateString("en-US", { weekday: "long" })}</div>
              <div className="font-semibold text-white/90">{today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PTO Balances */}
      {ptoBalances.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {ptoBalances.map(b => (
            <Card key={b.pto_type} className="stat-card-teal">
              <CardContent className="p-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider capitalize">{b.pto_type.replace(/_/g, " ")}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{b.balance_hours}<span className="text-sm font-normal text-muted-foreground ml-0.5">h</span></p>
                <p className="text-xs text-muted-foreground">{b.used_hours}h used</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Onboarding Tasks */}
      {pendingTasks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Onboarding Tasks</CardTitle>
              <Link href="/onboarding/my-tasks">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingTasks.slice(0, 4).map(t => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                <div className="h-4 w-4 rounded-full border-2 shrink-0" style={{ borderColor: "#007384" }} />
                <span className="text-sm text-foreground flex-1">{t.onboarding_tasks?.title ?? "Task"}</span>
                <Badge variant="muted" className="capitalize text-[10px]">{t.status.replace(/_/g, " ")}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "My Profile", href: user?.employeeId ? `/employees/${user.employeeId}/overview` : "/dashboard", icon: Award, color: "#007384" },
          { label: "Request PTO", href: "/pto", icon: Calendar, color: "#d4a000" },
          { label: "My Schedule", href: "/schedules", icon: Clock, color: "#2DBDB6" },
          { label: "My Tasks", href: "/onboarding/my-tasks", icon: ClipboardList, color: "#8E9089" },
        ].map(a => (
          <Link key={a.href} href={a.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg p-2" style={{ backgroundColor: `${a.color}12` }}>
                  <a.icon className="h-4 w-4" style={{ color: a.color }} />
                </div>
                <span className="text-sm font-medium text-foreground">{a.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
