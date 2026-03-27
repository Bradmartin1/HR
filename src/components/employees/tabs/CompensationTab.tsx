import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatCurrency } from "@/lib/utils/format";

interface CompensationRecord {
  id: string;
  pay_type: string;
  amount: number | null;
  effective_date: string;
  end_date: string | null;
  change_reason: string | null;
}

interface BenefitsRecord {
  id: string;
  benefit_type: string;
  plan_name: string | null;
  enrollment_date: string | null;
  end_date: string | null;
  employee_contribution: number | null;
  employer_contribution: number | null;
}

interface CompensationTabProps {
  compensationRecords: CompensationRecord[];
  benefitsRecords: BenefitsRecord[];
}

const PAY_TYPE_LABELS: Record<string, string> = {
  hourly: "Hourly",
  salary: "Salary",
  salary_exempt: "Salary (Exempt)",
  salary_non_exempt: "Salary (Non-Exempt)",
  commission: "Commission",
  contract: "Contract",
};

const PAY_TYPE_COLORS: Record<string, string> = {
  hourly: "bg-[#e6f7f6] text-[#005f6d]",
  salary: "bg-[#e0f4f3] text-[#007384]",
  salary_exempt: "bg-[#e0f4f3] text-[#007384]",
  salary_non_exempt: "bg-[#e0f4f3] text-[#007384]",
  commission: "bg-[#fff4cc] text-[#7a5e00]",
  contract: "bg-[#f0efee] text-[#5c5b59]",
};

export function CompensationTab({
  compensationRecords,
  benefitsRecords,
}: CompensationTabProps) {
  const currentRecord = compensationRecords[0];

  return (
    <div className="space-y-6">
      {currentRecord && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Compensation</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Pay Type
                </dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${
                      PAY_TYPE_COLORS[currentRecord.pay_type] ?? "bg-[#f0efee] text-[#5c5b59]"
                    }`}
                  >
                    {PAY_TYPE_LABELS[currentRecord.pay_type] ?? currentRecord.pay_type.replace(/_/g, " ")}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Amount
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {formatCurrency(currentRecord.amount)}
                  {currentRecord.pay_type === "hourly" && (
                    <span className="text-muted-foreground font-normal text-[11px] ml-1">/ hr</span>
                  )}
                  {(currentRecord.pay_type === "salary" ||
                    currentRecord.pay_type === "salary_exempt" ||
                    currentRecord.pay_type === "salary_non_exempt") && (
                    <span className="text-muted-foreground font-normal text-[11px] ml-1">/ yr</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Effective Date
                </dt>
                <dd className="mt-1 text-sm">{formatDate(currentRecord.effective_date)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compensation History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {compensationRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">No compensation records found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-[11px] uppercase tracking-wide">Pay Type</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Amount</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Effective Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">End Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Change Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compensationRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          PAY_TYPE_COLORS[record.pay_type] ?? "bg-[#f0efee] text-[#5c5b59]"
                        }`}
                      >
                        {PAY_TYPE_LABELS[record.pay_type] ?? record.pay_type.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatCurrency(record.amount)}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(record.effective_date)}</TableCell>
                    <TableCell className="text-sm">
                      {record.end_date ? (
                        formatDate(record.end_date)
                      ) : (
                        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold status-active">
                          Current
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {record.change_reason ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Benefits</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {benefitsRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">No benefits records found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-[11px] uppercase tracking-wide">Benefit Type</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Plan</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Enrollment Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">End Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Employee Cost</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Employer Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benefitsRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="text-sm capitalize">
                      {record.benefit_type.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-sm">{record.plan_name ?? "—"}</TableCell>
                    <TableCell className="text-sm">
                      {record.enrollment_date ? formatDate(record.enrollment_date) : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {record.end_date ? (
                        formatDate(record.end_date)
                      ) : (
                        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold status-active">
                          Current
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{formatCurrency(record.employee_contribution)}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(record.employer_contribution)}</TableCell>
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
