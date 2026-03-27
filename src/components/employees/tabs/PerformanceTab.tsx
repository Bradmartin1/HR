import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils/format";

interface ReviewCycle {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
}

interface PerformanceReview {
  id: string;
  overall_rating: number | null;
  status: string;
  submitted_at: string | null;
  completed_at: string | null;
  reviewer_notes: string | null;
  review_cycles?: ReviewCycle | null;
}

interface PerformanceGoal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  progress_pct: number | null;
}

interface PerformanceTabProps {
  reviews: PerformanceReview[];
  goals: PerformanceGoal[];
  employeeId: string;
}

const REVIEW_STATUS_COLORS: Record<string, string> = {
  draft: "bg-[#f0efee] text-[#5c5b59]",
  in_progress: "bg-[#e0f4f3] text-[#007384]",
  submitted: "bg-[#fff4cc] text-[#7a5e00]",
  completed: "bg-[#e6f7f6] text-[#005f6d]",
  acknowledged: "bg-[#e0f4f3] text-[#007384]",
};

const GOAL_STATUS_COLORS: Record<string, string> = {
  not_started: "bg-[#f0efee] text-[#5c5b59]",
  in_progress: "bg-[#e0f4f3] text-[#007384]",
  completed: "bg-[#e6f7f6] text-[#005f6d]",
  cancelled: "bg-[#fde8e1] text-[#a33a14]",
  overdue: "bg-[#fde8e1] text-[#F15A22]",
};

function RatingStars({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="flex items-center gap-1">
      <span className="font-semibold">{rating.toFixed(1)}</span>
      <span className="text-muted-foreground text-xs">/ 5</span>
    </span>
  );
}

export function PerformanceTab({ reviews, goals, employeeId }: PerformanceTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Reviews</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">No performance reviews found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-[11px] uppercase tracking-wide">Review Cycle</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Cycle Period</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Overall Rating</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Status</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Completed</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => {
                  const cycle = review.review_cycles as ReviewCycle | null;
                  return (
                    <TableRow key={review.id}>
                      <TableCell className="text-sm font-medium">
                        {cycle?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cycle?.start_date && cycle?.end_date
                          ? `${formatDate(cycle.start_date)} – ${formatDate(cycle.end_date)}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <RatingStars rating={review.overall_rating} />
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${
                            REVIEW_STATUS_COLORS[review.status] ?? "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {review.status.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {review.completed_at ? formatDate(review.completed_at) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/employees/${employeeId}/performance/${review.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Goals</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">No goals found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-[11px] uppercase tracking-wide">Goal</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Status</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Progress</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Due Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.map((goal) => (
                  <TableRow key={goal.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{goal.title}</p>
                      {goal.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-[240px] truncate">
                          {goal.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${
                          GOAL_STATUS_COLORS[goal.status] ?? "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {goal.status.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {goal.progress_pct != null ? `${goal.progress_pct}%` : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {goal.due_date ? formatDate(goal.due_date) : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {goal.completed_at ? formatDate(goal.completed_at) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
