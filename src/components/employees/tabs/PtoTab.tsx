import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  balance_hours: number;
  used_hours: number;
  accrued_hours: number;
  year: number;
}

interface PtoRequest {
  id: string;
  pto_type: string;
  start_date: string;
  end_date: string;
  hours_requested: number;
  status: string;
  notes: string | null;
  review_notes: string | null;
  created_at: string;
}

interface PtoTabProps {
  balances: PtoBalance[];
  requests: PtoRequest[];
}

const REQUEST_STATUS_CLASSES: Record<string, string> = {
  pending: "status-pending",
  approved: "status-approved",
  denied: "status-denied",
  cancelled: "status-inactive",
  taken: "bg-[#e0f4f3] text-[#007384]",
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
                const used = balance.used_hours;
                const accrued = balance.accrued_hours;
                const remaining = balance.balance_hours;
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
                      <span className="text-[11px] text-muted-foreground">{balance.year}</span>
                    </div>
                    <dl className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <dt className="text-[11px] text-muted-foreground">Balance</dt>
                        <dd className="text-lg font-bold text-[#007384]">{remaining.toFixed(1)}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-muted-foreground">Used</dt>
                        <dd className="text-lg font-bold text-[#F15A22]">{used.toFixed(1)}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-muted-foreground">Accrued</dt>
                        <dd className="text-lg font-bold text-[#2DBDB6]">{accrued.toFixed(1)}</dd>
                      </div>
                    </dl>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${usedPct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-center text-muted-foreground">{usedPct}% used</p>
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
                <TableRow className="bg-muted/50">
                  <TableHead className="text-[11px] uppercase tracking-wide">Type</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Start Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">End Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Hours</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Status</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Reason</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Submitted</TableHead>
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
                      {`${request.hours_requested}h`}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                          REQUEST_STATUS_CLASSES[request.status] ?? "status-inactive"
                        }`}
                      >
                        {request.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                      {request.notes ?? "—"}
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
