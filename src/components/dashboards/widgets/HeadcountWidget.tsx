"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface HeadcountData {
  total: number;
  active: number;
  onboarding: number;
  onLeave: number;
}

export function HeadcountWidget({ departmentId }: { departmentId?: string }) {
  const [data, setData] = useState<HeadcountData | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      let query = supabase.from("employees").select("status", { count: "exact" }).is("deleted_at", null);
      if (departmentId) query = query.eq("department_id", departmentId);

      const { data: rows } = await query;
      if (!rows) return;

      setData({
        total: rows.length,
        active: rows.filter((r) => r.status === "active").length,
        onboarding: rows.filter((r) => r.status === "inactive").length,
        onLeave: rows.filter((r) => r.status === "on_leave").length,
      });
    };
    load();
  }, [departmentId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Total Headcount</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data?.total ?? "—"}</div>
        {data && (
          <p className="text-xs text-muted-foreground mt-1">
            {data.active} active · {data.onLeave} on leave
          </p>
        )}
      </CardContent>
    </Card>
  );
}
