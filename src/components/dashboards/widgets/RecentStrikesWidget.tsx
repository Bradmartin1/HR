"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { subDays } from "date-fns";

export function RecentStrikesWidget({ departmentId }: { departmentId?: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const since = subDays(new Date(), 30).toISOString().split("T")[0];
      let query = supabase
        .from("strike_events")
        .select("id", { count: "exact" })
        .eq("voided", false)
        .gte("incident_date", since);

      if (departmentId) {
        const { data: empIds } = await supabase.from("employees").select("id").eq("department_id", departmentId);
        if (empIds) query = query.in("employee_id", empIds.map((e) => e.id));
      }

      const { count: c } = await query;
      setCount(c ?? 0);
    };
    load();
  }, [departmentId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Strikes (30 days)</CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count ?? "—"}</div>
        <p className="text-xs text-muted-foreground mt-1">Active, non-voided</p>
      </CardContent>
    </Card>
  );
}
