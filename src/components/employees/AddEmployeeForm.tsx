"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEmployee } from "@/app/(app)/employees/new/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";

interface Department { id: string; name: string; code: string; }
interface JobTitle { id: string; title: string; department_id: string | null; }
interface Location { id: string; name: string; }

interface Props {
  departments: Department[];
  jobTitles: JobTitle[];
  locations: Location[];
}

export function AddEmployeeForm({ departments, jobTitles, locations }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [isDriver, setIsDriver] = useState(false);

  const filteredTitles = selectedDept
    ? jobTitles.filter(t => t.department_id === selectedDept || t.department_id === null)
    : jobTitles;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("is_driver", isDriver ? "true" : "false");
    if (selectedDept) formData.set("department_id", selectedDept);

    startTransition(async () => {
      try {
        await createEmployee(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create employee");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="first_name">First Name <span className="text-destructive">*</span></Label>
            <Input id="first_name" name="first_name" placeholder="John" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_name">Last Name <span className="text-destructive">*</span></Label>
            <Input id="last_name" name="last_name" placeholder="Smith" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preferred_name">Preferred Name</Label>
            <Input id="preferred_name" name="preferred_name" placeholder="Optional" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="work_email">Work Email</Label>
            <Input id="work_email" name="work_email" type="email" placeholder="john@rushtownpoultry.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="personal_phone">Phone</Label>
            <Input id="personal_phone" name="personal_phone" type="tel" placeholder="(555) 123-4567" />
          </div>
        </CardContent>
      </Card>

      {/* Employment Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Employment Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="hire_date">Hire Date <span className="text-destructive">*</span></Label>
            <Input id="hire_date" name="hire_date" type="date" required />
          </div>
          <div className="space-y-1.5">
            <Label>Status <span className="text-destructive">*</span></Label>
            <Select name="status" defaultValue="active" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Employment Type <span className="text-destructive">*</span></Label>
            <Select name="employment_type" defaultValue="full_time" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full Time</SelectItem>
                <SelectItem value="part_time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="temporary">Temporary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select onValueChange={setSelectedDept}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Job Title</Label>
            <Select name="job_title_id">
              <SelectTrigger>
                <SelectValue placeholder="Select title" />
              </SelectTrigger>
              <SelectContent>
                {filteredTitles.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Select name="location_id">
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* CDL */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Driver Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="is_driver"
              checked={isDriver}
              onCheckedChange={(v) => setIsDriver(v === true)}
            />
            <Label htmlFor="is_driver" className="cursor-pointer">This employee is a CDL driver</Label>
          </div>
          {isDriver && (
            <div className="space-y-1.5 max-w-xs">
              <Label htmlFor="cdl_expiry">CDL Expiry Date</Label>
              <Input id="cdl_expiry" name="cdl_expiry" type="date" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compensation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Starting Compensation</CardTitle>
          <p className="text-xs text-muted-foreground">Optional — can be added later from the Compensation tab</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Pay Type</Label>
            <Select name="pay_type">
              <SelectTrigger>
                <SelectValue placeholder="Select pay type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay_amount">Amount</Label>
            <Input id="pay_amount" name="pay_amount" type="number" step="0.01" min="0" placeholder="0.00" />
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Link href="/employees">
          <Button type="button" variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isPending} className="gap-2" style={{ backgroundColor: "hsl(188 100% 26%)" }}>
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
          ) : (
            <><UserPlus className="h-4 w-4" /> Create Employee</>
          )}
        </Button>
      </div>
    </form>
  );
}
