import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
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

  const pendingCount = (requests ?? []).filter(r => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="PTO Management"
        description={session.role === "employee" ? "Your time off requests" : `${pendingCount} pending approval`}
      />

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
                        <Link href={`/employees/${emp.id}/pto`} className="font-semibold text-foreground hover:underline">
                          {emp.first_name} {emp.last_name}
                        </Link>
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
