import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils/format";
import { Users, MapPin, User, Clock, Calendar, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}) {
  const { departmentId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, "departments.manage")) redirect("/dashboard");

  const supabase = await createClient();

  // Fetch department details
  const { data: dept } = await supabase
    .from("departments")
    .select(`
      id, name, code, default_shift_hours,
      locations(name, address)
    `)
    .eq("id", departmentId)
    .single();

  if (!dept) redirect("/departments");

  // Fetch employees, managers, recent PTO, and recent strikes in parallel
  const [empRes, mgrRes, ptoRes, strikeRes] = await Promise.all([
    supabase
      .from("employees")
      .select("id, first_name, last_name, status, hire_date, job_titles(title)")
      .eq("department_id", departmentId)
      .order("last_name"),
    supabase
      .from("department_managers")
      .select("is_primary, users(full_name, email)")
      .eq("department_id", departmentId),
    supabase
      .from("pto_requests")
      .select("id, pto_type, start_date, end_date, status, employees!pto_requests_employee_id_fkey(first_name, last_name, department_id)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("strike_events")
      .select("id, incident_date, description, points, voided, employees!strike_events_employee_id_fkey(first_name, last_name, department_id)")
      .eq("voided", false)
      .order("incident_date", { ascending: false })
      .limit(50),
  ]);

  const employees = empRes.data ?? [];
  const managers = mgrRes.data ?? [];
  const location = dept.locations as unknown as { name: string; address: string | null } | null;

  // Filter PTO and strikes to this department's employees
  const deptEmployeeIds = new Set(employees.map(e => e.id));
  const pendingPto = (ptoRes.data ?? []).filter(p => {
    const emp = p.employees as unknown as { department_id: string | null } | null;
    return emp?.department_id === departmentId;
  });
  const recentStrikes = (strikeRes.data ?? []).filter(s => {
    const emp = s.employees as unknown as { department_id: string | null } | null;
    return emp?.department_id === departmentId;
  }).slice(0, 10);

  const activeCount = employees.filter(e => e.status === "active").length;
  const onLeaveCount = employees.filter(e => e.status === "on_leave").length;

  const STATUS_CLASSES: Record<string, string> = {
    active: "bg-[#e6f7f6] text-[#005f6d]",
    inactive: "bg-[#f0efee] text-[#5c5b59]",
    terminated: "bg-[#fde8e1] text-[#b7411a]",
    on_leave: "bg-[#fff8e1] text-[#8a6b00]",
    onboarding: "bg-[#e0f4f3] text-[#007384]",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/departments">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={dept.name}
          description={`${dept.code} · ${activeCount} active employee${activeCount !== 1 ? "s" : ""}`}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="stat-card-teal">
          <CardContent className="pt-5 pb-4 px-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active</p>
            <p className="mt-1 text-2xl font-bold text-[#007384]">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="stat-card-gold">
          <CardContent className="pt-5 pb-4 px-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">On Leave</p>
            <p className="mt-1 text-2xl font-bold text-[#FFC20E]">{onLeaveCount}</p>
          </CardContent>
        </Card>
        <Card className="stat-card-accent">
          <CardContent className="pt-5 pb-4 px-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</p>
            <p className="mt-1 text-2xl font-bold text-[#2DBDB6]">{employees.length}</p>
          </CardContent>
        </Card>
        <Card className="stat-card-orange">
          <CardContent className="pt-5 pb-4 px-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending PTO</p>
            <p className="mt-1 text-2xl font-bold text-[#F15A22]">{pendingPto.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Department Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <div className="font-medium">{location.name}</div>
                  {location.address && <div className="text-xs text-muted-foreground">{location.address}</div>}
                </div>
              </div>
            )}
            {dept.default_shift_hours && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Default shift: {dept.default_shift_hours}h</span>
              </div>
            )}
            {managers.length > 0 && (
              <div className="pt-2 border-t space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Managers</p>
                {managers.map((m, i) => {
                  const u = (m as unknown as { users: { full_name: string; email: string } }).users;
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{u?.full_name ?? u?.email ?? "—"}</span>
                      {m.is_primary && (
                        <Badge className="bg-[#e0f4f3] text-[#007384] hover:bg-[#e0f4f3] text-[10px]">Primary</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending PTO */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">Pending PTO Requests</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {pendingPto.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending PTO requests.</p>
            ) : (
              <div className="space-y-2">
                {pendingPto.slice(0, 5).map((req) => {
                  const emp = req.employees as unknown as { first_name: string; last_name: string } | null;
                  return (
                    <div key={req.id} className="flex items-center justify-between gap-2 rounded-lg border bg-card p-3">
                      <div className="text-sm">
                        <span className="font-medium">{emp ? `${emp.first_name} ${emp.last_name}` : "Unknown"}</span>
                        <span className="text-muted-foreground ml-2 capitalize">{req.pto_type.replace(/_/g, " ")}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(req.start_date)} → {formatDate(req.end_date)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Employees</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {employees.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">No employees in this department.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-[11px] uppercase tracking-wide">Name</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Job Title</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Status</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Hire Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => {
                  const jobTitle = emp.job_titles as unknown as { title: string } | null;
                  return (
                    <TableRow key={emp.id}>
                      <TableCell className="text-sm font-medium">
                        <Link href={`/employees/${emp.id}/overview`} className="hover:underline text-foreground">
                          {emp.first_name} {emp.last_name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {jobTitle?.title ?? "—"}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_CLASSES[emp.status] ?? "bg-[#f0efee] text-[#5c5b59]"}`}>
                          {emp.status.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {emp.hire_date ? formatDate(emp.hire_date) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/employees/${emp.id}/overview`} className="text-sm text-primary hover:underline">
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Violations */}
      {recentStrikes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#F15A22]" />
              <CardTitle className="text-sm font-semibold">Recent Violations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentStrikes.map((strike) => {
                const emp = strike.employees as unknown as { first_name: string; last_name: string } | null;
                return (
                  <div key={strike.id} className="flex items-center justify-between gap-2 rounded-lg border bg-card p-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium">{emp ? `${emp.first_name} ${emp.last_name}` : "Unknown"}</span>
                      {strike.points != null && (
                        <Badge className="bg-[#fde8e1] text-[#F15A22] hover:bg-[#fde8e1] text-[10px]">
                          {strike.points} pt{strike.points !== 1 ? "s" : ""}
                        </Badge>
                      )}
                      {strike.description && (
                        <span className="text-muted-foreground truncate max-w-[200px]">{strike.description}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDate(strike.incident_date)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
