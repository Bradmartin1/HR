import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelative } from "@/lib/utils/format";

export default async function RecognitionPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: events } = await supabase
    .from("recognition_events")
    .select(`
      id, message, points, created_at,
      recipient:recipient_id(first_name, last_name),
      giver:users!recognition_events_giver_id_fkey(full_name),
      category:recognition_categories(name, icon)
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <PageHeader title="Recognition" description="Company-wide recognition feed" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Recognition</CardTitle>
        </CardHeader>
        <CardContent>
          {(events ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No recognition events yet.</p>
          ) : (
            <div className="space-y-4">
              {(events ?? []).map((event) => {
                const recipient = event.recipient as { first_name: string; last_name: string } | null;
                const giver = event.giver as { full_name: string | null } | null;
                const category = event.category as { name: string; icon: string | null } | null;
                return (
                  <div key={event.id} className="rounded-lg border bg-card p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {category?.icon} {recipient?.first_name} {recipient?.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatRelative(event.created_at)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {category?.name} · Given by {giver?.full_name ?? "Unknown"} · {event.points} pt{event.points !== 1 ? "s" : ""}
                    </p>
                    {event.message && <p className="text-sm mt-1">{event.message}</p>}
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
