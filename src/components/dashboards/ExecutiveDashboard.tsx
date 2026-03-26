"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Building2, TrendingUp, AlertTriangle, Calendar } from "lucide-react";

export function ExecutiveDashboard() {
  const [loading, setLoading] = useState(true);
  const [totalEmp, setTotalEmp] = useState(0);
  const [deptBreakdown, setDeptBreakdown] = useState<{ name: string; count: number }[]>([]);
  const [activeReviews, setActiveReviews] = useState(0);
  const [openPto, setOpenPto] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [empRes, deptRes, reviewRes, ptoRes] = await Promise.all([
        supabase.from("employees").select("id, status").is("deleted_at", null).eq("status", "active"),
        supabase.from("departments").select("id, name, employees(id)"),
        supabase.from("performance_reviews").select("id").eq("status", "pending"),
        supabase.from("pto_requests").select("id").eq("status", "pending"),
      ]);

      setTotalEmp(empRes.data?.length ?? 0);
      setDeptBreakdown(
        (deptRes.data ?? [])
          .map(d => ({ name: d.name, count: Array.isArray(d.employees) ? d.employees.length : 0 }))
          .filter(d => d.count > 0)
          .sort((a, b) => b.count - a.count)
      );
      setActiveReviews(reviewRes.data?.length ?? 0);
      setOpenPto(ptoRes.data?.length ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  const maxDept = Math.max(...deptBreakdown.map(d => d.count), 1);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}><CardContent className="p-5 h-28 animate-pulse bg-muted/30" /></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="stat-card-teal">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Workforce</p>
            <p className="mt-1.5 text-3xl font-bold text-foreground">{totalEmp}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">active employees</p>
          </CardContent>
        </Card>
        <Card className="stat-card-accent">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Departments</p>
            <p className="mt-1.5 text-3xl font-bold text-foreground">{deptBreakdown.length}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">active departments</p>
          </CardContent>
        </Card>
        <Card className="stat-card-gold">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Open PTO</p>
            <p className="mt-1.5 text-3xl font-bold text-foreground">{openPto}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">pending requests</p>
          </CardContent>
        </Card>
        <Card className="stat-card-orange">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Reviews</p>
            <p className="mt-1.5 text-3xl font-bold text-foreground">{activeReviews}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">pending submission</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workforce Distribution</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {deptBreakdown.map(d => (
            <div key={d.name} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">{d.name}</span>
                <span className="text-muted-foreground">{d.count} employees</span>
              </div>
              <Progress value={(d.count / maxDept) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
