import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, CheckCircle2 } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending:     { bg: "hsl(0 0% 93%)",       text: "hsl(0 0% 40%)",    label: "Pending" },
  in_progress: { bg: "hsl(45 100% 93%)",    text: "hsl(45 100% 30%)", label: "In Progress" },
  completed:   { bg: "hsl(140 60% 92%)",    text: "hsl(140 60% 28%)", label: "Done" },
  waived:      { bg: "hsl(220 15% 93%)",    text: "hsl(220 15% 40%)", label: "Waived" },
};

export default async function MyTasksPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!session.employeeId) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Tasks" description="Your onboarding checklist" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold">No employee profile found</h3>
            <p className="text-sm text-muted-foreground mt-1">Contact HR to set up your employee profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("employee_onboarding_progress")
    .select(`
      id, status, notes,
      onboarding_tasks(title, description, task_type, due_days_from_hire, is_required)
    `)
    .eq("employee_id", session.employeeId)
    .order("created_at");

  const allTasks = tasks ?? [];
  const completed = allTasks.filter(t => t.status === "completed" || t.status === "waived").length;
  const pct = allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks"
        description="Complete your onboarding checklist"
      />

      {allTasks.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium text-foreground">Overall Progress</span>
              <span className="font-semibold" style={{ color: "hsl(188 100% 26%)" }}>{pct}% complete</span>
            </div>
            <Progress value={pct} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">{completed} of {allTasks.length} tasks completed</p>
          </CardContent>
        </Card>
      )}

      {allTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold">No tasks assigned</h3>
            <p className="text-sm text-muted-foreground mt-1">Your onboarding tasks will appear here once assigned.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {allTasks.map((task) => {
            const t = task.onboarding_tasks as unknown as { title: string; description: string | null; task_type: string; due_days_from_hire: number | null; is_required: boolean } | null;
            const st = STATUS_STYLES[task.status] ?? STATUS_STYLES.pending;
            const isDone = task.status === "completed" || task.status === "waived";

            return (
              <Card key={task.id} className="hover:shadow-sm transition-shadow" style={isDone ? { opacity: 0.7 } : {}}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                      style={{
                        borderColor: isDone ? "hsl(140 60% 38%)" : "hsl(188 100% 26%)",
                        backgroundColor: isDone ? "hsl(140 60% 38%)" : "transparent",
                      }}
                    >
                      {isDone && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {t?.title ?? "Task"}
                        </span>
                        {t?.is_required && (
                          <span className="text-[10px] font-medium" style={{ color: "hsl(16 88% 44%)" }}>Required</span>
                        )}
                        <span
                          className="ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: st.bg, color: st.text }}
                        >
                          {st.label}
                        </span>
                      </div>
                      {t?.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                      )}
                      {t?.due_days_from_hire != null && (
                        <p className="mt-1 text-xs text-muted-foreground">Due {t.due_days_from_hire} days from hire</p>
                      )}
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
