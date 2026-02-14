import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals: number = 4): string {
  return value.toFixed(decimals);
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

export function formatCurrency(value: number, currency: string = "¥"): string {
  return `${currency}${value.toFixed(2)}`;
}

export function getChangeColor(value: number): string {
  if (value > 0) return "text-[#C41E3A]";
  if (value < 0) return "text-[#228B22]";
  return "text-[#1565C0]";
}

export function getChangeBgColor(value: number): string {
  if (value > 0) return "bg-[#C41E3A]";
  if (value < 0) return "bg-[#228B22]";
  return "bg-[#1565C0]";
}
