import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function MyTasksPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!session.employeeId) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Tasks" description="Your onboarding tasks" />
        <p className="text-sm text-muted-foreground">No employee profile linked to your account.</p>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: progress } = await supabase
    .from("employee_onboarding_progress")
    .select(`*, onboarding_tasks(id, title, description, task_type, is_required, due_days_from_hire)`)
    .eq("employee_id", session.employeeId)
    .order("created_at", { ascending: true });

  const tasks = progress ?? [];
  const completed = tasks.filter((t) => t.status === "completed" || t.status === "waived").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks"
        description={`${completed} of ${tasks.length} tasks completed`}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Onboarding Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No onboarding tasks assigned.</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((item) => {
                const task = item.onboarding_tasks as { title: string; description: string | null; is_required: boolean; due_days_from_hire: number } | null;
                return (
                  <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task?.title ?? "Unknown task"}</p>
                      {task?.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                      {task?.due_days_from_hire != null && (
                        <p className="text-xs text-muted-foreground mt-0.5">Due: Day {task.due_days_from_hire}</p>
                      )}
                    </div>
                    <Badge
                      className={
                        item.status === "completed" ? "bg-green-100 text-green-800 hover:bg-green-100" :
                        item.status === "waived" ? "bg-gray-100 text-gray-600 hover:bg-gray-100" :
                        item.status === "in_progress" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" :
                        "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      }
                    >
                      {item.status.replace("_", " ")}
                    </Badge>
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
