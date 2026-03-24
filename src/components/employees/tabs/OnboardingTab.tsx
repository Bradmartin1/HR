"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils/format";
import { type Role } from "@/lib/constants/roles";

interface OnboardingTask {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  is_required: boolean | null;
  due_days_after_hire: number | null;
}

interface OnboardingProgress {
  id: string;
  status: string;
  completed_at: string | null;
  due_date: string | null;
  notes: string | null;
  onboarding_tasks?: OnboardingTask | null;
}

interface OnboardingTabProps {
  progress: OnboardingProgress[];
  employeeId: string;
  role: Role;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  pending: "bg-gray-100 text-gray-800",
  skipped: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  pending: "Pending",
  skipped: "Skipped",
  overdue: "Overdue",
};

export function OnboardingTab({ progress, employeeId, role }: OnboardingTabProps) {
  const [items, setItems] = useState(progress);
  const [savingId, setSavingId] = useState<string | null>(null);

  const canManage = ["owner", "hr_manager", "department_manager"].includes(role);

  const completed = items.filter((p) => p.status === "completed").length;
  const total = items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const categories = Array.from(
    new Set(
      items
        .map((p) => (p.onboarding_tasks as OnboardingTask | null)?.category)
        .filter(Boolean)
    )
  ) as string[];

  async function handleToggle(progressId: string, currentStatus: string) {
    if (!canManage) return;
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    setSavingId(progressId);
    try {
      const res = await fetch(`/api/onboarding/${progressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setItems((prev) =>
        prev.map((item) =>
          item.id === progressId
            ? {
                ...item,
                status: newStatus,
                completed_at: newStatus === "completed" ? new Date().toISOString() : null,
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);
      alert("Could not update task status.");
    } finally {
      setSavingId(null);
    }
  }

  const groupedByCategory =
    categories.length > 0
      ? categories.reduce<Record<string, OnboardingProgress[]>>((acc, cat) => {
          acc[cat] = items.filter(
            (p) => (p.onboarding_tasks as OnboardingTask | null)?.category === cat
          );
          return acc;
        }, {})
      : { "All Tasks": items };

  const uncategorized = items.filter(
    (p) => !(p.onboarding_tasks as OnboardingTask | null)?.category
  );
  if (uncategorized.length > 0 && categories.length > 0) {
    groupedByCategory["Other"] = uncategorized;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Onboarding Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completed} of {total} tasks completed
            </span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </CardContent>
      </Card>

      {total === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">No onboarding tasks found.</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedByCategory).map(([category, tasks]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-base capitalize">{category.replace(/_/g, " ")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((item) => {
                const task = item.onboarding_tasks as OnboardingTask | null;
                const isCompleted = item.status === "completed";
                const isOverdue =
                  item.due_date && new Date(item.due_date) < new Date() && !isCompleted;

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <Checkbox
                      checked={isCompleted}
                      disabled={!canManage || savingId === item.id}
                      onCheckedChange={() => handleToggle(item.id, item.status)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={`text-sm font-medium ${
                            isCompleted ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {task?.title ?? "Unknown Task"}
                        </p>
                        {task?.is_required && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
                            Required
                          </Badge>
                        )}
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                            isOverdue
                              ? "bg-red-100 text-red-800"
                              : STATUS_COLORS[item.status] ?? "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isOverdue ? "Overdue" : (STATUS_LABELS[item.status] ?? item.status)}
                        </span>
                      </div>
                      {task?.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                      )}
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        {item.due_date && (
                          <span>Due: {formatDate(item.due_date)}</span>
                        )}
                        {item.completed_at && (
                          <span>Completed: {formatDate(item.completed_at)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
