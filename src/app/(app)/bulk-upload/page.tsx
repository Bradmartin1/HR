import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

export default async function BulkUploadPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!hasPermission(session.role, "bulk_upload.import")) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Bulk Upload" description="Import employees and data via CSV" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">CSV Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Bulk import coming soon</p>
            <p className="text-xs text-muted-foreground mt-1">
              CSV import for employees, attendance, PTO balances, and schedules will be available here.
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
            <p className="font-medium">Expected CSV columns for employees:</p>
            <p className="text-muted-foreground font-mono text-xs">
              employee_number, first_name, last_name, work_email, hire_date, department_code, job_title, employment_type
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
