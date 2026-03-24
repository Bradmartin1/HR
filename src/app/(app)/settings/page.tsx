import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission } from "@/lib/auth/permissions";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const canAdmin = hasPermission(session.role, "admin.app_config");

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Application configuration" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{session.fullName ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{session.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="capitalize">{session.role.replace(/_/g, " ")}</span>
            </div>
          </CardContent>
        </Card>
        {canAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Administration</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Advanced configuration settings coming soon. Manage roles, permissions, and system defaults here.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
