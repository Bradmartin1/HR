import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

const LEVEL_STYLES: Record<number, { label: string; bg: string; text: string; border: string }> = {
  1: { label: "Level 1", bg: "hsl(49 100% 94%)", text: "hsl(45 100% 30%)", border: "hsl(45 100% 53%)" },
  2: { label: "Level 2", bg: "hsl(38 100% 92%)", text: "hsl(30 90% 30%)", border: "hsl(30 90% 55%)" },
  3: { label: "Level 3", bg: "hsl(16 88% 93%)", text: "hsl(16 88% 35%)", border: "hsl(16 88% 54%)" },
  4: { label: "Level 4", bg: "hsl(0 80% 92%)",  text: "hsl(0 80% 30%)",  border: "hsl(0 80% 55%)" },
};

export default async function StrikesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, "strikes.issue")) redirect("/dashboard");

  const supabase = await createClient();

  const { data: strikes } = await supabase
    .from("strike_events")
    .select(`
      id, level, incident_date, description, voided, created_at,
      employee:employees!strike_events_employee_id_fkey(id, first_name, last_name, departments(name)),
      strike_categories(name),
      issuer:users!strike_events_issued_by_fkey(full_name)
    `)
    .eq("voided", false)
    .order("incident_date", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Strikes & Discipline"
        description="Active disciplinary events across all departments"
      />

      {!strikes || strikes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold">No active strikes</h3>
            <p className="text-sm text-muted-foreground mt-1">Active disciplinary events will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {strikes.map((strike) => {
            const emp = strike.employee as unknown as { id: string; first_name: string; last_name: string; departments: { name: string } | null } | null;
            const cat = strike.strike_categories as unknown as { name: string } | null;
            const issuer = strike.issuer as unknown as { full_name: string } | null;
            const lvl = LEVEL_STYLES[strike.level] ?? LEVEL_STYLES[1];

            return (
              <Card key={strike.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span
                        className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold mt-0.5"
                        style={{ backgroundColor: lvl.bg, color: lvl.text, border: `1px solid ${lvl.border}` }}
                      >
                        L{strike.level}
                      </span>
                      <div className="min-w-0">
                        {emp ? (
                          <Link href={`/employees/${emp.id}/strikes`} className="font-semibold text-foreground hover:underline">
                            {emp.first_name} {emp.last_name}
                          </Link>
                        ) : (
                          <span className="font-semibold text-foreground">Unknown</span>
                        )}
                        <div className="flex flex-wrap gap-2 mt-1">
                          {emp?.departments && (
                            <Badge variant="outline" className="text-[10px]">{(emp.departments as unknown as { name: string }).name}</Badge>
                          )}
                          {cat && (
                            <span className="text-xs text-muted-foreground">{cat.name}</span>
                          )}
                        </div>
                        {strike.description && (
                          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{strike.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground shrink-0">
                      <div className="font-medium">{formatDate(strike.incident_date)}</div>
                      {issuer && <div className="mt-0.5">by {issuer.full_name}</div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
