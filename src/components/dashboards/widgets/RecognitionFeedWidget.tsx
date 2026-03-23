"use client";

import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { formatRelative } from "@/lib/utils/format";

interface RecognitionRow {
  id: string;
  message: string | null;
  created_at: string;
  employees: { first_name: string; last_name: string } | null;
  recognition_categories: { name: string } | null;
}

export function RecognitionFeedWidget() {
  const [items, setItems] = useState<RecognitionRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("recognition_events")
        .select("id, message, created_at, employees(first_name, last_name), recognition_categories(name)")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setItems(data as unknown as RecognitionRow[]);
    };
    load();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Recent Recognition</CardTitle>
        <Award className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">No recent recognition.</p>}
        {items.map((item) => (
          <div key={item.id} className="text-sm">
            <span className="font-medium">
              {item.employees?.first_name} {item.employees?.last_name}
            </span>
            {" — "}
            <span className="text-muted-foreground">{item.recognition_categories?.name}</span>
            <div className="text-xs text-muted-foreground">{formatRelative(item.created_at)}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
