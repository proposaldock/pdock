import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function truncate(value: string, maxLength = 180) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}...`;
}

export function isOverdue(value: string | null | undefined) {
  if (!value) return false;

  const today = new Date();
  const todayKey = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const due = new Date(`${value}T00:00:00Z`);

  return due < todayKey;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
