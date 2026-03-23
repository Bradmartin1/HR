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

interface PtoBalance {
  id: string;
  pto_type: string;
  balance: number;
  used: number | null;
  accrued: number | null;
  year: number | null;
}

interface PtoRequest {
  id: string;
  pto_type: string;
  start_date: string;
  end_date: string;
  hours_requested: number | null;
  status: string;
  reason: string | null;
  reviewer_notes: string | null;
  created_at: string;
}

interface PtoTabProps {
  balances: PtoBalance[];
  requests: PtoRequest[];
}

const REQUEST_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  denied: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  taken: "bg-blue-100 text-blue-800",
};

const PTO_TYPE_LABELS: Record<string, string> = {
  vacation: "Vacation",
  sick: "Sick",
  personal: "Personal",
  bereavement: "Bereavement",
  jury_duty: "Jury Duty",
  unpaid: "Unpaid",
  holiday: "Holiday",
  floating_holiday: "Floating Holiday",
};

export function PtoTab({ balances, requests }: PtoTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">PTO Balances</CardTitle>
        </CardHeader>
        <CardContent>
          {balances.length === 0 ? (
            <p className="text-sm text-muted-foreground">No PTO balances found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {balances.map((balance) => {
                const used = balance.used ?? 0;
                const accrued = balance.accrued ?? balance.balance;
                const remaining = balance.balance;
                const usedPct = accrued > 0 ? Math.min(100, Math.round((used / accrued) * 100)) : 0;

                return (
                  <div
                    key={balance.id}
                    className="rounded-lg border bg-card p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {PTO_TYPE_LABELS[balance.pto_type] ?? balance.pto_type.replace(/_/g, " ")}
                      </p>
                      {balance.year && (
                        <span className="text-xs text-muted-foreground">{balance.year}</span>
                      )}
                    </div>
                    <dl className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <dt className="text-xs text-muted-foreground">Balance</dt>
                        <dd className="text-lg font-bold">{remaining.toFixed(1)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Used</dt>
                        <dd className="text-lg font-bold text-orange-600">{used.toFixed(1)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Accrued</dt>
                        <dd className="text-lg font-bold text-green-600">{accrued.toFixed(1)}</dd>
                      </div>
                    </dl>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${usedPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">{usedPct}% used</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">PTO Request History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">No PTO requests found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="text-sm">
                      {PTO_TYPE_LABELS[request.pto_type] ?? request.pto_type.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(request.start_date)}</TableCell>
                    <TableCell className="text-sm">{formatDate(request.end_date)}</TableCell>
                    <TableCell className="text-sm">
                      {request.hours_requested != null ? `${request.hours_requested}h` : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${
                          REQUEST_STATUS_COLORS[request.status] ?? "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                      {request.reason ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(request.created_at)}
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
