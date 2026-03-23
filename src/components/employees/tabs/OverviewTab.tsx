import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  terminated: "bg-red-100 text-red-800",
  on_leave: "bg-yellow-100 text-yellow-800",
};

export function OverviewTab({ employee }: OverviewTabProps) {
  const fields = [
    { label: "Employee Number", value: employee.employee_number },
    { label: "Status", value: (
      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[employee.status] ?? "bg-gray-100"}`}>
        {employee.status.replace("_", " ")}
      </span>
    )},
    { label: "Employment Type", value: employee.employment_type.replace("_", " ") },
    { label: "Department", value: (employee.departments as {name: string} | null)?.name ?? "—" },
    { label: "Job Title", value: (employee.job_titles as {title: string} | null)?.title ?? "—" },
    { label: "Location", value: (employee.locations as {name: string} | null)?.name ?? "—" },
    { label: "Manager", value: employee.manager ? `${(employee.manager as {first_name: string; last_name: string}).first_name} ${(employee.manager as {first_name: string; last_name: string}).last_name}` : "—" },
    { label: "Hire Date", value: formatDate(employee.hire_date) },
    { label: "Termination Date", value: employee.termination_date ? formatDate(employee.termination_date) : "—" },
    { label: "Work Email", value: employee.work_email ?? "—" },
    { label: "Work Phone", value: employee.work_phone ?? "—" },
    { label: "CDL Driver", value: employee.is_driver ? "Yes" : "No" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Employee Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
              <dd className="mt-1 text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
