"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export function OpenReviewsWidget() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { count: c } = await supabase
        .from("performance_reviews")
        .select("id", { count: "exact" })
        .in("status", ["pending", "in_progress"]);
      setCount(c ?? 0);
    };
    load();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Open Reviews</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count ?? "—"}</div>
        <p className="text-xs text-muted-foreground mt-1">Pending submission</p>
      </CardContent>
    </Card>
  );
}
