// Cairo timezone helpers — robust to DST (Egypt is +02 winter / +03 summer
// since 2023) and to server timezone. Both local dev (Cairo) and Vercel
// (UTC) produce the same boundary.

const TZ = "Africa/Cairo";

function cairoOffset(at: Date): string {
  const tz =
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      timeZoneName: "longOffset",
    })
      .formatToParts(at)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT+03:00";
  return tz.replace("GMT", "") || "+03:00";
}

function cairoDateParts(at: Date): { y: string; m: string; d: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at);
  return {
    y: parts.find((p) => p.type === "year")!.value,
    m: parts.find((p) => p.type === "month")!.value,
    d: parts.find((p) => p.type === "day")!.value,
  };
}

export function cairoStartOfDay(at: Date = new Date()): Date {
  const { y, m, d } = cairoDateParts(at);
  return new Date(`${y}-${m}-${d}T00:00:00${cairoOffset(at)}`);
}

export function cairoStartOfMonth(at: Date = new Date()): Date {
  const { y, m } = cairoDateParts(at);
  return new Date(`${y}-${m}-01T00:00:00${cairoOffset(at)}`);
}
