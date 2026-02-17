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
  showSign: boolean = true
): string {
  if (value > 0 && showSign) {
    return `¥${value.toFixed(2)}`;
  }
  if (value < 0) {
    return `-¥${Math.abs(value).toFixed(2)}`;
  }
  return `¥${value.toFixed(2)}`;
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
