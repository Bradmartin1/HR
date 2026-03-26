import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle2, AlertCircle, Download } from "lucide-react";

const REQUIRED_FIELDS = ["first_name","last_name","email","hire_date","department","job_title","employment_type","pay_type","pay_amount"];
const OPTIONAL_FIELDS = ["middle_name","phone","address_line1","city","state","zip","date_of_birth","cdl_driver","cdl_expiry_date"];

export default async function BulkUploadPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.role, "bulk_upload.import")) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Upload"
        description="Import multiple employees from a CSV file"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Upload CSV File</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-14 transition-colors cursor-pointer"
                style={{ borderColor: "hsl(188 100% 26% / 0.3)", backgroundColor: "hsl(188 100% 26% / 0.02)" }}
              >
                <div className="rounded-full p-4 mb-4" style={{ backgroundColor: "hsl(188 100% 26% / 0.08)" }}>
                  <Upload className="h-8 w-8" style={{ color: "hsl(188 100% 26%)" }} />
                </div>
                <p className="text-sm font-medium text-foreground">Drag & drop your CSV file here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse · Max 5MB · CSV only</p>
                <div
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                  style={{ borderColor: "hsl(188 100% 26% / 0.3)", color: "hsl(188 100% 26%)" }}
                >
                  <Download className="h-4 w-4" />
                  Download Template CSV
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Download the template", desc: "Use the template CSV to ensure correct column formatting." },
                  { step: "2", title: "Fill in employee data", desc: "Complete required fields for each employee row." },
                  { step: "3", title: "Upload and validate", desc: "The system will validate your data and flag any errors." },
                  { step: "4", title: "Review and confirm", desc: "Review the import preview, then confirm to create employees." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: "hsl(188 100% 26%)" }}>
                      {s.step}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" style={{ color: "hsl(140 60% 38%)" }} />
                Required Fields
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {REQUIRED_FIELDS.map(f => (
                  <div key={f} className="rounded px-2 py-1 text-xs font-mono" style={{ backgroundColor: "hsl(188 100% 26% / 0.06)", color: "hsl(188 100% 20%)" }}>
                    {f}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                Optional Fields
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {OPTIONAL_FIELDS.map(f => (
                  <div key={f} className="rounded px-2 py-1 text-xs font-mono bg-muted text-muted-foreground">
                    {f}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
