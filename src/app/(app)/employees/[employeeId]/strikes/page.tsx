import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/getSession";
import { EmployeeProfileTabs } from "@/components/employees/EmployeeProfileTabs";
import { StrikesTab } from "@/components/employees/tabs/StrikesTab";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/utils/format";

interface Props {
  params: Promise<{ employeeId: string }>;
}

export default async function StrikesPage({ params }: Props) {
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

  const [{ data: strikes }, { data: disciplinaryActions }] = await Promise.all([
    supabase
      .from("strike_events")
      .select("*, strike_categories(name)")
      .eq("employee_id", employeeId)
      .order("incident_date", { ascending: false }),
    supabase
      .from("disciplinary_actions")
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
      <EmployeeProfileTabs employeeId={employeeId} activeTab="strikes" role={session.role} />
      <StrikesTab
        strikes={strikes ?? []}
        disciplinaryActions={disciplinaryActions ?? []}
      />
    </div>
  );
}
