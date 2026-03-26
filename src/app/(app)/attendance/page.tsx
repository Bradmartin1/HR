import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

const EVENT_TYPE_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  absent:        { label: "Absent",        bg: "hsl(0 80% 92%)",    text: "hsl(0 80% 30%)",   border: "hsl(0 80% 55%)" },
  tardy:         { label: "Tardy",         bg: "hsl(49 100% 94%)",  text: "hsl(45 100% 30%)", border: "hsl(45 100% 53%)" },
  left_early:    { label: "Left Early",    bg: "hsl(38 100% 92%)",  text: "hsl(30 90% 30%)",  border: "hsl(30 90% 55%)" },
  ncns:          { label: "No Call/Show",  bg: "hsl(0 80% 90%)",    text: "hsl(0 80% 25%)",   border: "hsl(0 80% 45%)" },
  excused:       { label: "Excused",       bg: "hsl(220 15% 93%)",  text: "hsl(220 15% 40%)", border: "hsl(220 15% 60%)" },
  fmla:          { label: "FMLA",          bg: "hsl(188 100% 26% / 0.1)", text: "hsl(188 100% 20%)", border: "hsl(188 100% 26% / 0.3)" },
};

export default async function AttendancePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, "attendance.enter")) redirect("/dashboard");

  const supabase = await createClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data: events } = await supabase
    .from("attendance_events")
    .select(`
      id, event_type, event_date, minutes_late, hours_missed, notes, created_at,
      employee:employees!attendance_events_employee_id_fkey(id, first_name, last_name, departments(name))
    `)
    .neq("event_type", "present")
    .gte("event_date", thirtyDaysAgo)
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Non-present attendance events from the last 30 days"
      />

      {!events || events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <UserCheck className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold">No attendance issues</h3>
            <p className="text-sm text-muted-foreground mt-1">Non-present attendance events in the last 30 days will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {events.map((event) => {
            const emp = event.employee as unknown as { id: string; first_name: string; last_name: string; departments: { name: string } | null } | null;
            const style = EVENT_TYPE_STYLES[event.event_type] ?? { label: event.event_type, bg: "hsl(0 0% 93%)", text: "hsl(0 0% 40%)", border: "hsl(0 0% 70%)" };

            return (
              <Card key={event.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span
                        className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold mt-0.5 whitespace-nowrap"
                        style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                      >
                        {style.label}
                      </span>
                      <div className="min-w-0">
                        {emp ? (
                          <Link href={`/employees/${emp.id}/attendance`} className="font-semibold text-foreground hover:underline">
                            {emp.first_name} {emp.last_name}
                          </Link>
                        ) : (
                          <span className="font-semibold text-foreground">Unknown Employee</span>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {emp?.departments && (
                            <Badge variant="outline" className="text-[10px]">
                              {(emp.departments as unknown as { name: string }).name}
                            </Badge>
                          )}
                          {event.minutes_late != null && event.minutes_late > 0 && (
                            <span className="text-xs text-muted-foreground">{event.minutes_late} min late</span>
                          )}
                          {event.hours_missed != null && event.hours_missed > 0 && (
                            <span className="text-xs text-muted-foreground">{event.hours_missed}h missed</span>
                          )}
                        </div>
                        {event.notes && (
                          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{event.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground shrink-0">
                      <div className="font-medium">{formatDate(event.event_date)}</div>
                    </div>
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
