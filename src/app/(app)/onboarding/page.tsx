import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hasPermission } from "@/lib/auth/permissions";
import Link from "next/link";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!hasPermission(session.role, "onboarding.manage_templates")) {
    redirect("/onboarding/my-tasks");
  }

  const supabase = await createClient();

  const { data: employees } = await supabase
    .from("employees")
    .select(`id, first_name, last_name, hire_date, departments(name), job_titles(title)`)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("hire_date", { ascending: false })
    .limit(50);

  const employeeIds = (employees ?? []).map((e) => e.id);

  const { data: progress } = employeeIds.length > 0
    ? await supabase
        .from("employee_onboarding_progress")
        .select("employee_id, status")
        .in("employee_id", employeeIds)
    : { data: [] };

  const progressMap: Record<string, { total: number; completed: number }> = {};
  for (const p of progress ?? []) {
    if (!progressMap[p.employee_id]) progressMap[p.employee_id] = { total: 0, completed: 0 };
    progressMap[p.employee_id].total++;
    if (p.status === "completed" || p.status === "waived") progressMap[p.employee_id].completed++;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Onboarding" description="Track new hire onboarding progress" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Employees</CardTitle>
        </CardHeader>
        <CardContent>
          {(employees ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No employees found.</p>
          ) : (
            <div className="divide-y">
              {(employees ?? []).map((emp) => {
                const p = progressMap[emp.id];
                const pct = p && p.total > 0 ? Math.round((p.completed / p.total) * 100) : null;
                return (
                  <div key={emp.id} className="flex items-center justify-between py-3">
                    <div>
                      <Link href={`/employees/${emp.id}/onboarding`} className="text-sm font-medium hover:underline">
                        {emp.first_name} {emp.last_name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {(emp.departments as { name: string } | null)?.name ?? "—"} · Hired {emp.hire_date}
                      </p>
                    </div>
                    <div>
                      {pct === null ? (
                        <Badge variant="secondary">No tasks</Badge>
                      ) : pct === 100 ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Complete</Badge>
                      ) : (
                        <Badge variant="secondary">{pct}% done</Badge>
                      )}
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
