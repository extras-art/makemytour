import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates a human-readable duration between departure and arrival timestamps.
 * e.g., "2h 35m"
 */
export function calculateDuration(departureTime?: string, arrivalTime?: string): string {
  if (!departureTime || !arrivalTime) return "2h 30m";
  const dep = new Date(departureTime).getTime();
  const arr = new Date(arrivalTime).getTime();
  if (isNaN(dep) || isNaN(arr) || arr <= dep) return "2h 00m";
  const diffMinutes = Math.floor((arr - dep) / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${hours}h ${minutes}m`;
}

/**
 * Formats an ISO date/time string for readable flight and booking display.
 */
export function formatDateTime(dateString?: string): string {
  if (!dateString) return "Date unavailable";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}
