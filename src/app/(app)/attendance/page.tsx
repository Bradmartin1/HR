import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

const TYPE_COLORS: Record<string, string> = {
  present: "bg-green-100 text-green-800",
  absent: "bg-red-100 text-red-800",
  tardy: "bg-yellow-100 text-yellow-800",
  early_leave: "bg-orange-100 text-orange-800",
  no_call_no_show: "bg-red-200 text-red-900",
  excused: "bg-blue-100 text-blue-800",
};

export default async function AttendancePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!hasPermission(session.role, "attendance.enter")) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data: events } = await supabase
    .from("attendance_events")
    .select(`
      id, event_date, event_type, minutes_late, hours_missed, notes,
      employee:employees(id, first_name, last_name, departments(name))
    `)
    .neq("event_type", "present")
    .gte("event_date", thirtyDaysAgo)
    .order("event_date", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Non-present events in the last 30 days" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {(events ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No attendance issues in the last 30 days.</p>
          ) : (
            <div className="divide-y">
              {(events ?? []).map((evt) => {
                const emp = evt.employee as { id: string; first_name: string; last_name: string; departments: { name: string } | null } | null;
                return (
                  <div key={evt.id} className="flex items-start justify-between py-3 gap-2">
                    <div>
                      <Link href={`/employees/${emp?.id}/attendance`} className="text-sm font-medium hover:underline">
                        {emp?.first_name} {emp?.last_name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(evt.event_date)} · {(emp?.departments as { name: string } | null)?.name ?? "—"}
                        {evt.minutes_late ? ` · ${evt.minutes_late}m late` : ""}
                        {evt.hours_missed ? ` · ${evt.hours_missed}h missed` : ""}
                      </p>
                      {evt.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{evt.notes}</p>}
                    </div>
                    <Badge className={TYPE_COLORS[evt.event_type] ?? ""}>{evt.event_type.replace(/_/g, " ")}</Badge>
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
