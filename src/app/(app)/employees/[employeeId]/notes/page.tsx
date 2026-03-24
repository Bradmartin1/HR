import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/getSession";
import { hasPermission } from "@/lib/auth/permissions";
import { EmployeeProfileTabs } from "@/components/employees/EmployeeProfileTabs";
import { NotesTab } from "@/components/employees/tabs/NotesTab";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/utils/format";

interface Props {
  params: Promise<{ employeeId: string }>;
}

export default async function NotesPage({ params }: Props) {
  const { employeeId } = await params;

  const session = await getSession();
  if (!session) redirect("/login");

  // Only roles with employees.edit (HR, managers, owner) can view notes
  if (!hasPermission(session.role, "employees.edit")) {
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

  const { data: notes } = await supabase
    .from("notes")
    .select(`
      id, content, is_private, created_by, created_at,
      author:created_by(full_name)
    `)
    .eq("entity_type", "employee")
    .eq("entity_id", employeeId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${employee.first_name} ${employee.last_name}`}
        description={`${(employee.job_titles as { title: string } | null)?.title ?? "—"} · ${(employee.departments as { name: string } | null)?.name ?? "—"} · Hired ${formatDate(employee.hire_date)}`}
      />
      <EmployeeProfileTabs employeeId={employeeId} activeTab="notes" role={session.role} />
      <NotesTab notes={(notes ?? []) as Parameters<typeof NotesTab>[0]["notes"]} />
    </div>
  );
}
