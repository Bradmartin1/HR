import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-yellow-100 text-yellow-800",
  2: "bg-orange-100 text-orange-800",
  3: "bg-red-100 text-red-800",
  4: "bg-red-200 text-red-900",
};

export default async function StrikesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!hasPermission(session.role, "strikes.issue") && !hasPermission(session.role, "strikes.view_team")) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const { data: strikes } = await supabase
    .from("strike_events")
    .select(`
      id, incident_date, description, level, voided, created_at,
      employee:employees(id, first_name, last_name, departments(name)),
      category:strike_categories(name)
    `)
    .eq("voided", false)
    .order("incident_date", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <PageHeader title="Strikes" description="Active strike events across all employees" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Strikes</CardTitle>
        </CardHeader>
        <CardContent>
          {(strikes ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No active strikes on record.</p>
          ) : (
            <div className="divide-y">
              {(strikes ?? []).map((strike) => {
                const emp = strike.employee as { id: string; first_name: string; last_name: string; departments: { name: string } | null } | null;
                const cat = strike.category as { name: string } | null;
                return (
                  <div key={strike.id} className="flex items-start justify-between py-3 gap-2">
                    <div>
                      <Link href={`/employees/${emp?.id}/strikes`} className="text-sm font-medium hover:underline">
                        {emp?.first_name} {emp?.last_name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {cat?.name} · {(emp?.departments as { name: string } | null)?.name ?? "—"} · {formatDate(strike.incident_date)}
                      </p>
                      {strike.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{strike.description}</p>}
                    </div>
                    <Badge className={LEVEL_COLORS[strike.level] ?? ""}>Level {strike.level}</Badge>
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
