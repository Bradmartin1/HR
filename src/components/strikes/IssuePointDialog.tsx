"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Loader2, AlertTriangle, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { issuePoint } from "@/app/(app)/strikes/actions";
import {
  ATTENDANCE_VIOLATIONS, PERFORMANCE_VIOLATIONS, VIOLATIONS,
  getViolationByCode, getThresholdForPoints, getNextThreshold, getTotalColor,
  type Violation,
} from "@/lib/constants/point-system";
import { PointsBadge } from "./PointsBadge";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
}

interface Props {
  employeeId?: string;
  employeeName?: string;
  currentPoints?: number;
  trigger?: React.ReactNode;
}

export function IssuePointDialog({ employeeId, employeeName, currentPoints, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeId ?? "");
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [empPoints, setEmpPoints] = useState<number>(currentPoints ?? 0);
  const [loadingPoints, setLoadingPoints] = useState(false);

  // Load employees list if not pre-filled
  useEffect(() => {
    if (!employeeId && open) {
      const supabase = createClient();
      supabase
        .from("employees")
        .select("id, first_name, last_name")
        .eq("status", "active")
        .is("deleted_at", null)
        .order("last_name")
        .then(({ data }) => setEmployees(data ?? []));
    }
  }, [employeeId, open]);

  // Load points when employee changes
  useEffect(() => {
    if (selectedEmployeeId && open) {
      setLoadingPoints(true);
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.rpc as any)("get_employee_active_points", { p_employee_id: selectedEmployeeId })
        .then(({ data }: { data: number | null }) => {
          setEmpPoints(typeof data === "number" ? data : 0);
          setLoadingPoints(false);
        });
    }
  }, [selectedEmployeeId, open]);

  const newTotal = empPoints + (selectedViolation?.points ?? 0);
  const currentThreshold = getThresholdForPoints(empPoints);
  const newThreshold = selectedViolation?.isTermination ? { step: 4, label: "Termination", points: 7, actionType: "termination" } : getThresholdForPoints(newTotal);
  const thresholdCrossed = newThreshold && (!currentThreshold || newThreshold.step > currentThreshold.step);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedEmployeeId || !selectedViolation) return;
    setError(null);

    const formData = new FormData();
    formData.set("employee_id", selectedEmployeeId);
    formData.set("violation_code", selectedViolation.code);
    formData.set("incident_date", incidentDate);
    if (notes.trim()) formData.set("notes", notes.trim());

    startTransition(async () => {
      try {
        await issuePoint(formData);
        setOpen(false);
        setSelectedViolation(null);
        setNotes("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to issue point");
      }
    });
  }

  function handleViolationChange(code: string) {
    setSelectedViolation(getViolationByCode(code) ?? null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Issue Point
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Issue Point</DialogTitle>
          <DialogDescription>Record an attendance or performance violation.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee */}
          {employeeId ? (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Employee</Label>
              <div className="text-sm font-semibold">{employeeName ?? "Employee"}</div>
              <input type="hidden" name="employee_id" value={employeeId} />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Employee <span className="text-destructive">*</span></Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.last_name}, {e.first_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Violation Type */}
          <div className="space-y-1.5">
            <Label>Violation Type <span className="text-destructive">*</span></Label>
            <Select value={selectedViolation?.code ?? ""} onValueChange={handleViolationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select violation" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Attendance</SelectLabel>
                  {ATTENDANCE_VIOLATIONS.map(v => (
                    <SelectItem key={v.code} value={v.code}>
                      {v.label} — {v.points} pt{v.points !== 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Performance</SelectLabel>
                  {PERFORMANCE_VIOLATIONS.map(v => (
                    <SelectItem key={v.code} value={v.code}>
                      {v.label} — {v.isTermination ? "TERM" : `${v.points} pts`}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Incident Date */}
          <div className="space-y-1.5">
            <Label>Incident Date <span className="text-destructive">*</span></Label>
            <Input type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} required />
          </div>

          {/* Auto Explanation */}
          {selectedViolation && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" /> Auto-Generated Explanation
              </Label>
              <div className="rounded-md border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                {selectedViolation.autoExplanation}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <div className="space-y-1.5">
            <Label>Additional Notes <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Textarea
              placeholder="Add any additional details or documentation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Separator />

          {/* Point Preview */}
          {selectedEmployeeId && (
            <div className="rounded-lg border p-3 space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Point Preview</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">Current</div>
                  <div className="text-lg font-bold" style={{ color: getTotalColor(empPoints) }}>
                    {loadingPoints ? "..." : empPoints.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">This Violation</div>
                  <div className="text-lg font-bold" style={{ color: "hsl(188 100% 26%)" }}>
                    {selectedViolation ? (selectedViolation.isTermination ? "TERM" : `+${selectedViolation.points}`) : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">New Total</div>
                  <div className="text-lg font-bold" style={{ color: selectedViolation?.isTermination ? "hsl(0 80% 40%)" : getTotalColor(newTotal) }}>
                    {selectedViolation ? (selectedViolation.isTermination ? "TERM" : newTotal.toFixed(1)) : "—"}
                  </div>
                </div>
              </div>

              {/* Threshold Warning */}
              {selectedViolation?.isTermination && (
                <div className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold" style={{ backgroundColor: "hsl(0 80% 92%)", color: "hsl(0 80% 30%)" }}>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  IMMEDIATE TERMINATION — Theft from Company
                </div>
              )}
              {!selectedViolation?.isTermination && thresholdCrossed && newThreshold && (
                <div className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold" style={{ backgroundColor: "hsl(16 88% 93%)", color: "hsl(16 88% 35%)" }}>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  This will trigger Step {newThreshold.step} — {newThreshold.label}
                </div>
              )}
              {!selectedViolation?.isTermination && !thresholdCrossed && (
                <div className="text-xs text-muted-foreground text-center">
                  {getNextThreshold(newTotal)
                    ? `${(getNextThreshold(newTotal)!.points - newTotal).toFixed(1)} points until Step ${getNextThreshold(newTotal)!.step} — ${getNextThreshold(newTotal)!.label}`
                    : currentThreshold ? `At Step ${currentThreshold.step} — ${currentThreshold.label}` : "No thresholds reached"
                  }
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !selectedEmployeeId || !selectedViolation}
              className="gap-2"
              style={{ backgroundColor: selectedViolation?.isTermination ? "hsl(0 80% 45%)" : "hsl(188 100% 26%)" }}
            >
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Issuing...</> : <><Plus className="h-4 w-4" /> Issue Point</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
