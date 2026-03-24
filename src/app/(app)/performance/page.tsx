import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-500",
};

export default async function PerformancePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!hasPermission(session.role, "performance.manage_cycles") && !hasPermission(session.role, "performance.conduct_reviews")) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const { data: cycles } = await supabase
    .from("performance_review_cycles")
    .select(`id, name, cycle_type, start_date, end_date, status, departments(name)`)
    .order("start_date", { ascending: false });

  const cycleIds = (cycles ?? []).map((c) => c.id);
  const { data: reviews } = cycleIds.length > 0
    ? await supabase
        .from("performance_reviews")
        .select("cycle_id, status")
        .in("cycle_id", cycleIds)
    : { data: [] };

  const reviewCount: Record<string, number> = {};
  for (const r of reviews ?? []) {
    reviewCount[r.cycle_id] = (reviewCount[r.cycle_id] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Performance" description="Review cycles and evaluations" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review Cycles</CardTitle>
        </CardHeader>
        <CardContent>
          {(cycles ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No review cycles created yet.</p>
          ) : (
            <div className="divide-y">
              {(cycles ?? []).map((cycle) => (
                <div key={cycle.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{cycle.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {cycle.cycle_type.replace(/_/g, " ")} · {formatDate(cycle.start_date)} – {formatDate(cycle.end_date)}
                      {(cycle.departments as { name: string } | null)?.name && ` · ${(cycle.departments as { name: string }).name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{reviewCount[cycle.id] ?? 0} reviews</span>
                    <Badge className={STATUS_COLORS[cycle.status] ?? ""}>{cycle.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
