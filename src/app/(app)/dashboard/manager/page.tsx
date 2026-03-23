import { PageHeader } from "@/components/layout/PageHeader";
import { ManagerDashboard } from "@/components/dashboards/ManagerDashboard";
import { requireRole } from "@/lib/auth/requireRole";
import { redirect } from "next/navigation";

export default async function ManagerDashboardPage() {
  try {
    await requireRole(["owner", "hr_manager", "department_manager"]);
  } catch {
    redirect("/dashboard/employee");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Manager Dashboard" description="Your department overview" />
      <ManagerDashboard />
    </div>
  );
}
