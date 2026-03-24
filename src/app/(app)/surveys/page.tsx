import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-800",
  closed: "bg-blue-100 text-blue-800",
};

export default async function SurveysPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!hasPermission(session.role, "surveys.manage")) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const { data: surveys } = await supabase
    .from("surveys")
    .select(`id, title, description, target_audience, is_anonymous, status, opens_at, closes_at, created_at`)
    .order("created_at", { ascending: false });

  const { data: responseCounts } = await supabase
    .from("survey_responses")
    .select("survey_id");

  const countMap: Record<string, number> = {};
  for (const r of responseCounts ?? []) {
    countMap[r.survey_id] = (countMap[r.survey_id] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Surveys" description={`${(surveys ?? []).length} surveys`} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Surveys</CardTitle>
        </CardHeader>
        <CardContent>
          {(surveys ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No surveys created yet.</p>
          ) : (
            <div className="divide-y">
              {(surveys ?? []).map((survey) => (
                <div key={survey.id} className="flex items-start justify-between py-3 gap-2">
                  <div>
                    <p className="text-sm font-medium">{survey.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {survey.target_audience} · {survey.is_anonymous ? "Anonymous" : "Named"}
                      {survey.closes_at ? ` · Closes ${formatDate(survey.closes_at)}` : ""}
                      {` · ${countMap[survey.id] ?? 0} responses`}
                    </p>
                  </div>
                  <Badge className={STATUS_COLORS[survey.status] ?? ""}>{survey.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
