"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeadcountWidget } from "./widgets/HeadcountWidget";

interface DeptCount {
  name: string;
  count: number;
}

export function ExecutiveDashboard() {
  const [deptData, setDeptData] = useState<DeptCount[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: depts } = await supabase.from("departments").select("id, name");
      if (!depts) return;

      const counts = await Promise.all(
        depts.map(async (dept) => {
          const { count } = await supabase
            .from("employees")
            .select("id", { count: "exact" })
            .eq("department_id", dept.id)
            .eq("status", "active");
          return { name: dept.name, count: count ?? 0 };
        })
      );
      setDeptData(counts);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <HeadcountWidget />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Headcount by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
