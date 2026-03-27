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
  teamwork: "bg-[#e0f4f3] text-[#007384]",
  innovation: "bg-[#fff4cc] text-[#7a5e00]",
  leadership: "bg-[#e6f7f6] text-[#005f6d]",
  customer_service: "bg-[#e0f4f3] text-[#007384]",
  above_and_beyond: "bg-[#fff4cc] text-[#7a5e00]",
  safety: "bg-[#fde8e1] text-[#a33a14]",
  attendance: "bg-[#e6f7f6] text-[#005f6d]",
  peer_recognition: "bg-[#e0f4f3] text-[#007384]",
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
                            <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-[#e6f7f6] text-[#005f6d]">
                              Recognition
                            </span>
                          )}
                          {event.points != null && event.points > 0 && (
                            <Badge className="bg-[#fff4cc] text-[#7a5e00] hover:bg-[#fff4cc] text-xs">
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
