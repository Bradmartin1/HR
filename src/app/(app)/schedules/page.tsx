import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";

export default async function SchedulesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  let query = supabase
    .from("schedules")
    .select(`
      id, scheduled_date, start_time, end_time, status, notes,
      employee:employees!schedules_employee_id_fkey(id, first_name, last_name, departments(name)),
      locations(name)
    `)
    .gte("scheduled_date", today)
    .lte("scheduled_date", twoWeeks)
    .order("scheduled_date")
    .order("start_time")
    .limit(100);

  if (session.role === "employee" && session.employeeId) {
    query = query.eq("employee_id", session.employeeId);
  }

  const { data: schedules } = await query;

  // Group by date
  const grouped: Record<string, typeof schedules> = {};
  for (const s of schedules ?? []) {
    if (!grouped[s.scheduled_date]) grouped[s.scheduled_date] = [];
    grouped[s.scheduled_date]!.push(s);
  }

  const dates = Object.keys(grouped).sort();
  const allSchedules = schedules ?? [];
  const totalShifts = allSchedules.length;
  const uniqueEmpIds = new Set(allSchedules.map(s => {
    const emp = s.employee as unknown as { id: string } | null;
    return emp?.id;
  }).filter(Boolean)).size;
  const uniqueLocations = new Set(allSchedules.map(s => {
    const loc = s.locations as unknown as { name: string } | null;
    return loc?.name;
  }).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedules"
        description="Upcoming shifts for the next 2 weeks"
      />

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="stat-card-teal">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Shifts</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{totalShifts}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(0,115,132,0.08)" }}>
                <CalendarDays className="h-4 w-4" style={{ color: "#007384" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-accent">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Employees</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{uniqueEmpIds}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(45,189,182,0.1)" }}>
                <Users className="h-4 w-4" style={{ color: "#2DBDB6" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-gold">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Locations</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{uniqueLocations}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(255,194,14,0.1)" }}>
                <MapPin className="h-4 w-4" style={{ color: "#d4a000" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {dates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold">No upcoming schedules</h3>
            <p className="text-sm text-muted-foreground mt-1">Shifts scheduled for the next 2 weeks will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {dates.map((date) => {
            const daySchedules = grouped[date] ?? [];
            const dateObj = new Date(date + "T00:00:00");
            const isToday = date === today;

            return (
              <div key={date}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </span>
                    {isToday && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: "hsl(188 100% 26%)" }}>
                        Today
                      </span>
                    )}
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">{daySchedules.length} shift{daySchedules.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-2">
                  {daySchedules.map((s) => {
                    const emp = s.employee as unknown as { id: string; first_name: string; last_name: string; departments: { name: string } | null } | null;
                    const loc = s.locations as unknown as { name: string } | null;

                    return (
                      <Card key={s.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="text-center shrink-0 w-16">
                                <div className="text-sm font-semibold" style={{ color: "hsl(188 100% 26%)" }}>
                                  {s.start_time?.slice(0, 5)}
                                </div>
                                <div className="text-xs text-muted-foreground">{s.end_time?.slice(0, 5)}</div>
                              </div>
                              <div>
                                {emp && (
                                  <Link href={`/employees/${emp.id}/schedule`} className="text-sm font-medium text-foreground hover:underline">
                                    {emp.first_name} {emp.last_name}
                                  </Link>
                                )}
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                  {emp?.departments && <span>{(emp.departments as unknown as { name: string }).name}</span>}
                                  {loc && <><span>·</span><span>{loc.name}</span></>}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="capitalize text-[10px]">{s.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
