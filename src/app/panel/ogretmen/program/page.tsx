import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDayLabel, getTodayDayOfWeek, formatTime } from "@/lib/utils";
import { Clock, MapPin, Users } from "lucide-react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

export default async function TeacherSchedulePage() {
  const session = await requireAuth(["TEACHER"]);
  const today = getTodayDayOfWeek();

  const lessonSlots = await db.lessonSlot.findMany({
    where: { course: { teacherId: session.user.id } },
    include: {
      course: {
        select: {
          name: true,
          code: true,
          color: true,
          _count: { select: { enrollments: true } },
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

  return (
    <DashboardShell title="Ders Programı" description="Haftalık ders programınız">
      <div className="space-y-4">
        {slotsByDay.map(({ day, label, isToday, slots }) => (
          <Card key={day} className={isToday ? "ring-2 ring-primary/50" : ""}>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <h3 className="font-semibold">{label}</h3>
                {isToday && <Badge>Bugün</Badge>}
                <span className="ml-auto text-sm text-muted-foreground">
                  {slots.length} ders
                </span>
              </div>
              {slots.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">
                  Bu gün ders bulunmuyor.
                </p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center gap-4 rounded-lg bg-muted/50 p-3"
                    >
                      <div
                        className="h-10 w-1 rounded-full"
                        style={{ backgroundColor: slot.course.color }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{slot.course.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {slot.course._count.enrollments} öğrenci
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </span>
                        {slot.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {slot.room}
                          </span>
                        )}
                      </div>
                      <Badge variant="outline">{slot.course.code}</Badge>
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
