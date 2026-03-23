import { PageHeader } from "@/components/layout/PageHeader";
import { ExecutiveDashboard } from "@/components/dashboards/ExecutiveDashboard";
import { requireRole } from "@/lib/auth/requireRole";
import { redirect } from "next/navigation";

export default async function ExecutiveDashboardPage() {
  try {
    await requireRole(["owner", "executive"]);
  } catch {
    redirect("/dashboard/employee");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Executive Dashboard" description="High-level company metrics" />
      <ExecutiveDashboard />
    </div>
  );
}
