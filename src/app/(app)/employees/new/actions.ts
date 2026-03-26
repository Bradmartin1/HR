"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";

export async function createEmployee(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  if (!hasPermission(session.role, "employees.create")) throw new Error("Not authorized");

  const supabase = await createClient();

  // Generate employee number
  const { count } = await supabase.from("employees").select("*", { count: "exact", head: true });
  const empNum = `EMP-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const preferredName = formData.get("preferred_name") as string | null;
  const workEmail = formData.get("work_email") as string | null;
  const personalPhone = formData.get("personal_phone") as string | null;
  const hireDate = formData.get("hire_date") as string;
  const employmentType = formData.get("employment_type") as string;
  const status = formData.get("status") as string;
  const departmentId = formData.get("department_id") as string | null;
  const jobTitleId = formData.get("job_title_id") as string | null;
  const locationId = formData.get("location_id") as string | null;
  const isDriver = formData.get("is_driver") === "true";
  const cdlExpiry = formData.get("cdl_expiry") as string | null;
  const payType = formData.get("pay_type") as string | null;
  const payAmount = formData.get("pay_amount") as string | null;

  const { data: employee, error } = await supabase
    .from("employees")
    .insert({
      employee_number: empNum,
      first_name: firstName,
      last_name: lastName,
      preferred_name: preferredName || null,
      work_email: workEmail || null,
      work_phone: null,
      personal_email: null,
      personal_phone: personalPhone || null,
      date_of_birth: null,
      ssn_last4: null,
      gender: null,
      ethnicity: null,
      address_line1: null,
      address_line2: null,
      city: null,
      state: null,
      zip: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      emergency_contact_rel: null,
      hire_date: hireDate,
      employment_type: employmentType,
      status: status,
      department_id: departmentId || null,
      job_title_id: jobTitleId || null,
      location_id: locationId || null,
      manager_id: null,
      user_id: null,
      is_driver: isDriver,
      cdl_expiry: (isDriver && cdlExpiry) ? cdlExpiry : null,
      termination_date: null,
      termination_reason: null,
      rehire_eligible: null,
      deleted_at: null,
      created_by: session.id,
    } as Record<string, unknown>)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // Create initial compensation record if pay info provided
  if (payType && payAmount && parseFloat(payAmount) > 0) {
    await supabase.from("compensation_records").insert({
      employee_id: employee.id,
      pay_type: payType,
      amount: parseFloat(payAmount),
      currency: "USD",
      effective_date: hireDate,
      end_date: null,
      change_reason: "Initial hire",
      approved_by: session.id,
    } as Record<string, unknown>);
  }

  redirect(`/employees/${employee.id}/overview`);
}
