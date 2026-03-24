import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRelative } from "@/lib/utils/format";

interface Giver {
  id: string;
  full_name: string | null;
}

interface RecognitionEvent {
  id: string;
  category_id: string | null;
  message: string | null;
  points: number | null;
  created_at: string;
  giver?: Giver | null;
}

interface RecognitionTabProps {
  recognitions: RecognitionEvent[];
}

const CATEGORY_COLORS: Record<string, string> = {
  teamwork: "bg-blue-100 text-blue-800",
  innovation: "bg-purple-100 text-purple-800",
  leadership: "bg-amber-100 text-amber-800",
  customer_service: "bg-green-100 text-green-800",
  above_and_beyond: "bg-pink-100 text-pink-800",
  safety: "bg-orange-100 text-orange-800",
  attendance: "bg-teal-100 text-teal-800",
  peer_recognition: "bg-indigo-100 text-indigo-800",
};

export function RecognitionTab({ recognitions }: RecognitionTabProps) {
  const totalPoints = recognitions.reduce((sum, r) => sum + (r.points ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Recognitions
            </p>
            <p className="mt-1 text-3xl font-bold">{recognitions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Points Earned
            </p>
            <p className="mt-1 text-3xl font-bold">{totalPoints.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Most Recent
            </p>
            <p className="mt-1 text-sm font-medium">
              {recognitions[0] ? formatRelative(recognitions[0].created_at) : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recognition Feed</CardTitle>
        </CardHeader>
        <CardContent>
          {recognitions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recognitions yet.</p>
          ) : (
            <div className="space-y-4">
              {recognitions.map((event) => {
                const giver = event.giver as Giver | null;
                const giverName = giver?.full_name ?? "Anonymous";

                return (
                  <div
                    key={event.id}
                    className="flex gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-lg">⭐</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {event.category_id && (
                            <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                              Recognition
                            </span>
                          )}
                          {event.points != null && event.points > 0 && (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
                              +{event.points} pts
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(event.created_at)}
                        </span>
                      </div>
                      {event.message && (
                        <p className="mt-1.5 text-sm leading-relaxed">{event.message}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        From: <span className="font-medium text-foreground">{giverName}</span>
                      </p>
                    </div>
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
