import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Bell, Building2 } from "lucide-react";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "hsl(188 100% 26% / 0.1)" }}>
                <User className="h-4 w-4" style={{ color: "hsl(188 100% 26%)" }} />
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
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "hsl(16 88% 54% / 0.1)" }}>
                <Shield className="h-4 w-4" style={{ color: "hsl(16 88% 54%)" }} />
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
              <span className="text-muted-foreground">Active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "hsl(45 100% 53% / 0.1)" }}>
                <Bell className="h-4 w-4" style={{ color: "hsl(45 100% 38%)" }} />
              </div>
              <CardTitle className="text-sm font-semibold">Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Notification preferences will be configurable in a future update.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-1.5" style={{ backgroundColor: "hsl(177 61% 46% / 0.1)" }}>
                <Building2 className="h-4 w-4" style={{ color: "hsl(177 61% 36%)" }} />
              </div>
              <CardTitle className="text-sm font-semibold">Organization</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm border-b pb-3">
              <span className="text-muted-foreground">Company</span>
              <span className="font-medium">Rushtown Poultry</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium">Rushtown, TN</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
