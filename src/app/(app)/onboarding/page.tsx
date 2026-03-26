import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck } from "lucide-react";
import Link from "next/link";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, "onboarding.manage_templates")) redirect("/dashboard");

  const supabase = await createClient();

  // Get employees with onboarding in progress
  const { data: employees } = await supabase
    .from("employees")
    .select(`
      id, first_name, last_name, hire_date, status,
      departments(name),
      employee_onboarding_progress(id, status)
    `)
    .eq("status", "active")
    .order("hire_date", { ascending: false })
    .limit(50);

  const withOnboarding = (employees ?? []).filter(e => Array.isArray(e.employee_onboarding_progress) && e.employee_onboarding_progress.length > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding"
        description="Track new hire onboarding progress"
      />

      {withOnboarding.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold">No active onboarding</h3>
            <p className="text-sm text-muted-foreground mt-1">Employees with onboarding tasks will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {withOnboarding.map((emp) => {
            const tasks = Array.isArray(emp.employee_onboarding_progress) ? emp.employee_onboarding_progress : [];
            const completed = tasks.filter((t: { status: string }) => t.status === "completed").length;
            const total = tasks.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const dept = emp.departments as unknown as { name: string } | null;

            return (
              <Card key={emp.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/employees/${emp.id}/onboarding`} className="font-semibold text-foreground hover:underline">
                          {emp.first_name} {emp.last_name}
                        </Link>
                        {dept && <Badge variant="outline" className="text-[10px]">{dept.name}</Badge>}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{completed} of {total} tasks completed</span>
                          <span className="font-medium" style={{ color: pct === 100 ? "hsl(140 60% 35%)" : "hsl(188 100% 26%)" }}>{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground shrink-0">
                      {emp.hire_date && <div>Hired {new Date(emp.hire_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>}
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
