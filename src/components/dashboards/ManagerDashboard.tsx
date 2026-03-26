"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

export function ManagerDashboard() {
  const { user } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [teamCount, setTeamCount] = useState(0);
  const [pendingPto, setPendingPto] = useState(0);
  const [recentStrikes, setRecentStrikes] = useState(0);
  const [deptName, setDeptName] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      const supabase = createClient();

      // Get manager's department
      const { data: mgr } = await supabase
        .from("department_managers")
        .select("department_id, departments(name)")
        .eq("user_id", user!.id)
        .eq("is_primary", true)
        .limit(1)
        .single();

      if (!mgr) { setLoading(false); return; }
      const deptId = mgr.department_id;
      const dept = mgr.departments as unknown as { name: string } | null;
      setDeptName(dept?.name ?? "");

      const [empRes, ptoRes, strikeRes] = await Promise.all([
        supabase.from("employees").select("id").eq("department_id", deptId).eq("status", "active").is("deleted_at", null),
        supabase.from("pto_requests").select("id, employee:employees!pto_requests_employee_id_fkey(department_id)").eq("status", "pending"),
        supabase.from("strike_events").select("id, employee:employees!strike_events_employee_id_fkey(department_id)").eq("voided", false),
      ]);

      setTeamCount(empRes.data?.length ?? 0);
      // Filter PTO to department
      const deptPto = (ptoRes.data ?? []).filter(p => {
        const emp = p.employee as unknown as { department_id: string } | null;
        return emp?.department_id === deptId;
      });
      setPendingPto(deptPto.length);

      const deptStrikes = (strikeRes.data ?? []).filter(s => {
        const emp = s.employee as unknown as { department_id: string } | null;
        return emp?.department_id === deptId;
      });
      setRecentStrikes(deptStrikes.length);
      setLoading(false);
    }
    load();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}><CardContent className="p-5 h-28 animate-pulse bg-muted/30" /></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {deptName && (
        <p className="text-sm text-muted-foreground">Managing <span className="font-semibold text-foreground">{deptName}</span> department</p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Card className="stat-card-teal">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Team Size</p>
                <p className="mt-1.5 text-3xl font-bold text-foreground">{teamCount}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">active employees</p>
              </div>
              <div className="rounded-lg p-2" style={{ backgroundColor: "rgba(0,115,132,0.08)" }}>
                <Users className="h-5 w-5" style={{ color: "#007384" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card-gold">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pending PTO</p>
                <p className="mt-1.5 text-3xl font-bold text-foreground">{pendingPto}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">awaiting approval</p>
              </div>
              <div className="rounded-lg p-2" style={{ backgroundColor: "rgba(255,194,14,0.1)" }}>
                <Calendar className="h-5 w-5" style={{ color: "#d4a000" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card-orange">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active Points</p>
                <p className="mt-1.5 text-3xl font-bold text-foreground">{recentStrikes}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">in your department</p>
              </div>
              <div className="rounded-lg p-2" style={{ backgroundColor: "rgba(241,90,34,0.08)" }}>
                <AlertTriangle className="h-5 w-5" style={{ color: "#F15A22" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Team Members", href: "/employees", icon: Users, color: "#007384" },
          { label: "PTO Requests", href: "/pto", icon: Calendar, color: "#d4a000" },
          { label: "Issue Point", href: "/strikes", icon: AlertTriangle, color: "#F15A22" },
          { label: "Schedules", href: "/schedules", icon: CheckCircle2, color: "#2DBDB6" },
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
