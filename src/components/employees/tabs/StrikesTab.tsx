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
  category: string | null;
  level: number | null;
  incident_date: string;
  description: string | null;
  is_voided: boolean | null;
  voided_reason: string | null;
  created_at: string;
}

interface DisciplinaryAction {
  id: string;
  action_type: string;
  effective_date: string;
  end_date: string | null;
  notes: string | null;
  strike_event_id: string | null;
}

interface StrikesTabProps {
  strikes: StrikeEvent[];
  disciplinaryActions: DisciplinaryAction[];
}

export function StrikesTab({ strikes, disciplinaryActions }: StrikesTabProps) {
  const activeStrikes = strikes.filter((s) => !s.is_voided);
  const voidedStrikes = strikes.filter((s) => s.is_voided);

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Active Strikes
            </p>
            <p className="mt-1 text-3xl font-bold text-red-600">{activeStrikes.length}</p>
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
                  const levelColor = level ? STRIKE_LEVEL_COLORS[level] : "bg-gray-100 text-gray-800";
                  const linkedActions = strike.id ? (actionsByStrike[strike.id] ?? []) : [];

                  return (
                    <div key={strike.id} className="relative">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-10 top-1.5 w-4 h-4 rounded-full border-2 border-background ${
                          strike.is_voided ? "bg-gray-300" : level && level >= 3 ? "bg-red-500" : "bg-amber-400"
                        }`}
                      />
                      <div
                        className={`rounded-lg border p-4 ${
                          strike.is_voided ? "opacity-60 bg-muted/30" : "bg-card"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            {level && (
                              <span
                                className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${levelColor}`}
                              >
                                Level {level}{levelLabel ? ` – ${levelLabel}` : ""}
                              </span>
                            )}
                            {strike.category && (
                              <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                                {strike.category.replace(/_/g, " ")}
                              </span>
                            )}
                            {strike.is_voided && (
                              <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 text-xs">
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
                        {strike.is_voided && strike.voided_reason && (
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
                  {action.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{action.notes}</p>
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
