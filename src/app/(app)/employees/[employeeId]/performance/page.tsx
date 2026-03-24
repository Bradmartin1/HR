import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/getSession";
import { EmployeeProfileTabs } from "@/components/employees/EmployeeProfileTabs";
import { PerformanceTab } from "@/components/employees/tabs/PerformanceTab";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/utils/format";

interface Props {
  params: Promise<{ employeeId: string }>;
}

export default async function PerformancePage({ params }: Props) {
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
      id, first_name, last_name, hire_date,
      job_titles(title),
      departments(name)
    `)
    .eq("id", employeeId)
    .is("deleted_at", null)
    .single();

  if (!employee) notFound();

  const [{ data: reviews }, { data: goals }] = await Promise.all([
    supabase
      .from("performance_reviews")
      .select(`
        *,
        review_cycles(id, name, start_date, end_date, status)
      `)
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false }),
    supabase
      .from("performance_goals")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${employee.first_name} ${employee.last_name}`}
        description={`${(employee.job_titles as { title: string } | null)?.title ?? "—"} · ${(employee.departments as { name: string } | null)?.name ?? "—"} · Hired ${formatDate(employee.hire_date)}`}
      />
      <EmployeeProfileTabs employeeId={employeeId} activeTab="performance" role={session.role} />
      <PerformanceTab
        reviews={reviews ?? []}
        goals={goals ?? []}
        employeeId={employeeId}
      />
    </div>
  );
}
