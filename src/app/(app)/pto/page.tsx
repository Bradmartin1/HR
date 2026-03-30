import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  pending:   { label: "Pending",   bg: "hsl(45 100% 94%)",         text: "hsl(45 100% 30%)" },
  approved:  { label: "Approved",  bg: "hsl(140 60% 92%)",         text: "hsl(140 60% 28%)" },
  denied:    { label: "Denied",    bg: "hsl(16 88% 93%)",          text: "hsl(16 88% 35%)" },
  cancelled: { label: "Cancelled", bg: "hsl(0 0% 93%)",            text: "hsl(0 0% 45%)" },
};

export default async function PtoPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = await createClient();

  // HR/Owner/Manager see all pending; employees see their own
  let query = supabase
    .from("pto_requests")
    .select(`
      id, pto_type, start_date, end_date, hours_requested, status, notes, created_at,
      employee:employees!pto_requests_employee_id_fkey(id, first_name, last_name, departments(name))
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (session.role === "employee" && session.employeeId) {
    query = query.eq("employee_id", session.employeeId);
  } else {
    query = query.eq("status", "pending");
  }

  const { data: requests } = await query;

  const requestList = requests ?? [];
  const pendingCount = requestList.filter(r => r.status === "pending").length;
  const approvedCount = requestList.filter(r => r.status === "approved").length;
  const deniedCount = requestList.filter(r => r.status === "denied").length;
  const totalHours = requestList.reduce((sum, r) => sum + (r.hours_requested ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="PTO Management"
        description={session.role === "employee" ? "Your time off requests" : `${pendingCount} pending approval`}
      />

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="stat-card-gold">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(255,194,14,0.1)" }}>
                <Hourglass className="h-4 w-4" style={{ color: "#d4a000" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-teal">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Approved</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{approvedCount}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(0,115,132,0.08)" }}>
                <CheckCircle2 className="h-4 w-4" style={{ color: "#007384" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-orange">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Denied</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{deniedCount}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(241,90,34,0.08)" }}>
                <XCircle className="h-4 w-4" style={{ color: "#F15A22" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-accent">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Hours</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{totalHours}h</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(45,189,182,0.1)" }}>
                <Clock className="h-4 w-4" style={{ color: "#2DBDB6" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!requests || requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold">
              {session.role === "employee" ? "No PTO requests" : "No pending requests"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {session.role === "employee" ? "Your time off requests will appear here." : "All PTO requests are up to date."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => {
            const emp = req.employee as unknown as { id: string; first_name: string; last_name: string; departments: { name: string } | null } | null;
            const st = STATUS_STYLES[req.status] ?? STATUS_STYLES.pending;

            return (
              <Card key={req.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      {emp && session.role !== "employee" && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/employees/${emp.id}/pto`} className="font-semibold text-foreground hover:underline">
                            {emp.first_name} {emp.last_name}
                          </Link>
                          {emp.departments && (
                            <Badge variant="outline" className="text-[10px]">{(emp.departments as unknown as { name: string }).name}</Badge>
                          )}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="capitalize font-medium text-foreground">{req.pto_type.replace(/_/g, " ")}</span>
                        <span className="text-muted-foreground">
                          {formatDate(req.start_date)} → {formatDate(req.end_date)}
                        </span>
                        <span className="text-muted-foreground">{req.hours_requested}h</span>
                      </div>
                      {req.notes && <p className="text-xs text-muted-foreground">{req.notes}</p>}
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-medium"
                      style={{ backgroundColor: st.bg, color: st.text }}
                    >
                      {st.label}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
