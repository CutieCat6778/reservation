
/**
 * Formats an ISO date string (e.g. "2025-04-15T18:30:00.000Z")
 * into a German-style readable string:
 * "15.04.2025, 18:30"
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);

  // Check for invalid date
  if (isNaN(date.getTime())) return "Ungültiges Datum";

  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats an ISO string (e.g. "2025-04-15T18:30:00.000Z")
 * → "15.04.2025, 18:30"
 * Perfect for guest-facing display
 */
export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return "–";

  const date = new Date(isoString);

  // Safety check
  if (isNaN(date.getTime())) return "Ungültiges Datum";

  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Alternative: only date
 * → "15.04.2025"
 */
export function formatDateOnly(isoString: string | null | undefined): string {
  if (!isoString) return "–";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Unbekannt";

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Only time
 * → "18:30"
 */
export function formatTime(isoString: string | null | undefined): string {
  if (!isoString) return "--:--";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * With weekday — great for dashboards
 * → "Di, 15.04.2025, 18:30"
 */
export function formatDateTimeWithWeekday(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Ungültiges Datum";

  return date.toLocaleString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const formatLocalDateTime = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}Z`;  
};
