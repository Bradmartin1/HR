import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/getSession";
import { EmployeeProfileTabs } from "@/components/employees/EmployeeProfileTabs";
import { OverviewTab } from "@/components/employees/tabs/OverviewTab";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/utils/format";

interface Props { params: { employeeId: string } }

export default async function OverviewPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = await createClient();
  const { data: employee } = await supabase
    .from("employees")
    .select(`
      *, departments(id, name, code), job_titles(id, title), locations(id, name),
      manager:manager_id(id, first_name, last_name)
    `)
    .eq("id", params.employeeId)
    .is("deleted_at", null)
    .single();

  if (!employee) notFound();

  // Employees can only see their own profile
  if (session.role === "employee" && session.employeeId !== params.employeeId) {
    redirect("/dashboard/employee");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${employee.first_name} ${employee.last_name}`}
        description={`${(employee.job_titles as {title: string} | null)?.title ?? "—"} · ${(employee.departments as {name: string} | null)?.name ?? "—"} · Hired ${formatDate(employee.hire_date)}`}
      />
      <EmployeeProfileTabs employeeId={params.employeeId} activeTab="overview" role={session.role} />
      <OverviewTab employee={employee} />
    </div>
  );
}
