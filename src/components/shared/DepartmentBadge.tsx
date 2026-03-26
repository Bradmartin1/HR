import { cn } from "@/lib/utils/cn";

const DEPT_COLORS: Record<string, string> = {
  Production:     "bg-[#e6f7f6] text-[#005f6d]",     /* Teal-derived */
  Processing:     "bg-[#e0f4f3] text-[#007384]",     /* Deep teal-derived */
  Transportation: "bg-[#fff4cc] text-[#7a5e00]",     /* Gold-derived */
  Accounting:     "bg-[#f0efee] text-[#5c5b59]",     /* Gray-derived */
  Maintenance:    "bg-[#fde8e1] text-[#a33a14]",     /* Orange-derived */
};

interface DepartmentBadgeProps {
  department: string;
  className?: string;
}

export function DepartmentBadge({ department, className }: DepartmentBadgeProps) {
  const colorClass = DEPT_COLORS[department] ?? "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold", colorClass, className)}>
      {department}
    </span>
  );
}
