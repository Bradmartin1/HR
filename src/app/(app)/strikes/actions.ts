"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { getViolationByCode, POINT_THRESHOLDS } from "@/lib/constants/point-system";

export async function issuePoint(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  if (!hasPermission(session.role, "strikes.issue")) throw new Error("Not authorized");

  const employeeId = formData.get("employee_id") as string;
  const violationCode = formData.get("violation_code") as string;
  const incidentDate = formData.get("incident_date") as string;
  const additionalNotes = formData.get("notes") as string | null;

  if (!employeeId || !violationCode || !incidentDate) {
    throw new Error("Missing required fields");
  }

  const violation = getViolationByCode(violationCode);
  if (!violation) throw new Error("Invalid violation type");

  const supabase = await createClient();

  // Look up category_id from DB
  const { data: category } = await supabase
    .from("strike_categories")
    .select("id")
    .eq("code", violationCode)
    .single();

  if (!category) throw new Error(`Strike category not found for code: ${violationCode}`);

  // Build description
  const description = additionalNotes
    ? `${violation.autoExplanation}\n\nAdditional notes: ${additionalNotes}`
    : violation.autoExplanation;

  // Insert strike event
  const { data: strikeEvent, error: insertError } = await supabase
    .from("strike_events")
    .insert({
      employee_id: employeeId,
      category_id: category.id,
      incident_date: incidentDate,
      description: description,
      points: violation.points,
      is_weekend: violation.weekend ?? false,
      notes: additionalNotes || null,
      issued_by: session.id,
      level: null,
      voided: false,
      approved_by: null,
      approved_at: null,
      voided_reason: null,
      voided_by: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .select("id")
    .single();

  if (insertError) throw new Error(insertError.message);

  // Handle immediate termination for theft
  if (violation.isTermination) {
    await supabase.from("disciplinary_actions").insert({
      strike_event_id: strikeEvent.id,
      employee_id: employeeId,
      action_type: "termination",
      effective_date: incidentDate,
      details: "Immediate termination — Theft from company",
      issued_by: session.id,
      end_date: null,
      document_path: null,
      employee_acknowledged_at: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  } else {
    // Calculate new point total and check thresholds
    const { data: totalResult } = await supabase.rpc("get_employee_active_points", {
      p_employee_id: employeeId,
    });

    const newTotal = typeof totalResult === "number" ? totalResult : 0;

    // Find the highest threshold crossed
    let crossedThreshold = null;
    for (const t of POINT_THRESHOLDS) {
      if (newTotal >= t.points) crossedThreshold = t;
    }

    if (crossedThreshold) {
      // Check if a disciplinary action already exists at this threshold for this employee
      const { data: existingAction } = await supabase
        .from("disciplinary_actions")
        .select("id")
        .eq("employee_id", employeeId)
        .eq("action_type", crossedThreshold.actionType)
        .limit(1);

      if (!existingAction || existingAction.length === 0) {
        await supabase.from("disciplinary_actions").insert({
          strike_event_id: strikeEvent.id,
          employee_id: employeeId,
          action_type: crossedThreshold.actionType,
          effective_date: incidentDate,
          details: `Step ${crossedThreshold.step} — ${crossedThreshold.label} (${newTotal} points accumulated)`,
          issued_by: session.id,
          end_date: null,
          document_path: null,
          employee_acknowledged_at: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
      }
    }
  }

  revalidatePath("/strikes");
  revalidatePath(`/employees/${employeeId}/strikes`);
}
