import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, MapPin, User, ChevronRight } from "lucide-react";

export default async function DepartmentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, "departments.manage")) redirect("/dashboard");

  const supabase = await createClient();

  const { data: departments } = await supabase
    .from("departments")
    .select(`
      id, name, code, default_shift_hours,
      locations(name),
      employees(id, status),
      department_managers(user_id, is_primary, users(full_name))
    `)
    .order("name");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage your organization's departments and locations"
      />

      {!departments || departments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold text-foreground">No departments found</h3>
            <p className="text-sm text-muted-foreground mt-1">Departments will appear here once configured.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => {
            const employees = Array.isArray(dept.employees) ? dept.employees : [];
            const activeCount = employees.filter((e: { status: string }) => e.status === "active").length;
            const totalCount = employees.length;
            const location = dept.locations as unknown as { name: string } | null;
            const managers = Array.isArray(dept.department_managers) ? dept.department_managers : [];
            const primaryMgr = managers.find((m: { is_primary: boolean }) => m.is_primary) ?? managers[0];
            const mgrUser = primaryMgr ? (primaryMgr as unknown as { users: { full_name: string } }).users : null;

            return (
              <Link key={dept.id} href={`/departments/${dept.id}`}>
                <Card className="hover:shadow-md transition-all duration-150 cursor-pointer group h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base group-hover:text-primary transition-colors">{dept.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-[10px] font-mono">{dept.code}</Badge>
                      </div>
                      <div className="rounded-lg p-2 bg-primary/10 group-hover:bg-primary/15 transition-colors">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 shrink-0" />
                      <span><span className="font-semibold text-foreground">{activeCount}</span> active · {totalCount} total</span>
                    </div>
                    {location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>{location.name}</span>
                      </div>
                    )}
                    {mgrUser && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4 shrink-0" />
                        <span>{mgrUser.full_name}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t flex items-center justify-between">
                      {dept.default_shift_hours ? (
                        <span className="text-xs text-muted-foreground">Default shift: {dept.default_shift_hours}h</span>
                      ) : (
                        <span />
                      )}
                      <span className="text-xs text-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        View details <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
