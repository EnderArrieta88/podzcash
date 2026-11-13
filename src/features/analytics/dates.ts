import { DAY_MS } from "./config";

/**
 * Día de analítica en la zona configurada. Se usa para agrupar eventos y
 * agregados; por defecto UTC.
 */
export function analyticsDay(date = new Date()): string {
  const timeZone = process.env.ANALYTICS_TIMEZONE?.trim() || "UTC";

  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function dayRange(days: number): string[] {
  const result: string[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    result.push(analyticsDay(new Date(Date.now() - index * DAY_MS)));
  }

  return result;
}

export function dayListBetween(from: string, to: string): string[] {
  const start = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start > end
  ) {
    return dayRange(30);
  }

  const days: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end && days.length < 120) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days.length > 0 ? days : dayRange(30);
}
