// Calendar/date utilities (local-timezone day arithmetic).
const DAY_MS = 86400000;

function parseDateValue(value) {
  if (!value) return null;
  if (value instanceof Date) return new Date(value.getTime());
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day), 12);
    }
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDateInputValue(value = new Date()) {
  const date = parseDateValue(value);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfLocalDay(value) {
  const date = parseDateValue(value);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffCalendarDays(later, earlier) {
  const left = startOfLocalDay(later);
  const right = startOfLocalDay(earlier);
  if (!left || !right) return 0;
  return Math.floor((left - right) / DAY_MS);
}

function formatShortDate(value, locale = "en-IN") {
  const date = parseDateValue(value);
  if (!date) return "";
  return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

function formatLongDate(value, locale = "en-IN") {
  const date = parseDateValue(value);
  if (!date) return "";
  return date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

function addCalendarDays(value, days) {
  const date = startOfLocalDay(value);
  if (!date) return null;
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export { DAY_MS, parseDateValue, toDateInputValue, startOfLocalDay, diffCalendarDays, formatShortDate, formatLongDate, addCalendarDays };
