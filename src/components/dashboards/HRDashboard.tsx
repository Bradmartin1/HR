"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users, Calendar, TrendingUp, AlertTriangle,
  Building2, ArrowRight, FileText, RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

export function HRDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    pendingPto: 0,
    openReviews: 0,
    activePoints: 0,
  });
  const [depts, setDepts] = useState<{ name: string; count: number }[]>([]);
  const [ptoRequests, setPtoRequests] = useState<{ id: string; name: string; type: string; start: string; end: string; hours: number }[]>([]);
  const [recentStrikes, setRecentStrikes] = useState<{ id: string; name: string; points: number | null; category: string; date: string }[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const [empRes, ptoRes, strikeRes, deptRes, reviewRes] = await Promise.all([
        supabase.from("employees").select("id, status").is("deleted_at", null),
        supabase.from("pto_requests").select("id, pto_type, start_date, end_date, hours_requested, employee:employees(first_name, last_name)").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
        supabase.from("strike_events").select("id, points, incident_date, employee:employees!strike_events_employee_id_fkey(first_name, last_name), strike_categories(name)").eq("voided", false).order("created_at", { ascending: false }).limit(5),
        supabase.from("departments").select("id, name, employees(id)"),
        supabase.from("performance_reviews").select("id").eq("status", "pending"),
      ]);

      const employees = empRes.data ?? [];
      setStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.status === "active").length,
        onLeave: employees.filter(e => e.status === "on_leave").length,
        pendingPto: ptoRes.data?.length ?? 0,
        openReviews: reviewRes.data?.length ?? 0,
        activePoints: (strikeRes.data ?? []).reduce((sum, s) => sum + (s.points ?? 0), 0),
      });

      setDepts(
        (deptRes.data ?? [])
          .map(d => ({ name: d.name, count: Array.isArray(d.employees) ? d.employees.length : 0 }))
          .filter(d => d.count > 0)
          .sort((a, b) => b.count - a.count)
      );

      setPtoRequests(
        (ptoRes.data ?? []).map(p => {
          const emp = p.employee as unknown as { first_name: string; last_name: string } | null;
          return {
            id: p.id,
            name: emp ? `${emp.first_name} ${emp.last_name}` : "Unknown",
            type: p.pto_type,
            start: p.start_date,
            end: p.end_date,
            hours: p.hours_requested,
          };
        })
      );

      setRecentStrikes(
        (strikeRes.data ?? []).map(s => {
          const emp = s.employee as unknown as { first_name: string; last_name: string } | null;
          const cat = s.strike_categories as unknown as { name: string } | null;
          return {
            id: s.id,
            name: emp ? `${emp.first_name} ${emp.last_name}` : "Unknown",
            points: s.points,
            category: cat?.name ?? "Unknown",
            date: s.incident_date,
          };
        })
      );

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-5 h-28 animate-pulse bg-muted/30" /></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="p-5 h-56 animate-pulse bg-muted/30" /></Card>
          ))}
        </div>
      </div>
    );
  }

  const maxDept = Math.max(...depts.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="stat-card-teal">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Staff</p>
                <p className="mt-1.5 text-3xl font-bold text-foreground">{stats.totalEmployees}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stats.activeEmployees} active · {stats.onLeave} on leave</p>
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
                <p className="mt-1.5 text-3xl font-bold text-foreground">{stats.pendingPto}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">awaiting approval</p>
              </div>
              <div className="rounded-lg p-2" style={{ backgroundColor: "rgba(255,194,14,0.1)" }}>
                <Calendar className="h-5 w-5" style={{ color: "#d4a000" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card-accent">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Open Reviews</p>
                <p className="mt-1.5 text-3xl font-bold text-foreground">{stats.openReviews}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">pending submission</p>
              </div>
              <div className="rounded-lg p-2" style={{ backgroundColor: "rgba(45,189,182,0.1)" }}>
                <TrendingUp className="h-5 w-5" style={{ color: "#2DBDB6" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card-orange">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Recent Points</p>
                <p className="mt-1.5 text-3xl font-bold text-foreground">{recentStrikes.length}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">last 30 days</p>
              </div>
              <div className="rounded-lg p-2" style={{ backgroundColor: "rgba(241,90,34,0.08)" }}>
                <AlertTriangle className="h-5 w-5" style={{ color: "#F15A22" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Second Row ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Department Headcount */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Headcount by Department</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {depts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No departments with employees</p>
            ) : depts.map(d => (
              <div key={d.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">{d.name}</span>
                  <span className="text-muted-foreground">{d.count}</span>
                </div>
                <Progress value={(d.count / maxDept) * 100} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending PTO */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending PTO Requests</CardTitle>
              <Link href="/pto">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {ptoRequests.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                {ptoRequests.map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                    <div>
                      <div className="text-sm font-medium text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{p.type.replace(/_/g, " ")} · {p.hours}h</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{formatDate(p.start)}</div>
                      <div className="text-xs text-muted-foreground">→ {formatDate(p.end)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Strikes/Points */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Points</CardTitle>
              <Link href="/strikes">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentStrikes.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No recent points issued</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentStrikes.map(s => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                    <div>
                      <div className="text-sm font-medium text-foreground">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={s.points && s.points >= 2 ? "destructive" : "warning"} className="text-[10px]">
                        {s.points ?? 0} pt{(s.points ?? 0) !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Actions ── */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Add Employee", href: "/employees/new", icon: Users, color: "#007384" },
              { label: "Bulk Upload", href: "/bulk-upload", icon: FileText, color: "#2DBDB6" },
              { label: "View Reports", href: "/reports", icon: TrendingUp, color: "#d4a000" },
              { label: "Manage Surveys", href: "/surveys", icon: RefreshCw, color: "#8E9089" },
            ].map(a => (
              <Link key={a.href} href={a.href}>
                <div className="flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted cursor-pointer">
                  <a.icon className="h-4 w-4 shrink-0" style={{ color: a.color }} />
                  {a.label}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
