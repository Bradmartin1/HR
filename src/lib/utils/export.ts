import { objectsToCsv } from "./csv-parser";

export function downloadCsv(data: Record<string, unknown>[], filename: string): void {
  const csv = objectsToCsv(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function getExportFilename(prefix: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `${prefix}-${date}.csv`;
}
