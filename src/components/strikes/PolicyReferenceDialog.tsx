"use client";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import {
  ATTENDANCE_VIOLATIONS, PERFORMANCE_VIOLATIONS, POINT_THRESHOLDS,
  POINT_ROLLOFF_MONTHS, PROBATION_DAYS, PTO_ADVANCE_DAYS,
} from "@/lib/constants/point-system";

export function PolicyReferenceDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          View Policy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg">Attendance & Performance Policy</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            This policy applies to employees AFTER their {PROBATION_DAYS}-day probationary period.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="px-6 pb-6" style={{ maxHeight: "calc(85vh - 100px)" }}>
          <div className="space-y-6">
            {/* Attendance Table */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Attendance Points</h3>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left font-semibold px-3 py-2">Absence Type</th>
                      <th className="text-center font-semibold px-3 py-2 w-20">Points</th>
                      <th className="text-left font-semibold px-3 py-2">Explanation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ATTENDANCE_VIOLATIONS.map((v, i) => (
                      <tr key={v.code} className={i % 2 === 1 ? "bg-muted/40" : ""}>
                        <td className="px-3 py-2 font-medium">{v.label}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="inline-flex items-center justify-center rounded-full px-2 py-0.5 font-bold" style={{ backgroundColor: "hsl(188 100% 26% / 0.1)", color: "hsl(188 100% 26%)" }}>
                            {v.points}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{v.autoExplanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground italic">
                * Employees are required to use PTO in the event of an absence. If PTO is used, they will not receive a point. If they do not have PTO to cover the absence, they will receive a point.
              </p>
            </div>

            {/* Performance Table */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Performance Points</h3>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left font-semibold px-3 py-2">Performance Area</th>
                      <th className="text-center font-semibold px-3 py-2 w-24">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERFORMANCE_VIOLATIONS.map((v, i) => (
                      <tr key={v.code} className={i % 2 === 1 ? "bg-muted/40" : ""}>
                        <td className="px-3 py-2 font-medium">
                          {v.label}
                          {v.plantOnly && <span className="ml-1.5 text-[10px] text-muted-foreground">(Plant Only)</span>}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {v.isTermination ? (
                            <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 font-bold text-red-700">TERM</span>
                          ) : (
                            <span className="inline-flex items-center justify-center rounded-full px-2 py-0.5 font-bold" style={{ backgroundColor: "hsl(188 100% 26% / 0.1)", color: "hsl(188 100% 26%)" }}>
                              {v.points}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Disciplinary Thresholds */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Disciplinary Actions</h3>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-center font-semibold px-3 py-2 w-20">Points</th>
                      <th className="text-left font-semibold px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {POINT_THRESHOLDS.map((t, i) => (
                      <tr key={t.step} className={i % 2 === 1 ? "bg-muted/40" : ""}>
                        <td className="px-3 py-2 text-center font-bold">{t.points}</td>
                        <td className="px-3 py-2 font-medium">Step {t.step} — {t.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Attendance and performance points accumulate together. All warnings are to be documented by the manager/supervisor and reviewed with the employee.
              </p>
            </div>

            {/* Additional Rules */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Additional Rules</h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: "hsl(188 100% 26%)" }} />
                  <span><strong>Point Rolloff:</strong> 1 point will fall off every {POINT_ROLLOFF_MONTHS} months.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: "hsl(188 100% 26%)" }} />
                  <span><strong>Scheduling PTO:</strong> Employees must schedule vacation or PTO {PTO_ADVANCE_DAYS} days in advance by communicating with their manager/supervisor.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: "hsl(188 100% 26%)" }} />
                  <span><strong>Probation:</strong> Policy applies after the {PROBATION_DAYS}-day probationary period. Actions during probation are at manager discretion.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: "hsl(188 100% 26%)" }} />
                  <span><strong>Transition:</strong> When transitioning to the new attendance policy, a strike will translate to 1 point.</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
