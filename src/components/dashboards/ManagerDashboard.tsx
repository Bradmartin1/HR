"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { HeadcountWidget } from "./widgets/HeadcountWidget";
import { PtoRequestsWidget } from "./widgets/PtoRequestsWidget";
import { RecentStrikesWidget } from "./widgets/RecentStrikesWidget";
import { RecognitionFeedWidget } from "./widgets/RecognitionFeedWidget";

export function ManagerDashboard() {
  const [deptIds, setDeptIds] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("department_managers")
        .select("department_id")
        .eq("user_id", user.id);

      if (data) setDeptIds(data.map((d) => d.department_id));
    };
    load();
  }, []);

  // Use first managed department for scoped widgets
  const primaryDeptId = deptIds[0];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <HeadcountWidget departmentId={primaryDeptId} />
      <PtoRequestsWidget departmentId={primaryDeptId} />
      <RecentStrikesWidget departmentId={primaryDeptId} />
      <RecognitionFeedWidget />
    </div>
  );
}
