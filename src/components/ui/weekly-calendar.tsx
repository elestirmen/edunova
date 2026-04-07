"use client";

import { cn, getDayLabel, getTodayDayOfWeek } from "@/lib/utils";
import { Clock, MapPin, User, Users } from "lucide-react";

type DayKey = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

const WEEKDAYS: DayKey[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

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

const HOUR_HEIGHT = 64;

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

  const activeDays = WEEKDAYS.filter((day) =>
    slots.some((s) => s.dayOfWeek === day)
  );
  const days = activeDays.length > 0 ? activeDays : WEEKDAYS.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Desktop Grid */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="grid border-b" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
            <div className="p-2 text-center text-[10px] font-medium text-muted-foreground">Saat</div>
            {days.map((day) => (
              <div key={day} className={cn("p-2 text-center border-l", day === today && "bg-primary/5")}>
                <p className={cn("text-xs font-semibold", day === today ? "text-primary" : "text-foreground")}>{getDayLabel(day)}</p>
                {day === today && <p className="text-[10px] text-primary font-medium">Bugün</p>}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="relative grid" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
            {/* Time labels + grid lines */}
            <div className="relative" style={{ height: totalHours * HOUR_HEIGHT }}>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 flex items-start justify-center border-b border-dashed border-muted"
                  style={{ top: (hour - startHour) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                >
                  <span className="mt-[-9px] bg-background px-1 text-[10px] text-muted-foreground">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day) => {
              const daySlots = slots.filter((s) => s.dayOfWeek === day);
              return (
                <div
                  key={day}
                  className={cn("relative border-l", day === today && "bg-primary/[0.02]")}
                  style={{ height: totalHours * HOUR_HEIGHT }}
                >
                  {/* Hour grid lines */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 border-b border-dashed border-muted/60"
                      style={{ top: (hour - startHour) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                    />
                  ))}

                  {/* Lesson blocks */}
                  {daySlots.map((slot) => {
                    const startMin = timeToMinutes(slot.startTime);
                    const endMin = timeToMinutes(slot.endTime);
                    const top = ((startMin - startHour * 60) / 60) * HOUR_HEIGHT;
                    const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;

                    return (
                      <div
                        key={slot.id}
                        className="absolute left-1 right-1 z-10 overflow-hidden rounded-md border shadow-sm transition-shadow hover:shadow-md cursor-default"
                        style={{
                          top: `${top}px`,
                          height: `${Math.max(height, 28)}px`,
                          backgroundColor: slot.courseColor + "18",
                          borderColor: slot.courseColor + "40",
                        }}
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[3px]"
                          style={{ backgroundColor: slot.courseColor }}
                        />
                        <div className="pl-2 pr-1 py-1">
                          <p className="text-[11px] font-semibold leading-tight truncate" style={{ color: slot.courseColor }}>
                            {slot.courseName}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {slot.startTime} - {slot.endTime}
                          </p>
                          {height >= 50 && slot.room && (
                            <p className="text-[10px] text-muted-foreground truncate flex items-center gap-0.5">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />{slot.room}
                            </p>
                          )}
                          {height >= 65 && variant !== "student" && slot.teacherName && (
                            <p className="text-[10px] text-muted-foreground truncate flex items-center gap-0.5">
                              <User className="h-2.5 w-2.5 shrink-0" />{slot.teacherName}
                            </p>
                          )}
                          {height >= 65 && variant === "admin" && slot.enrollmentCount !== undefined && (
                            <p className="text-[10px] text-muted-foreground truncate flex items-center gap-0.5">
                              <Users className="h-2.5 w-2.5 shrink-0" />{slot.enrollmentCount} öğrenci
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

      {/* Mobile: Compact day-by-day view */}
      <div className="md:hidden space-y-2">
        {days.map((day) => {
          const daySlots = slots
            .filter((s) => s.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          if (daySlots.length === 0) return null;

          return (
            <div key={day} className={cn("rounded-lg border p-3", day === today && "ring-2 ring-primary/40")}>
              <div className="mb-2 flex items-center justify-between">
                <p className={cn("text-sm font-semibold", day === today && "text-primary")}>
                  {getDayLabel(day)}
                  {day === today && <span className="ml-1.5 text-[10px] font-normal text-primary">(Bugün)</span>}
                </p>
                <span className="text-[11px] text-muted-foreground">{daySlots.length} ders</span>
              </div>
              <div className="space-y-1.5">
                {daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-2.5 rounded-md p-2"
                    style={{ backgroundColor: slot.courseColor + "10" }}
                  >
                    <div
                      className="h-8 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: slot.courseColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{slot.courseName}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{slot.startTime}-{slot.endTime}</span>
                        {slot.room && <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{slot.room}</span>}
                      </div>
                    </div>
                    {variant === "admin" && slot.teacherName && (
                      <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:block">{slot.teacherName}</span>
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
