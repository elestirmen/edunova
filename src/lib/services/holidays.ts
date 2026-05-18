import { db } from "@/lib/db";

function dateOnly(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export async function isHoliday(date: Date): Promise<boolean> {
  const h = await db.holiday.findUnique({ where: { date: dateOnly(date) } });
  return !!h;
}

export async function listHolidaysBetween(start: Date, end: Date) {
  return db.holiday.findMany({
    where: { date: { gte: dateOnly(start), lte: dateOnly(end) } },
    orderBy: { date: "asc" },
  });
}

export async function listHolidaysInMonth(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  return listHolidaysBetween(start, end);
}
