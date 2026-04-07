import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDayLabel, getTodayDayOfWeek, formatTime } from "@/lib/utils";
import { Calendar, Clock, MapPin, User } from "lucide-react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

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
    isToday: day === today,
    slots: lessonSlots.filter((s) => s.dayOfWeek === day),
  }));

  const totalWeeklyLessons = lessonSlots.length;

  return (
    <DashboardShell
      title="Ders Programi"
      description={`Haftalik ${totalWeeklyLessons} ders`}
    >
      <div className="space-y-3">
        {slotsByDay.map(({ day, label, isToday, slots }) => (
          <Card key={day} className={isToday ? "ring-2 ring-primary/40" : ""}>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">{label}</h3>
                {isToday && <Badge className="text-[10px]">Bugun</Badge>}
                <span className="ml-auto text-xs text-muted-foreground">
                  {slots.length === 0 ? "Ders yok" : `${slots.length} ders`}
                </span>
              </div>
              {slots.length === 0 ? (
                <p className="py-1 text-xs text-muted-foreground">Bu gun boş.</p>
              ) : (
                <div className="space-y-1.5">
                  {slots.map((slot) => (
                    <div key={slot.id} className="flex items-center gap-3 rounded-lg bg-muted/40 p-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-bold text-white" style={{ backgroundColor: slot.course.color }}>
                        {slot.course.code.slice(0, 3)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{slot.course.name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {slot.course.teacher.firstName} {slot.course.teacher.lastName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-muted-foreground shrink-0">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </span>
                        {slot.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {slot.room}
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
