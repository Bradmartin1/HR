// Rushtown Poultry — Attendance & Performance Point System

export interface Violation {
  code: string;
  group: "attendance" | "performance";
  label: string;
  points: number | null;
  autoExplanation: string;
  weekend?: boolean;
  plantOnly?: boolean;
  isTermination?: boolean;
}

export const VIOLATIONS: Violation[] = [
  // ── Attendance ──
  { code: "TARDY",           group: "attendance", label: "Tardy",                    points: 0.5, autoExplanation: "Arriving less than 90 minutes late for the start of shift. (Note: If the employee fails to call in but still arrives within 90 minutes, it is considered an absence — 1 point.)" },
  { code: "EARLY_DEPT",      group: "attendance", label: "Early Departure",          points: 0.5, autoExplanation: "Leaving within 90 minutes of the end of shift." },
  { code: "ABSENT",          group: "attendance", label: "Absence",                  points: 1,   autoExplanation: "Arriving more than 90 minutes late or leaving more than 90 minutes before end of shift, or not working scheduled shift and not having PTO to cover the time." },
  { code: "NCNS",            group: "attendance", label: "No Call / No Show",        points: 2,   autoExplanation: "Failing to call in and report for work. Can escalate to immediate disciplinary action." },
  { code: "WKD_TARDY",       group: "attendance", label: "Weekend Tardy",            points: 1,   autoExplanation: "Arriving less than 90 minutes late for the start of shift on Saturday or Sunday.", weekend: true },
  { code: "WKD_EARLY_DEPT",  group: "attendance", label: "Weekend Early Departure",  points: 1,   autoExplanation: "Leaving within 90 minutes of the end of shift on Saturday or Sunday.", weekend: true },
  { code: "WKD_ABSENT",      group: "attendance", label: "Weekend Absence",          points: 2,   autoExplanation: "Any absence on a Saturday or Sunday — these are considered critical shifts.", weekend: true },
  { code: "WKD_NCNS",        group: "attendance", label: "Weekend No Call / No Show", points: 3,  autoExplanation: "Failing to call in and report for work on a Saturday or Sunday. Can escalate to immediate disciplinary action.", weekend: true },
  // ── Performance ──
  { code: "QUALITY_CONTROL",     group: "performance", label: "Quality Control",          points: 0.5, autoExplanation: "Proper labeling, proper stacking violation.", plantOnly: true },
  { code: "INCOMPLETE_TASKS",    group: "performance", label: "Incomplete Daily Tasks",   points: 2,   autoExplanation: "Leaving work without completing your daily task list." },
  { code: "UNREPORTED_PROBLEMS", group: "performance", label: "Unreported Problems",      points: 2,   autoExplanation: "Not reporting problems with equipment or hen health." },
  { code: "UNSAFE_WORK",         group: "performance", label: "Unsafe Work",              points: 2,   autoExplanation: "Putting others/equipment at risk by working unsafely." },
  { code: "INSUBORDINATION",     group: "performance", label: "Insubordination",          points: 2,   autoExplanation: "Not following instructions from a manager/supervisor." },
  { code: "THEFT",               group: "performance", label: "Theft",                    points: null, autoExplanation: "Stealing from the company — IMMEDIATE TERMINATION.", isTermination: true },
];

export const ATTENDANCE_VIOLATIONS = VIOLATIONS.filter(v => v.group === "attendance");
export const PERFORMANCE_VIOLATIONS = VIOLATIONS.filter(v => v.group === "performance");

export interface PointThreshold {
  points: number;
  step: number;
  label: string;
  actionType: string;
}

export const POINT_THRESHOLDS: PointThreshold[] = [
  { points: 4, step: 1, label: "Verbal Warning",        actionType: "verbal_warning" },
  { points: 5, step: 2, label: "Written Warning",        actionType: "written_warning" },
  { points: 6, step: 3, label: "Three Day Suspension",   actionType: "suspension" },
  { points: 7, step: 4, label: "Termination",            actionType: "termination" },
];

export const POINT_ROLLOFF_MONTHS = 6;
export const PROBATION_DAYS = 30;
export const PTO_ADVANCE_DAYS = 7;

export function getViolationByCode(code: string): Violation | undefined {
  return VIOLATIONS.find(v => v.code === code);
}

export function getThresholdForPoints(total: number): PointThreshold | null {
  let matched: PointThreshold | null = null;
  for (const t of POINT_THRESHOLDS) {
    if (total >= t.points) matched = t;
  }
  return matched;
}

export function getNextThreshold(total: number): PointThreshold | null {
  for (const t of POINT_THRESHOLDS) {
    if (total < t.points) return t;
  }
  return null;
}

export function getPointColor(points: number | null): { bg: string; text: string; border: string } {
  if (points === null) return { bg: "hsl(0 80% 92%)", text: "hsl(0 80% 30%)", border: "hsl(0 80% 55%)" };
  if (points <= 0.5) return { bg: "hsl(210 15% 94%)", text: "hsl(210 15% 40%)", border: "hsl(210 15% 75%)" };
  if (points <= 1) return { bg: "hsl(45 100% 93%)", text: "hsl(45 100% 30%)", border: "hsl(45 100% 55%)" };
  if (points <= 2) return { bg: "hsl(30 90% 92%)", text: "hsl(30 90% 30%)", border: "hsl(30 90% 55%)" };
  return { bg: "hsl(16 88% 93%)", text: "hsl(16 88% 35%)", border: "hsl(16 88% 54%)" };
}

export function getTotalColor(total: number): string {
  if (total < 4) return "hsl(140 60% 35%)";
  if (total < 5) return "hsl(45 100% 35%)";
  if (total < 6) return "hsl(30 90% 40%)";
  return "hsl(16 88% 44%)";
}
