import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Users, CheckCircle2, Hourglass, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  draft:     { label: "Draft",     bg: "hsl(0 0% 94%)",          text: "hsl(0 0% 40%)" },
  active:    { label: "Active",    bg: "hsl(140 60% 92%)",       text: "hsl(140 60% 28%)" },
  completed: { label: "Completed", bg: "hsl(188 100% 26% / 0.1)", text: "hsl(188 100% 26%)" },
  archived:  { label: "Archived",  bg: "hsl(0 0% 94%)",          text: "hsl(0 0% 50%)" },
};

export default async function PerformancePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, "performance.manage_cycles")) redirect("/dashboard");

  const supabase = await createClient();

  const { data: cycles } = await supabase
    .from("performance_review_cycles")
    .select(`
      id, name, cycle_type, start_date, end_date, status,
      departments(name),
      performance_reviews(id, status)
    `)
    .order("created_at", { ascending: false });

  const cycleList = cycles ?? [];
  const activeCycles = cycleList.filter(c => c.status === "active").length;
  const allReviews = cycleList.flatMap(c => Array.isArray(c.performance_reviews) ? c.performance_reviews : []);
  const pendingReviews = allReviews.filter((r: { status: string }) => r.status === "pending").length;
  const completedReviews = allReviews.filter((r: { status: string }) => ["submitted", "acknowledged", "finalized"].includes(r.status)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Reviews"
        description="Manage review cycles and track employee performance"
      />

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="stat-card-teal">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active Cycles</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{activeCycles}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(0,115,132,0.08)" }}>
                <TrendingUp className="h-4 w-4" style={{ color: "#007384" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-gold">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pending Reviews</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{pendingReviews}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(255,194,14,0.1)" }}>
                <Hourglass className="h-4 w-4" style={{ color: "#d4a000" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-accent">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Completed</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{completedReviews}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(45,189,182,0.1)" }}>
                <CheckCircle2 className="h-4 w-4" style={{ color: "#2DBDB6" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Reviews</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{allReviews.length}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(0,0,0,0.04)" }}>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!cycles || cycles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold">No review cycles yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create a review cycle to start performance reviews.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cycles.map((cycle) => {
            const reviews = Array.isArray(cycle.performance_reviews) ? cycle.performance_reviews : [];
            const pending = reviews.filter((r: { status: string }) => r.status === "pending").length;
            const completed = reviews.filter((r: { status: string }) => ["submitted","acknowledged","finalized"].includes(r.status)).length;
            const st = STATUS_STYLES[cycle.status] ?? STATUS_STYLES.draft;
            const dept = cycle.departments as unknown as { name: string } | null;

            return (
              <Card key={cycle.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{cycle.name}</h3>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: st.bg, color: st.text }}>
                          {st.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(cycle.start_date)} → {formatDate(cycle.end_date)}</span>
                        </div>
                        {dept && (
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            <span>{dept.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span className="text-muted-foreground">{reviews.length} total</span>
                        <span style={{ color: "hsl(45 100% 35%)" }}>{pending} pending</span>
                        <span style={{ color: "hsl(140 60% 35%)" }}>{completed} completed</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0 capitalize text-xs">
                      {cycle.cycle_type.replace(/_/g, " ")}
                    </Badge>
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
