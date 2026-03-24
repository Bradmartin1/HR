import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export default async function DepartmentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!hasPermission(session.role, "departments.manage")) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const { data: departments } = await supabase
    .from("departments")
    .select(`id, name, code, default_shift_hours, is_active, locations(name)`)
    .order("name");

  const { data: employees } = await supabase
    .from("employees")
    .select("id, department_id")
    .eq("status", "active")
    .is("deleted_at", null);

  const { data: managers } = await supabase
    .from("department_managers")
    .select(`department_id, users(full_name)`)
    .eq("is_primary", true);

  const empCount: Record<string, number> = {};
  for (const e of employees ?? []) {
    if (e.department_id) empCount[e.department_id] = (empCount[e.department_id] ?? 0) + 1;
  }

  const managerMap: Record<string, string> = {};
  for (const m of managers ?? []) {
    managerMap[m.department_id] = (m.users as { full_name: string | null } | null)?.full_name ?? "—";
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Departments" description={`${(departments ?? []).length} departments`} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(departments ?? []).map((dept) => (
          <Card key={dept.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">{dept.name}</CardTitle>
                </div>
                <Badge variant="secondary">{dept.code}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Location</span>
                <span className="text-foreground">{(dept.locations as { name: string } | null)?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Manager</span>
                <span className="text-foreground">{managerMap[dept.id] ?? "—"}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Employees</span>
                <span className="text-foreground">{empCount[dept.id] ?? 0}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Default Shift</span>
                <span className="text-foreground">{dept.default_shift_hours}h</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
