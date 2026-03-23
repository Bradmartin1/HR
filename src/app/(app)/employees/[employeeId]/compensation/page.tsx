import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/getSession";
import { EmployeeProfileTabs } from "@/components/employees/EmployeeProfileTabs";
import { CompensationTab } from "@/components/employees/tabs/CompensationTab";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/utils/format";

interface Props {
  params: Promise<{ employeeId: string }>;
}

export default async function CompensationPage({ params }: Props) {
  const { employeeId } = await params;

  const session = await getSession();
  if (!session) redirect("/login");

  if (!["owner", "hr_manager"].includes(session.role)) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const { data: employee } = await supabase
    .from("employees")
    .select(`
      id, first_name, last_name, hire_date,
      job_titles(title),
      departments(name)
    `)
    .eq("id", employeeId)
    .is("deleted_at", null)
    .single();

  if (!employee) notFound();

  const [{ data: compensationRecords }, { data: benefitsRecords }] = await Promise.all([
    supabase
      .from("compensation_records")
      .select("*")
      .eq("employee_id", employeeId)
      .order("effective_date", { ascending: false }),
    supabase
      .from("benefits_records")
      .select("*")
      .eq("employee_id", employeeId)
      .order("effective_date", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${employee.first_name} ${employee.last_name}`}
        description={`${(employee.job_titles as { title: string } | null)?.title ?? "—"} · ${(employee.departments as { name: string } | null)?.name ?? "—"} · Hired ${formatDate(employee.hire_date)}`}
      />
      <EmployeeProfileTabs employeeId={employeeId} activeTab="compensation" role={session.role} />
      <CompensationTab
        compensationRecords={compensationRecords ?? []}
        benefitsRecords={benefitsRecords ?? []}
      />
    </div>
  );
}
