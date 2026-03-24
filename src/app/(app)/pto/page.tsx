import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { hasPermission } from "@/lib/auth/permissions";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  denied: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
};

export default async function PtoPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = await createClient();
  const canApprove = hasPermission(session.role, "pto.approve");

  let query = supabase
    .from("pto_requests")
    .select(`
      id, pto_type, start_date, end_date, hours_requested, status, notes, created_at,
      employee:employees(id, first_name, last_name, departments(name))
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!canApprove && session.employeeId) {
    query = query.eq("employee_id", session.employeeId);
  } else if (canApprove) {
    query = query.eq("status", "pending");
  }

  const { data: requests } = await query;

  return (
    <div className="space-y-6">
      <PageHeader
        title="PTO"
        description={canApprove ? "Pending PTO requests" : "Your PTO requests"}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{canApprove ? "Pending Requests" : "My Requests"}</CardTitle>
        </CardHeader>
        <CardContent>
          {(requests ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No PTO requests found.</p>
          ) : (
            <div className="divide-y">
              {(requests ?? []).map((req) => {
                const emp = req.employee as { id: string; first_name: string; last_name: string; departments: { name: string } | null } | null;
                return (
                  <div key={req.id} className="flex items-start justify-between py-3 gap-2">
                    <div>
                      {canApprove && emp && (
                        <Link href={`/employees/${emp.id}/pto`} className="text-sm font-medium hover:underline">
                          {emp.first_name} {emp.last_name}
                        </Link>
                      )}
                      <p className="text-xs text-muted-foreground capitalize">
                        {req.pto_type} · {formatDate(req.start_date)} – {formatDate(req.end_date)} · {req.hours_requested}h
                        {canApprove && emp && ` · ${(emp.departments as { name: string } | null)?.name ?? "—"}`}
                      </p>
                      {req.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{req.notes}</p>}
                    </div>
                    <Badge className={STATUS_COLORS[req.status] ?? ""}>{req.status}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
