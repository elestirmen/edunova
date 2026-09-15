"use client";

import { useEffect, useState } from "react";
import { cn, getDayLabel, getDayShortLabel, getTodayDayOfWeek } from "@/lib/utils";
import { CalendarDays, Clock, MapPin, User, Users } from "lucide-react";

type DayKey =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

const WEEKDAYS: DayKey[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export interface CalendarSlot {
  id: string;
  courseName: string;
  courseCode: string;
  courseColor: string;
  dayOfWeek: DayKey;
  startTime: string;
  endTime: string;
  room: string | null;
  teacherName?: string;
  enrollmentCount?: number;
}

interface WeeklyCalendarProps {
  slots: CalendarSlot[];
  variant?: "student" | "teacher" | "admin";
}

const HOUR_HEIGHT = 72;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getTimeRange(slots: CalendarSlot[]): { startHour: number; endHour: number } {
  if (slots.length === 0) return { startHour: 8, endHour: 17 };

  let minMinutes = Infinity;
  let maxMinutes = -Infinity;

  for (const slot of slots) {
    const start = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);
    if (start < minMinutes) minMinutes = start;
    if (end > maxMinutes) maxMinutes = end;
  }

  const startHour = Math.floor(minMinutes / 60);
  const endHour = Math.ceil(maxMinutes / 60);

  return {
    startHour: Math.max(0, startHour - 1),
    endHour: Math.min(24, endHour + 1),
  };
}

export function WeeklyCalendar({ slots, variant = "student" }: WeeklyCalendarProps) {
  const today = getTodayDayOfWeek();
  const { startHour, endHour } = getTimeRange(slots);
  const totalHours = endHour - startHour;
  const hours = Array.from({ length: totalHours }, (_, i) => startHour + i);

  // "Şu an" çizgisi yalnızca istemcide — sunucu/istemci farkı oluşmasın
  const [nowMinutes, setNowMinutes] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setNowMinutes(now.getHours() * 60 + now.getMinutes());
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const activeDays = WEEKDAYS.filter((day) => slots.some((s) => s.dayOfWeek === day));
  const days = activeDays.length > 0 ? activeDays : WEEKDAYS.slice(0, 5);

  const nowTop =
    nowMinutes !== null && nowMinutes >= startHour * 60 && nowMinutes <= endHour * 60
      ? ((nowMinutes - startHour * 60) / 60) * HOUR_HEIGHT
      : null;

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <CalendarDays className="h-5 w-5" />
        </span>
        <p className="text-sm font-semibold">Programda ders yok</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Ders saatleri tanımlandığında haftalık program burada görünecek.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ---------- Masaüstü ızgara ---------- */}
      <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Başlık */}
            <div
              className="grid border-b bg-muted/40"
              style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}
            >
              <div className="p-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Saat
              </div>
              {days.map((day) => (
                <div
                  key={day}
                  className={cn(
                    "border-l p-3 text-center",
                    day === today && "bg-primary/[0.06]"
                  )}
                >
                  <p
                    className={cn(
                      "text-[13px] font-semibold tracking-tight",
                      day === today ? "text-primary" : "text-foreground"
                    )}
                  >
                    {getDayLabel(day)}
                  </p>
                  {day === today && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Bugün
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Gövde */}
            <div
              className="relative grid"
              style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}
            >
              {/* Saat sütunu */}
              <div className="relative" style={{ height: totalHours * HOUR_HEIGHT }}>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-b border-border/60"
                    style={{ top: (hour - startHour) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                  >
                    <span className="tabular absolute -top-2 right-2 bg-card px-1 text-[10px] font-medium text-muted-foreground">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Gün sütunları */}
              {days.map((day) => {
                const daySlots = slots.filter((s) => s.dayOfWeek === day);
                return (
                  <div
                    key={day}
                    className={cn(
                      "relative border-l",
                      day === today && "bg-primary/[0.03]"
                    )}
                    style={{ height: totalHours * HOUR_HEIGHT }}
                  >
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="absolute left-0 right-0 border-b border-border/50"
                        style={{
                          top: (hour - startHour) * HOUR_HEIGHT,
                          height: HOUR_HEIGHT,
                        }}
                      />
                    ))}

                    {/* Şu an çizgisi */}
                    {day === today && nowTop !== null && (
                      <div
                        className="pointer-events-none absolute left-0 right-0 z-20"
                        style={{ top: nowTop }}
                      >
                        <div className="relative h-px bg-destructive/70">
                          <span className="absolute -left-1 -top-[3px] h-[7px] w-[7px] rounded-full bg-destructive" />
                        </div>
                      </div>
                    )}

                    {/* Ders blokları */}
                    {daySlots.map((slot) => {
                      const startMin = timeToMinutes(slot.startTime);
                      const endMin = timeToMinutes(slot.endTime);
                      const top = ((startMin - startHour * 60) / 60) * HOUR_HEIGHT;
                      const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;

                      return (
                        <div
                          key={slot.id}
                          className="group absolute left-1.5 right-1.5 z-10 overflow-hidden rounded-xl border shadow-xs transition-all duration-200 ease-premium hover:z-20 hover:shadow-md"
                          style={{
                            top: `${top}px`,
                            height: `${Math.max(height - 3, 30)}px`,
                            backgroundColor: `${slot.courseColor}14`,
                            borderColor: `${slot.courseColor}3d`,
                          }}
                        >
                          <div
                            className="absolute inset-y-0 left-0 w-[3px]"
                            style={{ backgroundColor: slot.courseColor }}
                          />
                          <div className="py-1.5 pl-3 pr-2">
                            <p
                              className="truncate text-[11px] font-semibold leading-tight"
                              style={{ color: slot.courseColor }}
                            >
                              {slot.courseName}
                            </p>
                            <p className="tabular truncate text-[10px] text-muted-foreground">
                              {slot.startTime}–{slot.endTime}
                            </p>
                            {height >= 56 && slot.room && (
                              <p className="flex items-center gap-0.5 truncate text-[10px] text-muted-foreground">
                                <MapPin className="h-2.5 w-2.5 shrink-0" />
                                {slot.room}
                              </p>
                            )}
                            {height >= 72 && variant !== "student" && slot.teacherName && (
                              <p className="flex items-center gap-0.5 truncate text-[10px] text-muted-foreground">
                                <User className="h-2.5 w-2.5 shrink-0" />
                                {slot.teacherName}
                              </p>
                            )}
                            {height >= 72 &&
                              variant === "admin" &&
                              slot.enrollmentCount !== undefined && (
                                <p className="flex items-center gap-0.5 truncate text-[10px] text-muted-foreground">
                                  <Users className="h-2.5 w-2.5 shrink-0" />
                                  {slot.enrollmentCount} öğrenci
                                </p>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Mobil gün listesi ---------- */}
      <div className="space-y-3 md:hidden">
        {days.map((day) => {
          const daySlots = slots
            .filter((s) => s.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          if (daySlots.length === 0) return null;

          return (
            <div
              key={day}
              className={cn(
                "overflow-hidden rounded-2xl border bg-card shadow-sm",
                day === today && "border-primary/30 ring-1 ring-primary/15"
              )}
            >
              <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex h-7 w-9 items-center justify-center rounded-lg text-[11px] font-bold",
                      day === today
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {getDayShortLabel(day)}
                  </span>
                  <p
                    className={cn(
                      "text-[13px] font-semibold",
                      day === today && "text-primary"
                    )}
                  >
                    {getDayLabel(day)}
                  </p>
                </div>
                <span className="tabular text-[11px] text-muted-foreground">
                  {daySlots.length} ders
                </span>
              </div>

              <div className="divide-y divide-border/60">
                {daySlots.map((slot) => (
                  <div key={slot.id} className="flex items-center gap-3 px-3 py-2.5">
                    <span
                      className="h-9 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slot.courseColor }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">
                        {slot.courseName}
                      </p>
                      <div className="tabular flex items-center gap-2.5 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {slot.startTime}–{slot.endTime}
                        </span>
                        {slot.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {slot.room}
                          </span>
                        )}
                      </div>
                    </div>
                    {variant !== "student" && slot.teacherName && (
                      <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">
                        {slot.teacherName}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
