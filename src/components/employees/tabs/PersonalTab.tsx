import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Role } from "@/lib/constants/roles";
import { formatDate, formatPhoneNumber } from "@/lib/utils/format";

interface PersonalTabProps {
  employee: {
    date_of_birth: string | null;
    gender: string | null;
    ethnicity: string | null;
    personal_email: string | null;
    personal_phone: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_rel: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
  role: Role;
}

export function PersonalTab({ employee, role }: PersonalTabProps) {
  const canViewSensitive = ["owner", "hr_manager"].includes(role);

  const address = [
    employee.address_line1,
    employee.address_line2,
    employee.city && employee.state ? `${employee.city}, ${employee.state} ${employee.zip ?? ""}` : null,
  ].filter(Boolean).join("\n");

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {canViewSensitive && (
              <>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground uppercase">Date of Birth</dt>
                  <dd className="mt-1 text-sm">{formatDate(employee.date_of_birth)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground uppercase">Gender</dt>
                  <dd className="mt-1 text-sm">{employee.gender ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground uppercase">Ethnicity</dt>
                  <dd className="mt-1 text-sm">{employee.ethnicity ?? "—"}</dd>
                </div>
              </>
            )}
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase">Personal Email</dt>
              <dd className="mt-1 text-sm">{employee.personal_email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase">Personal Phone</dt>
              <dd className="mt-1 text-sm">{formatPhoneNumber(employee.personal_phone)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Address</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-line">{address || "—"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Emergency Contact</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase">Name</dt>
              <dd className="mt-1 text-sm">{employee.emergency_contact_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase">Relationship</dt>
              <dd className="mt-1 text-sm">{employee.emergency_contact_rel ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase">Phone</dt>
              <dd className="mt-1 text-sm">{formatPhoneNumber(employee.emergency_contact_phone)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
