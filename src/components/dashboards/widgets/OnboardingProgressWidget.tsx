"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";

export function OnboardingProgressWidget() {
  const [data, setData] = useState<{ total: number; complete: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: rows } = await supabase
        .from("employee_onboarding_progress")
        .select("status");

      if (!rows) return;
      setData({
        total: rows.length,
        complete: rows.filter((r) => r.status === "completed").length,
      });
    };
    load();
  }, []);

  const pct = data && data.total > 0 ? Math.round((data.complete / data.total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Onboarding Progress</CardTitle>
        <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold">{pct}%</div>
        <Progress value={pct} className="h-1.5" />
        {data && (
          <p className="text-xs text-muted-foreground">
            {data.complete} / {data.total} tasks complete
          </p>
        )}
      </CardContent>
    </Card>
  );
}
