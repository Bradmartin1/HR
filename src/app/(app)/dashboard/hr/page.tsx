import { PageHeader } from "@/components/layout/PageHeader";
import { HRDashboard } from "@/components/dashboards/HRDashboard";
import { requireRole } from "@/lib/auth/requireRole";
import { redirect } from "next/navigation";

export default async function HRDashboardPage() {
  try {
    await requireRole(["owner", "hr_manager"]);
  } catch {
    redirect("/dashboard/employee");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="HR Dashboard" description="Company-wide HR overview" />
      <HRDashboard />
    </div>
  );
}
