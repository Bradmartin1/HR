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
import { PointsBadge } from "@/components/strikes/PointsBadge";
import { IssuePointDialog } from "@/components/strikes/IssuePointDialog";
import { PolicyReferenceDialog } from "@/components/strikes/PolicyReferenceDialog";

export default async function StrikesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, "strikes.issue")) redirect("/dashboard");

  const supabase = await createClient();

  const { data: strikes } = await supabase
    .from("strike_events")
    .select(`
      id, incident_date, description, voided, created_at, points, is_weekend, notes, level,
      employee:employees!strike_events_employee_id_fkey(id, first_name, last_name, departments(name)),
      strike_categories(name, code),
      issuer:users!strike_events_issued_by_fkey(full_name)
    `)
    .eq("voided", false)
    .order("incident_date", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Points & Discipline"
        description="Attendance and performance point tracking"
        action={
          <div className="flex items-center gap-2">
            <PolicyReferenceDialog />
            <IssuePointDialog />
          </div>
        }
      />

      {!strikes || strikes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold">No active points</h3>
            <p className="text-sm text-muted-foreground mt-1">Attendance and performance points will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {strikes.map((strike) => {
            const emp = strike.employee as unknown as { id: string; first_name: string; last_name: string; departments: { name: string } | null } | null;
            const cat = strike.strike_categories as unknown as { name: string; code: string } | null;
            const issuer = strike.issuer as unknown as { full_name: string } | null;

            return (
              <Card key={strike.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <PointsBadge points={strike.points} className="mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        {emp ? (
                          <Link href={`/employees/${emp.id}/strikes`} className="font-semibold text-foreground hover:underline">
                            {emp.first_name} {emp.last_name}
                          </Link>
                        ) : (
                          <span className="font-semibold text-foreground">Unknown</span>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          {emp?.departments && (
                            <Badge variant="outline" className="text-[10px]">{(emp.departments as unknown as { name: string }).name}</Badge>
                          )}
                          {cat && (
                            <span className="text-xs text-muted-foreground">{cat.name}</span>
                          )}
                          {strike.is_weekend && (
                            <span className="text-[10px] rounded-full px-1.5 py-0.5 font-medium" style={{ backgroundColor: "hsl(45 100% 93%)", color: "hsl(45 100% 30%)" }}>Weekend</span>
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
