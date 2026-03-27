import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";

interface AttendanceEvent {
  id: string;
  event_date: string;
  event_type: string;
  minutes_late: number | null;
  hours_missed: number | null;
  notes: string | null;
  created_at: string;
}

interface AttendanceTabProps {
  events: AttendanceEvent[];
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  present: "Present",
  absent: "Absent",
  tardy: "Tardy",
  early_leave: "Early Leave",
  no_call_no_show: "No Call / No Show",
  excused: "Excused",
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  present: "bg-[#e0f4f3] text-[#007384]",
  absent: "bg-[#fde8e1] text-[#a33a14]",
  tardy: "bg-[#fff4cc] text-[#7a5e00]",
  early_leave: "bg-[#fff4cc] text-[#7a5e00]",
  no_call_no_show: "bg-[#fde8e1] text-[#F15A22]",
  excused: "bg-[#e6f7f6] text-[#005f6d]",
};

export function AttendanceTab({ events }: AttendanceTabProps) {
  const totalDays = events.length;
  const presentDays = events.filter((e) => e.event_type === "present").length;
  const absentDays = events.filter((e) =>
    ["absent", "no_call_no_show"].includes(e.event_type)
  ).length;
  const tardyDays = events.filter((e) => e.event_type === "tardy").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Records
            </p>
            <p className="mt-1 text-3xl font-bold">{totalDays}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Present
            </p>
            <p className="mt-1 text-3xl font-bold text-[#007384]">{presentDays}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Absent
            </p>
            <p className="mt-1 text-3xl font-bold text-[#F15A22]">{absentDays}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tardy
            </p>
            <p className="mt-1 text-3xl font-bold text-[#FFC20E]">{tardyDays}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Log</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attendance records on file.</p>
          ) : (
            <div className="divide-y">
              {events.map((event) => {
                const color =
                  EVENT_TYPE_COLORS[event.event_type] ?? "bg-gray-100 text-gray-800";
                const label =
                  EVENT_TYPE_LABELS[event.event_type] ??
                  event.event_type.replace(/_/g, " ");

                return (
                  <div
                    key={event.id}
                    className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Badge className={`${color} hover:${color} shrink-0 mt-0.5`}>
                        {label}
                      </Badge>
                      <div className="min-w-0">
                        {event.minutes_late != null && event.minutes_late > 0 && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Late by </span>
                            {event.minutes_late} min
                          </p>
                        )}
                        {event.hours_missed != null && event.hours_missed > 0 && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Hours missed: </span>
                            {Number(event.hours_missed).toFixed(1)}h
                          </p>
                        )}
                        {event.notes && (
                          <p className="text-sm text-muted-foreground truncate">
                            {event.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {formatDate(event.event_date)}
                    </span>
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
