import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDayLabel, getTodayDayOfWeek, formatTime } from "@/lib/utils";
import { Clock } from "lucide-react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

const dayEmojis: Record<string, string> = {
  MONDAY: "1️⃣",
  TUESDAY: "2️⃣",
  WEDNESDAY: "3️⃣",
  THURSDAY: "4️⃣",
  FRIDAY: "5️⃣",
  SATURDAY: "6️⃣",
  SUNDAY: "7️⃣",
};

export default async function StudentSchedulePage() {
  const session = await requireAuth(["STUDENT"]);
  const today = getTodayDayOfWeek();

  const lessonSlots = await db.lessonSlot.findMany({
    where: {
      course: {
        enrollments: { some: { studentId: session.user.id } },
      },
    },
    include: {
      course: {
        select: {
          name: true,
          code: true,
          color: true,
          teacher: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { startTime: "asc" },
  });

  const slotsByDay = DAYS.map((day) => ({
    day,
    label: getDayLabel(day),
    emoji: dayEmojis[day],
    isToday: day === today,
    slots: lessonSlots.filter((s) => s.dayOfWeek === day),
  }));

  const totalWeeklyLessons = lessonSlots.length;

  return (
    <DashboardShell
      title="📅 Ders Programı"
      description={`Haftalık ${totalWeeklyLessons} ders`}
    >
      <div className="space-y-4">
        {slotsByDay.map(({ day, label, emoji, isToday, slots }) => (
          <Card
            key={day}
            className={isToday ? "ring-2 ring-primary/40 shadow-md" : "shadow-sm"}
          >
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg">{emoji}</span>
                <h3 className="font-bold">{label}</h3>
                {isToday && (
                  <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 border-0 text-white">
                    Bugün
                  </Badge>
                )}
                <span className="ml-auto text-sm text-muted-foreground">
                  {slots.length === 0 ? "Ders yok 🎉" : `${slots.length} ders`}
                </span>
              </div>
              {slots.length === 0 ? (
                <p className="py-1 text-sm text-muted-foreground">
                  Bu gün rahatsın! 😎
                </p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center gap-4 rounded-2xl bg-accent/30 p-3 transition-all hover:bg-accent/60"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white"
                        style={{ backgroundColor: slot.course.color }}
                      >
                        {slot.course.code.slice(0, 3)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{slot.course.name}</p>
                        <p className="text-xs text-muted-foreground">
                          👨‍🏫 {slot.course.teacher.firstName} {slot.course.teacher.lastName}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </span>
                        {slot.room && (
                          <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-medium shadow-sm">
                            📍 {slot.room}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
