import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/getSession";
import { EmployeeProfileTabs } from "@/components/employees/EmployeeProfileTabs";
import { EmploymentTab } from "@/components/employees/tabs/EmploymentTab";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/utils/format";

interface Props {
  params: Promise<{ employeeId: string }>;
}

export default async function EmploymentPage({ params }: Props) {
  const { employeeId } = await params;

  const session = await getSession();
  if (!session) redirect("/login");

  // Employees can only see their own profile
  if (session.role === "employee" && session.employeeId !== employeeId) {
    redirect("/dashboard/employee");
  }

  const supabase = await createClient();

  const { data: employee } = await supabase
    .from("employees")
    .select(`
      *,
      departments(id, name, code),
      job_titles(id, title),
      locations(id, name),
      manager:manager_id(id, first_name, last_name)
    `)
    .eq("id", employeeId)
    .is("deleted_at", null)
    .single();

  if (!employee) notFound();

  const { data: assignments } = await supabase
    .from("employee_assignments")
    .select(`
      *,
      departments(name),
      job_titles(title),
      locations(name)
    `)
    .eq("employee_id", employeeId)
    .order("effective_date", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${employee.first_name} ${employee.last_name}`}
        description={`${(employee.job_titles as { title: string } | null)?.title ?? "—"} · ${(employee.departments as { name: string } | null)?.name ?? "—"} · Hired ${formatDate(employee.hire_date)}`}
      />
      <EmployeeProfileTabs employeeId={employeeId} activeTab="employment" role={session.role} />
      <EmploymentTab employee={employee} assignments={assignments ?? []} />
    </div>
  );
}
