import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  User, Shield, Bell, Building2, MapPin, Users, Briefcase, AlertTriangle,
} from "lucide-react";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isAdmin = hasPermission(session.role, "admin.app_config");
  const supabase = await createClient();

  // Fetch admin data if authorized
  let locations: { id: string; name: string; address: string | null }[] = [];
  let departments: { id: string; name: string; code: string; default_shift_hours: number | null; locations: { name: string } | null }[] = [];
  let jobTitles: { id: string; title: string; department_id: string | null; departments: { name: string } | null }[] = [];
  let userCount = 0;
  let strikeCategories: { id: string; name: string; code: string }[] = [];

  if (isAdmin) {
    const [locRes, deptRes, titleRes, userRes, catRes] = await Promise.all([
      supabase.from("locations").select("id, name, address").order("name"),
      supabase.from("departments").select("id, name, code, default_shift_hours, locations(name)").order("name"),
      supabase.from("job_titles").select("id, title, department_id, departments(name)").order("title"),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("strike_categories").select("id, name, code").order("name"),
    ]);
    locations = (locRes.data ?? []) as typeof locations;
    departments = (deptRes.data ?? []) as typeof departments;
    jobTitles = (titleRes.data ?? []) as typeof jobTitles;
    userCount = userRes.count ?? 0;
    strikeCategories = (catRes.data ?? []) as typeof strikeCategories;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description={isAdmin ? "Manage your account and organization settings" : "Manage your account preferences"}
      />

      {/* Profile & Security */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-1.5 bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold">My Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm border-b pb-3">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{session.fullName ?? "—"}</span>
            </div>
            <div className="flex justify-between text-sm border-b pb-3">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{session.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium capitalize">{session.role.replace(/_/g, " ")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-1.5 bg-destructive/10">
                <Shield className="h-4 w-4 text-destructive" />
              </div>
              <CardTitle className="text-sm font-semibold">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm border-b pb-3">
              <span className="text-muted-foreground">Password</span>
              <span className="text-muted-foreground">••••••••</span>
            </div>
            <div className="flex justify-between text-sm border-b pb-3">
              <span className="text-muted-foreground">Two-Factor Auth</span>
              <span className="text-muted-foreground">Not configured</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Session</span>
              <Badge className="bg-[#e6f7f6] text-[#005f6d] hover:bg-[#e6f7f6] text-[10px]">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin-only sections */}
      {isAdmin && (
        <>
          {/* Organization Overview */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Card className="stat-card-teal">
              <CardContent className="pt-5 pb-4 px-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Locations</p>
                <p className="mt-1 text-2xl font-bold text-[#007384]">{locations.length}</p>
              </CardContent>
            </Card>
            <Card className="stat-card-accent">
              <CardContent className="pt-5 pb-4 px-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Departments</p>
                <p className="mt-1 text-2xl font-bold text-[#2DBDB6]">{departments.length}</p>
              </CardContent>
            </Card>
            <Card className="stat-card-gold">
              <CardContent className="pt-5 pb-4 px-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Job Titles</p>
                <p className="mt-1 text-2xl font-bold text-[#FFC20E]">{jobTitles.length}</p>
              </CardContent>
            </Card>
            <Card className="stat-card-orange">
              <CardContent className="pt-5 pb-4 px-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Users</p>
                <p className="mt-1 text-2xl font-bold text-[#F15A22]">{userCount}</p>
              </CardContent>
            </Card>
          </div>

          {/* Locations */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg p-1.5 bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-sm font-semibold">Locations &amp; Complexes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {locations.length === 0 ? (
                <p className="text-sm text-muted-foreground p-6">No locations configured.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-[11px] uppercase tracking-wide">Name</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wide">Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((loc) => (
                      <TableRow key={loc.id}>
                        <TableCell className="text-sm font-medium">{loc.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{loc.address ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Departments */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg p-1.5 bg-[#2DBDB6]/10">
                  <Building2 className="h-4 w-4 text-[#2DBDB6]" />
                </div>
                <CardTitle className="text-sm font-semibold">Departments</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {departments.length === 0 ? (
                <p className="text-sm text-muted-foreground p-6">No departments configured.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-[11px] uppercase tracking-wide">Department</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wide">Code</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wide">Location</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wide">Default Shift</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((dept) => {
                      const loc = dept.locations as { name: string } | null;
                      return (
                        <TableRow key={dept.id}>
                          <TableCell className="text-sm font-medium">{dept.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] font-mono">{dept.code}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{loc?.name ?? "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {dept.default_shift_hours ? `${dept.default_shift_hours}h` : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Job Titles */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg p-1.5 bg-[#FFC20E]/10">
                  <Briefcase className="h-4 w-4 text-[#FFC20E]" />
                </div>
                <CardTitle className="text-sm font-semibold">Job Titles</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {jobTitles.length === 0 ? (
                <p className="text-sm text-muted-foreground p-6">No job titles configured.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-[11px] uppercase tracking-wide">Title</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wide">Department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobTitles.map((title) => {
                      const dept = title.departments as { name: string } | null;
                      return (
                        <TableRow key={title.id}>
                          <TableCell className="text-sm font-medium">{title.title}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{dept?.name ?? "Any"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Strike Categories */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg p-1.5 bg-destructive/10">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <CardTitle className="text-sm font-semibold">Violation Categories</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {strikeCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground p-6">No violation categories configured.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-[11px] uppercase tracking-wide">Category</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wide">Code</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {strikeCategories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell className="text-sm font-medium">{cat.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-mono">{cat.code}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Notifications & Users */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg p-1.5 bg-[#FFC20E]/10">
                    <Bell className="h-4 w-4 text-[#FFC20E]" />
                  </div>
                  <CardTitle className="text-sm font-semibold">Notifications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Notification preferences and email digest settings will be configurable in a future update.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg p-1.5 bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-semibold">User Accounts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {userCount} registered user{userCount !== 1 ? "s" : ""}. User management is handled through Supabase Auth Dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
