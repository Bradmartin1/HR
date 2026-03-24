import { createClient } from "@/lib/supabase/server";

export interface HealthScore {
  score: number;
  tier: "green" | "amber" | "red";
  breakdown: {
    strikeDeduction: number;
    attendanceDeduction: number;
    overdueOnboardingDeduction: number;
    overdueTrainingDeduction: number;
    recognitionBonus: number;
    reviewBonus: number;
  };
}

export async function getEmployeeHealthScore(employeeId: string): Promise<HealthScore> {
  const supabase = await createClient();

  // Call the Postgres function
  const { data, error } = await supabase.rpc("get_employee_health_score", {
    p_employee_id: employeeId,
  });

  if (error) {
    // Return a neutral score if function not available yet
    return { score: 75, tier: "amber", breakdown: {
      strikeDeduction: 0, attendanceDeduction: 0,
      overdueOnboardingDeduction: 0, overdueTrainingDeduction: 0,
      recognitionBonus: 0, reviewBonus: 0,
    }};
  }

  const score = Math.max(0, Math.min(100, data as number));
  const tier = score >= 80 ? "green" : score >= 50 ? "amber" : "red";

  return {
    score,
    tier,
    breakdown: {
      strikeDeduction: 0,
      attendanceDeduction: 0,
      overdueOnboardingDeduction: 0,
      overdueTrainingDeduction: 0,
      recognitionBonus: 0,
      reviewBonus: 0,
    },
  };
}

export const HEALTH_TIER_COLORS = {
  green: "text-green-600 bg-green-50",
  amber: "text-amber-600 bg-amber-50",
  red: "text-red-600 bg-red-50",
};

export const HEALTH_TIER_LABELS = {
  green: "Healthy",
  amber: "Watch",
  red: "At Risk",
};
