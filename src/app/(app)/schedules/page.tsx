import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

export default async function SchedulesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!hasPermission(session.role, "schedules.manage") && !session.employeeId) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  let query = supabase
    .from("schedules")
    .select(`
      id, scheduled_date, start_time, end_time, status, notes,
      employee:employees(id, first_name, last_name, departments(name)),
      shift_template:shift_template_id(name),
      location:location_id(name)
    `)
    .gte("scheduled_date", today)
    .lte("scheduled_date", nextWeek)
    .order("scheduled_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (!hasPermission(session.role, "schedules.manage") && session.employeeId) {
    query = query.eq("employee_id", session.employeeId);
  }

  const { data: schedules } = await query;

  const STATUS_COLORS: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-600",
    swapped: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Schedules" description={`Upcoming schedules — ${formatDate(today)} to ${formatDate(nextWeek)}`} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          {(schedules ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No schedules found for this period.</p>
          ) : (
            <div className="divide-y">
              {(schedules ?? []).map((s) => {
                const emp = s.employee as { id: string; first_name: string; last_name: string; departments: { name: string } | null } | null;
                const shift = s.shift_template as { name: string } | null;
                const loc = s.location as { name: string } | null;
                return (
                  <div key={s.id} className="flex items-start justify-between py-3 gap-2">
                    <div>
                      {hasPermission(session.role, "schedules.manage") && emp && (
                        <Link href={`/employees/${emp.id}/schedule`} className="text-sm font-medium hover:underline">
                          {emp.first_name} {emp.last_name}
                        </Link>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDate(s.scheduled_date)} · {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}
                        {shift?.name && ` · ${shift.name}`}
                        {loc?.name && ` · ${loc.name}`}
                        {(emp?.departments as { name: string } | null)?.name && ` · ${(emp?.departments as { name: string }).name}`}
                      </p>
                    </div>
                    <Badge className={STATUS_COLORS[s.status] ?? ""}>{s.status}</Badge>
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
