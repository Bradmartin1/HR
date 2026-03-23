import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { requireRole } from "@/lib/auth/requireRole";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function EmployeesPage() {
  try {
    await requireRole(["owner", "hr_manager", "department_manager"]);
  } catch {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select(`
      id, employee_number, first_name, last_name, status, employment_type, hire_date, work_email,
      departments(id, name, code),
      job_titles(id, title),
      locations(id, name)
    `)
    .is("deleted_at", null)
    .order("last_name");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description={`${employees?.length ?? 0} total employees`}
        action={
          <Link href="/employees/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Employee
            </Button>
          </Link>
        }
      />
      <EmployeeTable data={(employees ?? []) as Parameters<typeof EmployeeTable>[0]["data"]} />
    </div>
  );
}
