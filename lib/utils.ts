import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number, showSign: boolean = true): string {
  const formatted = Math.abs(value).toFixed(2);
  if (value > 0 && showSign) {
    return `+${formatted}%`;
  }
  if (value < 0) {
    return `-${formatted}%`;
  }
  return `${formatted}%`;
}

export function formatCurrency(
  value: number,
  showSign: boolean = true,
  fixed: number = 2
): string {
  if (value > 0 && showSign) {
    return `¥${value.toFixed(fixed)}`;
  }
  if (value < 0) {
    return `-¥${Math.abs(value).toFixed(fixed)}`;
  }
  return `¥${value.toFixed(fixed)}`;
}

export function getChangeColor(value: number): string {
  if (value > 0) return "text-finance-rise";
  if (value < 0) return "text-finance-fall";
  return "text-finance-neutral";
}

export function getChangeBgColor(value: number): string {
  if (value > 0) return "bg-finance-rise";
  if (value < 0) return "bg-finance-fall";
  return "bg-finance-neutral";
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(
  data: Record<string, unknown>[],
  headers: string[]
): string {
  const headerRow = headers.join(",");
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const value = row[h];
        if (value === null || value === undefined) return "";
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(",")
  );
  return "\uFEFF" + [headerRow, ...rows].join("\n");
}

export function exportToJSON(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row;
  });
}

function parseCSVLine(line: string): string[] {
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

export function parseJSON(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

