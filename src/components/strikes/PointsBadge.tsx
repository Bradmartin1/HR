import { getPointColor } from "@/lib/constants/point-system";

interface Props {
  points: number | null;
  className?: string;
}

export function PointsBadge({ points, className }: Props) {
  const color = getPointColor(points);
  const label = points === null ? "TERM" : `${points} pt${points !== 1 ? "s" : ""}`;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${className ?? ""}`}
      style={{ backgroundColor: color.bg, color: color.text, border: `1px solid ${color.border}` }}
    >
      {label}
    </span>
  );
}
