import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { AddEmployeeForm } from "@/components/employees/AddEmployeeForm";
import { UserPlus } from "lucide-react";

export default async function NewEmployeePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, "employees.create")) redirect("/employees");

  const supabase = await createClient();

  const [deptRes, titlesRes, locRes] = await Promise.all([
    supabase.from("departments").select("id, name, code").eq("is_active", true).order("name"),
    supabase.from("job_titles").select("id, title, department_id").eq("is_active", true).order("title"),
    supabase.from("locations").select("id, name").eq("is_active", true).order("name"),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Add New Employee"
        description="Create a new employee record in the system"
      />
      <AddEmployeeForm
        departments={deptRes.data ?? []}
        jobTitles={titlesRes.data ?? []}
        locations={locRes.data ?? []}
      />
    </div>
  );
}
