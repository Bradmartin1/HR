import { Badge } from "@/components/ui/badge";
import { type Role, ROLE_LABELS, ROLE_COLORS } from "@/lib/constants/roles";
import { cn } from "@/lib/utils/cn";

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold", ROLE_COLORS[role], className)}>
      {ROLE_LABELS[role]}
    </span>
  );
}
