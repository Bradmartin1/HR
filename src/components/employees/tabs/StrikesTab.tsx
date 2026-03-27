import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import {
  STRIKE_LEVEL_COLORS,
  STRIKE_LEVELS,
  DISCIPLINARY_ACTION_LABELS,
  type DisciplinaryActionType,
} from "@/lib/constants/strike-levels";

interface StrikeEvent {
  id: string;
  level: number | null;
  incident_date: string;
  description: string;
  voided: boolean;
  voided_reason: string | null;
  points: number | null;
  is_weekend: boolean;
  notes: string | null;
  created_at: string;
  strike_categories?: { name: string } | null;
}

interface DisciplinaryAction {
  id: string;
  action_type: string;
  effective_date: string;
  end_date: string | null;
  details: string | null;
  strike_event_id: string | null;
}

interface StrikesTabProps {
  strikes: StrikeEvent[];
  disciplinaryActions: DisciplinaryAction[];
}

const POINT_THRESHOLDS = [
  { points: 4, label: "Verbal Warning", color: "#FFC20E" },
  { points: 5, label: "Written Warning", color: "#F15A22" },
  { points: 6, label: "3-Day Suspension", color: "#a33a14" },
  { points: 7, label: "Termination", color: "#130C0E" },
];

function PointProgressBar({ points }: { points: number }) {
  const maxPoints = 7;
  const pct = Math.min((points / maxPoints) * 100, 100);

  const barColor =
    points >= 7 ? "#130C0E" :
    points >= 6 ? "#a33a14" :
    points >= 5 ? "#F15A22" :
    points >= 4 ? "#FFC20E" :
    "#2DBDB6";

  return (
    <div className="space-y-2">
      <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
        {/* Threshold markers */}
        {POINT_THRESHOLDS.map((t) => (
          <div
            key={t.points}
            className="absolute top-0 bottom-0 w-px bg-foreground/20"
            style={{ left: `${(t.points / maxPoints) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0</span>
        {POINT_THRESHOLDS.map((t) => (
          <span key={t.points} className="text-center" style={{ position: "relative" }}>
            {t.points}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {POINT_THRESHOLDS.map((t) => (
          <span
            key={t.points}
            className={`inline-flex items-center gap-1 text-[10px] ${points >= t.points ? "font-semibold" : "text-muted-foreground"}`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color, opacity: points >= t.points ? 1 : 0.3 }} />
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StrikesTab({ strikes, disciplinaryActions }: StrikesTabProps) {
  const activeStrikes = strikes.filter((s) => !s.voided);
  const voidedStrikes = strikes.filter((s) => s.voided);

  // Calculate active points (within last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const activePoints = activeStrikes
    .filter((s) => new Date(s.incident_date) >= sixMonthsAgo)
    .reduce((sum, s) => sum + (s.points ?? 0), 0);

  const totalPoints = activeStrikes.reduce((sum, s) => sum + (s.points ?? 0), 0);
  const hasPointSystem = activeStrikes.some((s) => s.points != null);

  // Build a lookup of disciplinary actions by strike_event_id
  const actionsByStrike = disciplinaryActions.reduce<Record<string, DisciplinaryAction[]>>(
    (acc, action) => {
      if (action.strike_event_id) {
        if (!acc[action.strike_event_id]) acc[action.strike_event_id] = [];
        acc[action.strike_event_id].push(action);
      }
      return acc;
    },
    {}
  );

  const unlinkedActions = disciplinaryActions.filter((a) => !a.strike_event_id);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className={`grid grid-cols-1 gap-4 ${hasPointSystem ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
        {hasPointSystem && (
          <Card className="stat-card-orange">
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Active Points
              </p>
              <p className="mt-1 text-3xl font-bold text-[#F15A22]">{activePoints}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Last 6 months</p>
            </CardContent>
          </Card>
        )}
        <Card className={hasPointSystem ? "" : "stat-card-orange"}>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Active Strikes
            </p>
            <p className={`mt-1 text-3xl font-bold ${hasPointSystem ? "" : "text-[#F15A22]"}`}>{activeStrikes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Incidents
            </p>
            <p className="mt-1 text-3xl font-bold">{strikes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Voided
            </p>
            <p className="mt-1 text-3xl font-bold text-muted-foreground">{voidedStrikes.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Point progress bar */}
      {hasPointSystem && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Disciplinary Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <PointProgressBar points={activePoints} />
          </CardContent>
        </Card>
      )}

      {/* Strike History Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Strike History</CardTitle>
        </CardHeader>
        <CardContent>
          {strikes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No strike events on record.</p>
          ) : (
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-6 pl-10">
                {strikes.map((strike) => {
                  const level = strike.level as keyof typeof STRIKE_LEVELS | null;
                  const levelLabel = level ? STRIKE_LEVELS[level] : null;
                  const levelColor = level ? STRIKE_LEVEL_COLORS[level] : "bg-[#f0efee] text-[#5c5b59]";
                  const linkedActions = strike.id ? (actionsByStrike[strike.id] ?? []) : [];

                  // Determine dot color based on points or level
                  const dotColor = strike.voided
                    ? "bg-[#8E9089]"
                    : strike.points != null && strike.points >= 2
                      ? "bg-[#F15A22]"
                      : level && level >= 3
                        ? "bg-[#F15A22]"
                        : "bg-[#FFC20E]";

                  return (
                    <div key={strike.id} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-10 top-1.5 w-4 h-4 rounded-full border-2 border-background ${dotColor}`} />
                      <div
                        className={`rounded-lg border p-4 ${
                          strike.voided ? "opacity-60 bg-muted/30" : "bg-card"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Points badge */}
                            {strike.points != null && (
                              <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold bg-[#fde8e1] text-[#F15A22]">
                                {strike.points} pt{strike.points !== 1 ? "s" : ""}
                              </span>
                            )}
                            {level && (
                              <span
                                className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${levelColor}`}
                              >
                                Level {level}{levelLabel ? ` – ${levelLabel}` : ""}
                              </span>
                            )}
                            {(strike.strike_categories as { name: string } | null)?.name && (
                              <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-[#f0efee] text-[#5c5b59]">
                                {(strike.strike_categories as { name: string } | null)?.name?.replace(/_/g, " ")}
                              </span>
                            )}
                            {strike.is_weekend && (
                              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium bg-[#fff4cc] text-[#7a5e00]">
                                Weekend
                              </span>
                            )}
                            {strike.voided && (
                              <Badge className="bg-[#f0efee] text-[#5c5b59] hover:bg-[#f0efee] text-xs">
                                Voided
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(strike.incident_date)}
                          </span>
                        </div>
                        {strike.description && (
                          <p className="mt-2 text-sm leading-relaxed">{strike.description}</p>
                        )}
                        {strike.notes && !strike.voided && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Note: {strike.notes}
                          </p>
                        )}
                        {strike.voided && strike.voided_reason && (
                          <p className="mt-1.5 text-xs text-muted-foreground italic">
                            Void reason: {strike.voided_reason}
                          </p>
                        )}
                        {linkedActions.length > 0 && (
                          <div className="mt-3 pt-3 border-t space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Disciplinary Actions
                            </p>
                            {linkedActions.map((action) => (
                              <div
                                key={action.id}
                                className="flex items-start justify-between gap-2 text-sm"
                              >
                                <span className="font-medium">
                                  {DISCIPLINARY_ACTION_LABELS[action.action_type as DisciplinaryActionType] ??
                                    action.action_type.replace(/_/g, " ")}
                                </span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDate(action.effective_date)}
                                  {action.end_date && ` – ${formatDate(action.end_date)}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {unlinkedActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Other Disciplinary Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unlinkedActions.map((action) => (
              <div
                key={action.id}
                className="flex items-start justify-between gap-2 p-3 rounded-lg border bg-card"
              >
                <div>
                  <p className="text-sm font-medium">
                    {DISCIPLINARY_ACTION_LABELS[action.action_type as DisciplinaryActionType] ??
                      action.action_type.replace(/_/g, " ")}
                  </p>
                  {action.details && (
                    <p className="text-xs text-muted-foreground mt-0.5">{action.details}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(action.effective_date)}
                  {action.end_date && ` – ${formatDate(action.end_date)}`}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
