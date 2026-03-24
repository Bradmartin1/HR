export interface CsvRow {
  [key: string]: string;
}

export interface ParseResult {
  headers: string[];
  rows: CsvRow[];
  errors: string[];
}

export function parseCsv(text: string): ParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) {
    return { headers: [], rows: [], errors: ["CSV file is empty"] };
  }

  const headers = parseCsvLine(lines[0]);
  const rows: CsvRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length !== headers.length) {
      errors.push(`Row ${i + 1}: expected ${headers.length} columns, got ${values.length}`);
      continue;
    }
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx]?.trim() ?? "";
    });
    rows.push(row);
  }

  return { headers, rows, errors };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function objectsToCsv(data: Record<string, unknown>[], headers?: string[]): string {
  if (data.length === 0) return "";
  const cols = headers ?? Object.keys(data[0]);
  const headerRow = cols.join(",");
  const rows = data.map((row) =>
    cols.map((col) => {
      const val = row[col] ?? "";
      const str = String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(",")
  );
  return [headerRow, ...rows].join("\n");
}
