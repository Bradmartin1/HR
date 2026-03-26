import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format";

interface OverviewTabProps {
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    employee_number: string;
    status: string;
    employment_type: string;
    hire_date: string;
    termination_date: string | null;
    work_email: string | null;
    work_phone: string | null;
    is_driver: boolean;
    departments?: { name: string } | null;
    job_titles?: { title: string } | null;
    locations?: { name: string } | null;
    manager?: { first_name: string; last_name: string } | null;
  };
}

const STATUS_STYLES: Record<string, string> = {
  active:     "status-active",
  inactive:   "status-inactive",
  terminated: "status-terminated",
  on_leave:   "status-on-leave",
};

export function OverviewTab({ employee }: OverviewTabProps) {
  const fields = [
    { label: "Employee Number", value: employee.employee_number },
    { label: "Status", value: (
      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[employee.status] ?? "status-inactive"}`}>
        {employee.status.replace("_", " ")}
      </span>
    )},
    { label: "Employment Type", value: <span className="capitalize">{employee.employment_type.replace("_", " ")}</span> },
    { label: "Department", value: (employee.departments as {name: string} | null)?.name ?? "\u2014" },
    { label: "Job Title", value: (employee.job_titles as {title: string} | null)?.title ?? "\u2014" },
    { label: "Location", value: (employee.locations as {name: string} | null)?.name ?? "\u2014" },
    { label: "Manager", value: employee.manager ? `${(employee.manager as {first_name: string; last_name: string}).first_name} ${(employee.manager as {first_name: string; last_name: string}).last_name}` : "\u2014" },
    { label: "Hire Date", value: formatDate(employee.hire_date) },
    { label: "Termination Date", value: employee.termination_date ? formatDate(employee.termination_date) : "\u2014" },
    { label: "Work Email", value: employee.work_email ?? "\u2014" },
    { label: "Work Phone", value: employee.work_phone ?? "\u2014" },
    { label: "CDL Driver", value: employee.is_driver ? "Yes" : "No" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</dt>
              <dd className="text-sm font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
