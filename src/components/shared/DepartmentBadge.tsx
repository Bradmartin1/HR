import { cn } from "@/lib/utils/cn";

const DEPT_COLORS: Record<string, string> = {
  Production: "bg-green-100 text-green-800",
  Processing: "bg-blue-100 text-blue-800",
  Transportation: "bg-orange-100 text-orange-800",
  Accounting: "bg-purple-100 text-purple-800",
  Maintenance: "bg-gray-100 text-gray-800",
};

interface DepartmentBadgeProps {
  department: string;
  className?: string;
}

export function DepartmentBadge({ department, className }: DepartmentBadgeProps) {
  const colorClass = DEPT_COLORS[department] ?? "bg-gray-100 text-gray-800";
  return (
    <span className={cn("inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold", colorClass, className)}>
      {department}
    </span>
  );
}
