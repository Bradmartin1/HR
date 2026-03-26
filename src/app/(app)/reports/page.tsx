import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, AlertTriangle, TrendingUp, Download } from "lucide-react";
import Link from "next/link";

const REPORT_CATEGORIES = [
  {
    title: "Workforce",
    icon: Users,
    color: "hsl(188 100% 26%)",
    colorLight: "hsl(188 100% 26% / 0.1)",
    reports: [
      { label: "Headcount by Department", description: "Current employee counts and status breakdown", href: "/employees" },
      { label: "New Hires Report", description: "Employees hired in a date range", href: "/employees" },
      { label: "Terminations Report", description: "Employees separated in a date range", href: "/employees" },
    ],
  },
  {
    title: "Attendance & PTO",
    icon: Calendar,
    color: "hsl(45 100% 38%)",
    colorLight: "hsl(45 100% 38% / 0.1)",
    reports: [
      { label: "Attendance Summary", description: "Absences, tardies, and patterns by employee", href: "/attendance" },
      { label: "PTO Utilization", description: "PTO balances and usage by employee", href: "/pto" },
      { label: "No Call / No Show", description: "NCNS incidents in a date range", href: "/attendance" },
    ],
  },
  {
    title: "Discipline",
    icon: AlertTriangle,
    color: "hsl(16 88% 54%)",
    colorLight: "hsl(16 88% 54% / 0.1)",
    reports: [
      { label: "Active Strikes Report", description: "Current strike counts by employee", href: "/strikes" },
      { label: "Disciplinary Actions", description: "All disciplinary actions issued", href: "/strikes" },
      { label: "Strike Trend", description: "Strike frequency over time by department", href: "/strikes" },
    ],
  },
  {
    title: "Performance",
    icon: TrendingUp,
    color: "hsl(177 61% 36%)",
    colorLight: "hsl(177 61% 36% / 0.1)",
    reports: [
      { label: "Review Completion", description: "Performance review completion rates by cycle", href: "/performance" },
      { label: "Rating Distribution", description: "Score distribution across departments", href: "/performance" },
      { label: "Goal Tracking", description: "Employee goal progress summary", href: "/performance" },
    ],
  },
];

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, "reports.full")) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Workforce analytics and HR reporting"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {REPORT_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card key={cat.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg p-1.5" style={{ backgroundColor: cat.colorLight }}>
                    <Icon className="h-4 w-4" style={{ color: cat.color }} />
                  </div>
                  <CardTitle className="text-sm font-semibold">{cat.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {cat.reports.map((report) => (
                  <Link key={report.label} href={report.href}>
                    <div className="group flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-muted cursor-pointer">
                      <div>
                        <div className="text-sm font-medium text-foreground">{report.label}</div>
                        <div className="text-xs text-muted-foreground">{report.description}</div>
                      </div>
                      <Download className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
