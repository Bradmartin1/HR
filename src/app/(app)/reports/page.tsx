import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBarChart, Users, AlertTriangle, Calendar, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

const REPORTS = [
  { title: "Employee Roster", description: "Full employee list with department, role, and status", href: "/employees", icon: Users },
  { title: "Attendance Summary", description: "Absences, tardies, and no-call/no-shows by department", href: "/attendance", icon: Clock },
  { title: "Strike Report", description: "Active and historical disciplinary events", href: "/strikes", icon: AlertTriangle },
  { title: "PTO Balances", description: "Accrued, used, and remaining PTO by employee", href: "/pto", icon: Calendar },
  { title: "Performance Reviews", description: "Review cycle status and completion rates", href: "/performance", icon: TrendingUp },
];

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!hasPermission(session.role, "reports.full") && !hasPermission(session.role, "reports.scoped")) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="View and export HR reports" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          return (
            <Link key={report.href} href={report.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">{report.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
