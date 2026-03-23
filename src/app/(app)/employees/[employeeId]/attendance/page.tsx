import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/getSession";
import { hasPermission } from "@/lib/auth/permissions";
import { EmployeeProfileTabs } from "@/components/employees/EmployeeProfileTabs";
import { AttendanceTab } from "@/components/employees/tabs/AttendanceTab";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/utils/format";

interface Props {
  params: Promise<{ employeeId: string }>;
}

export default async function AttendancePage({ params }: Props) {
  const { employeeId } = await params;

  const session = await getSession();
  if (!session) redirect("/login");

  // Employees can only see their own profile
  if (session.role === "employee" && session.employeeId !== employeeId) {
    redirect("/dashboard/employee");
  }

  // Only roles with attendance.enter can view this tab (managers, HR, owner)
  if (!hasPermission(session.role, "attendance.enter")) {
    redirect(`/employees/${employeeId}/overview`);
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

  const { data: events } = await supabase
    .from("attendance_events")
    .select("*")
    .eq("employee_id", employeeId)
    .order("event_date", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${employee.first_name} ${employee.last_name}`}
        description={`${(employee.job_titles as { title: string } | null)?.title ?? "—"} · ${(employee.departments as { name: string } | null)?.name ?? "—"} · Hired ${formatDate(employee.hire_date)}`}
      />
      <EmployeeProfileTabs employeeId={employeeId} activeTab="attendance" role={session.role} />
      <AttendanceTab events={events ?? []} />
    </div>
  );
}
