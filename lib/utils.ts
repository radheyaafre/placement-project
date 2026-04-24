import type { MissionStatus, TaskType } from "@/types/domain";

export function toDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function shiftDays(date: Date, delta: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
}

export function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function formatTaskType(taskType: TaskType) {
  return {
    aptitude: "Aptitude",
    dsa: "DSA",
    sql: "SQL",
    hr: "HR",
    revision: "Revision"
  }[taskType];
}

export function formatStatus(status: MissionStatus) {
  return {
    locked: "Locked",
    available: "Available",
    attempted: "Attempted",
    solution_unlocked: "Solution unlocked",
    completed: "Completed",
    missed: "Missed"
  }[status];
}

export function formatWeekday(day: number) {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ][day]!;
}

export function formatPlanDate(date: Date) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ] as const;

  const day = `${date.getDate()}`.padStart(2, "0");
  const month = months[date.getMonth()]!;
  const year = date.getFullYear();

  return `${day}-${month}-${year} ${formatWeekday(date.getDay())}`;
}

export function formatHour12(hour: number) {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized >= 12 ? "PM" : "AM";
  const displayHour = normalized % 12 || 12;

  return `${displayHour} ${suffix}`;
}

export function buildRedirect(pathname: string, params: Record<string, string>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function getSafeNextPath(
  value: string | null | undefined,
  fallback = "/dashboard"
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export function splitParagraphs(value: string | null | undefined) {
  return (value || "")
    .split(/\n{2,}|\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function asArray<T>(value: T | T[] | null | undefined) {
  if (!value) {
    return [] as T[];
  }

  return Array.isArray(value) ? value : [value];
}

export function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function percent(value: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export function looksLikeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}
