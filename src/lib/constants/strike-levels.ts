export const STRIKE_LEVELS = {
  1: "Verbal Warning",
  2: "Written Warning",
  3: "Final Warning",
  4: "Termination",
} as const;

export type StrikeLevel = keyof typeof STRIKE_LEVELS;

export const STRIKE_LEVEL_COLORS: Record<number, string> = {
  1: "bg-[#fff4cc] text-[#7a5e00]",
  2: "bg-[#fde8e1] text-[#a33a14]",
  3: "bg-[#fde8e1] text-[#F15A22]",
  4: "bg-[#130C0E] text-white",
};

export const STRIKE_CATEGORIES_DEFAULT = [
  { name: "Tardy", code: "TARDY" },
  { name: "Absent", code: "ABSENT" },
  { name: "No Call / No Show", code: "NCNS" },
  { name: "Insubordination", code: "INSUBORDINATION" },
  { name: "Safety Violation", code: "SAFETY" },
  { name: "Policy Violation", code: "POLICY" },
  { name: "Performance Issue", code: "PERFORMANCE" },
] as const;

export const DISCIPLINARY_ACTION_TYPES = [
  "verbal_warning",
  "written_warning",
  "pip",
  "suspension",
  "termination",
] as const;

export type DisciplinaryActionType = (typeof DISCIPLINARY_ACTION_TYPES)[number];

export const DISCIPLINARY_ACTION_LABELS: Record<DisciplinaryActionType, string> = {
  verbal_warning: "Verbal Warning",
  written_warning: "Written Warning",
  pip: "Performance Improvement Plan",
  suspension: "Suspension",
  termination: "Termination",
};
