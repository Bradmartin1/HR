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

interface Assignment {
  id: string;
  effective_date: string;
  end_date: string | null;
  assignment_type: string | null;
  notes: string | null;
  departments?: { name: string } | null;
  job_titles?: { title: string } | null;
  locations?: { name: string } | null;
}

interface EmploymentTabProps {
  employee: {
    employment_type: string;
    status: string;
    hire_date: string;
    termination_date: string | null;
    is_driver: boolean;
    cdl_expiry: string | null;
    departments?: { name: string } | null;
    job_titles?: { title: string } | null;
    locations?: { name: string } | null;
    manager?: { first_name: string; last_name: string } | null;
  };
  assignments: Assignment[];
}

const STATUS_CLASSES: Record<string, string> = {
  active: "status-active",
  inactive: "status-inactive",
  terminated: "status-terminated",
  on_leave: "status-on-leave",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}

export function EmploymentTab({ employee, assignments }: EmploymentTabProps) {
  const dept = (employee.departments as { name: string } | null)?.name ?? "—";
  const title = (employee.job_titles as { title: string } | null)?.title ?? "—";
  const location = (employee.locations as { name: string } | null)?.name ?? "—";
  const manager = employee.manager
    ? `${(employee.manager as { first_name: string; last_name: string }).first_name} ${(employee.manager as { first_name: string; last_name: string }).last_name}`
    : "—";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Status"
              value={
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                    STATUS_CLASSES[employee.status] ?? "status-inactive"
                  }`}
                >
                  {employee.status.replace(/_/g, " ")}
                </span>
              }
            />
            <Field
              label="Employment Type"
              value={<span className="capitalize">{employee.employment_type.replace(/_/g, " ")}</span>}
            />
            <Field label="Hire Date" value={formatDate(employee.hire_date)} />
            <Field
              label="Termination Date"
              value={employee.termination_date ? formatDate(employee.termination_date) : "—"}
            />
            <Field label="Department" value={dept} />
            <Field label="Job Title" value={title} />
            <Field label="Location" value={location} />
            <Field label="Manager" value={manager} />
            <Field
              label="CDL Driver"
              value={
                employee.is_driver ? (
                  <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold bg-[#e0f4f3] text-[#007384]">
                    Yes
                  </span>
                ) : (
                  "No"
                )
              }
            />
            {employee.is_driver && (
              <Field
                label="CDL Expiry"
                value={
                  employee.cdl_expiry ? (
                    <span
                      className={
                        new Date(employee.cdl_expiry) < new Date()
                          ? "text-[#F15A22] font-medium"
                          : ""
                      }
                    >
                      {formatDate(employee.cdl_expiry)}
                      {new Date(employee.cdl_expiry) < new Date() && (
                        <span className="ml-2 inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold status-overdue">
                          Expired
                        </span>
                      )}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assignment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">No assignment history found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-[11px] uppercase tracking-wide">Effective Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">End Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Department</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Job Title</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Location</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Type</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm">{formatDate(a.effective_date)}</TableCell>
                    <TableCell className="text-sm">
                      {a.end_date ? formatDate(a.end_date) : (
                        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold status-active">
                          Current
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {(a.departments as { name: string } | null)?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {(a.job_titles as { title: string } | null)?.title ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {(a.locations as { name: string } | null)?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {a.assignment_type ? a.assignment_type.replace(/_/g, " ") : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {a.notes ?? "—"}
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
