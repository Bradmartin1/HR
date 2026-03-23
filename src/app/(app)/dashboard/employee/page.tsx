import { PageHeader } from "@/components/layout/PageHeader";
import { EmployeeDashboard } from "@/components/dashboards/EmployeeDashboard";

export default function EmployeeDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Dashboard" description="Your HR self-service hub" />
      <EmployeeDashboard />
    </div>
  );
}
