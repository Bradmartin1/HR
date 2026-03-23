import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";

interface Schedule {
  id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: string | null;
  notes: string | null;
  shift_template: { name: string } | null;
  location: { name: string } | null;
}

interface ScheduleTabProps {
  schedules: Schedule[];
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  swapped: "bg-purple-100 text-purple-800",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  swapped: "Swapped",
};

function formatTime(time: string): string {
  if (!time) return "—";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  return `${display}:${m} ${ampm}`;
}

export function ScheduleTab({ schedules }: ScheduleTabProps) {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = schedules.filter(
    (s) => s.scheduled_date >= today && s.status !== "cancelled"
  );
  const past = schedules.filter(
    (s) => s.scheduled_date < today || s.status === "cancelled"
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Upcoming
            </p>
            <p className="mt-1 text-3xl font-bold text-blue-600">{upcoming.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Completed
            </p>
            <p className="mt-1 text-3xl font-bold text-green-600">
              {schedules.filter((s) => s.status === "completed").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Cancelled
            </p>
            <p className="mt-1 text-3xl font-bold text-muted-foreground">
              {schedules.filter((s) => s.status === "cancelled").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total
            </p>
            <p className="mt-1 text-3xl font-bold">{schedules.length}</p>
          </CardContent>
        </Card>
      </div>

      {upcoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {upcoming.map((s) => (
                <ScheduleRow key={s.id} schedule={s} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schedule History</CardTitle>
        </CardHeader>
        <CardContent>
          {past.length === 0 ? (
            <p className="text-sm text-muted-foreground">No past shifts on record.</p>
          ) : (
            <div className="divide-y">
              {past.map((s) => (
                <ScheduleRow key={s.id} schedule={s} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ScheduleRow({ schedule: s }: { schedule: Schedule }) {
  const status = s.status ?? "scheduled";
  const color = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">
            {formatTime(s.start_time)} – {formatTime(s.end_time)}
          </span>
          {s.shift_template && (
            <span className="text-xs text-muted-foreground">{s.shift_template.name}</span>
          )}
        </div>
        {s.location && (
          <p className="text-xs text-muted-foreground">{s.location.name}</p>
        )}
        {s.notes && (
          <p className="text-xs text-muted-foreground italic">{s.notes}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs text-muted-foreground">{formatDate(s.scheduled_date)}</span>
        <Badge className={`${color} hover:${color} text-xs`}>{label}</Badge>
      </div>
    </div>
  );
}
