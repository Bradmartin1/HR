import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Calendar, Users, Lock, CheckCircle2, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  draft:  { bg: "hsl(0 0% 93%)",       text: "hsl(0 0% 40%)" },
  active: { bg: "hsl(140 60% 92%)",    text: "hsl(140 60% 28%)" },
  closed: { bg: "hsl(220 15% 93%)",    text: "hsl(220 15% 40%)" },
};

export default async function SurveysPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, "surveys.manage")) redirect("/dashboard");

  const supabase = await createClient();

  const { data: surveys } = await supabase
    .from("surveys")
    .select(`id, title, description, status, is_anonymous, target_audience, opens_at, closes_at, created_at, departments(name), survey_responses(id)`)
    .order("created_at", { ascending: false });

  const surveyList = surveys ?? [];
  const activeSurveys = surveyList.filter(s => s.status === "active").length;
  const closedSurveys = surveyList.filter(s => s.status === "closed").length;
  const totalResponses = surveyList.reduce((sum, s) => sum + (Array.isArray(s.survey_responses) ? s.survey_responses.length : 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Surveys"
        description="Gather employee feedback and measure engagement"
      />

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="stat-card-teal">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Surveys</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{surveyList.length}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(0,115,132,0.08)" }}>
                <ClipboardList className="h-4 w-4" style={{ color: "#007384" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-accent">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{activeSurveys}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(45,189,182,0.1)" }}>
                <CheckCircle2 className="h-4 w-4" style={{ color: "#2DBDB6" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-gold">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Responses</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{totalResponses}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(255,194,14,0.1)" }}>
                <MessageSquare className="h-4 w-4" style={{ color: "#d4a000" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Closed</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{closedSurveys}</p>
              </div>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "rgba(0,0,0,0.04)" }}>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!surveys || surveys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold">No surveys yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create a survey to start gathering employee feedback.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {surveys.map((survey) => {
            const responses = Array.isArray(survey.survey_responses) ? survey.survey_responses.length : 0;
            const dept = survey.departments as unknown as { name: string } | null;
            const st = STATUS_STYLES[survey.status] ?? STATUS_STYLES.draft;
            return (
              <Card key={survey.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{survey.title}</h3>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize" style={{ backgroundColor: st.bg, color: st.text }}>
                          {survey.status}
                        </span>
                        {survey.is_anonymous && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: "hsl(220 15% 93%)", color: "hsl(220 15% 40%)" }}>
                            <Lock className="h-2.5 w-2.5" /> Anonymous
                          </span>
                        )}
                      </div>
                      {survey.description && <p className="text-sm text-muted-foreground">{survey.description}</p>}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {survey.closes_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Closes {formatDate(survey.closes_at)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{responses} response{responses !== 1 ? "s" : ""}</span>
                        </div>
                        {dept && <span>{dept.name}</span>}
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize text-xs shrink-0">{survey.target_audience}</Badge>
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
