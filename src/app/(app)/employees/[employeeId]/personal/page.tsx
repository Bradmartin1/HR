import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/getSession";
import { EmployeeProfileTabs } from "@/components/employees/EmployeeProfileTabs";
import { PersonalTab } from "@/components/employees/tabs/PersonalTab";
import { PageHeader } from "@/components/layout/PageHeader";

interface Props { params: { employeeId: string } }

export default async function PersonalPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "employee" && session.employeeId !== params.employeeId) redirect("/dashboard/employee");

  const supabase = await createClient();
  const { data: employee } = await supabase.from("employees").select("*").eq("id", params.employeeId).is("deleted_at", null).single();
  if (!employee) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`${employee.first_name} ${employee.last_name}`} />
      <EmployeeProfileTabs employeeId={params.employeeId} activeTab="personal" role={session.role} />
      <PersonalTab employee={employee} role={session.role} />
    </div>
  );
}
