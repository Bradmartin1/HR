import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Users, Trophy } from "lucide-react";
import { formatRelative } from "@/lib/utils/format";

export default async function RecognitionPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: events } = await supabase
    .from("recognition_events")
    .select(`
      id, message, points, created_at,
      recipient:employees!recognition_events_recipient_id_fkey(first_name, last_name, departments(name)),
      giver:users!recognition_events_giver_id_fkey(full_name),
      category:recognition_categories(name, icon)
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);

  const eventList = events ?? [];
  const totalPoints = eventList.reduce((sum, e) => sum + (e.points ?? 0), 0);
  const uniqueRecipients = new Set(eventList.map(e => {
    const r = e.recipient as unknown as { first_name: string; last_name: string } | null;
    return r ? `${r.first_name} ${r.last_name}` : null;
  }).filter(Boolean)).size;
  const uniqueCategories = new Set(eventList.map(e => {
    const c = e.category as unknown as { name: string } | null;
    return c?.name;
  }).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recognition"
        description="Celebrating our team's achievements and contributions"
      />

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="stat-card-gold">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Awards</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{eventList.length}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(255,194,14,0.1)" }}>
                <Award className="h-4 w-4" style={{ color: "#d4a000" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-accent">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Points Given</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{totalPoints}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(45,189,182,0.1)" }}>
                <Star className="h-4 w-4" style={{ color: "#2DBDB6" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-teal">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Recipients</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{uniqueRecipients}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(0,115,132,0.08)" }}>
                <Users className="h-4 w-4" style={{ color: "#007384" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Categories</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{uniqueCategories}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(0,0,0,0.04)" }}>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!events || events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Award className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold">No recognition events yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Recognition given to employees will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const recipient = event.recipient as unknown as { first_name: string; last_name: string; departments: { name: string } | null } | null;
            const giver = event.giver as unknown as { full_name: string } | null;
            const category = event.category as unknown as { name: string; icon: string } | null;
            return (
              <Card key={event.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl" style={{ backgroundColor: "hsl(45 100% 53% / 0.15)" }}>
                      {category?.icon ?? "⭐"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {recipient ? `${recipient.first_name} ${recipient.last_name}` : "Employee"}
                        </span>
                        {recipient?.departments && (
                          <Badge variant="outline" className="text-[10px]">{(recipient.departments as unknown as { name: string }).name}</Badge>
                        )}
                        {category && (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: "hsl(188 100% 26% / 0.1)", color: "hsl(188 100% 20%)", border: "1px solid hsl(188 100% 26% / 0.2)" }}>
                            {category.name}
                          </span>
                        )}
                      </div>
                      {event.message && (
                        <p className="mt-1 text-sm text-muted-foreground italic">&ldquo;{event.message}&rdquo;</p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>by {giver?.full_name ?? "Someone"}</span>
                        <span>·</span>
                        <span>{formatRelative(event.created_at)}</span>
                        {event.points > 0 && (
                          <>
                            <span>·</span>
                            <span className="font-medium" style={{ color: "hsl(45 100% 35%)" }}>+{event.points} pts</span>
                          </>
                        )}
                      </div>
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
