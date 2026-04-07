import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { WeeklyCalendar } from "@/components/ui/weekly-calendar";
import type { CalendarSlot } from "@/components/ui/weekly-calendar";

export default async function StudentSchedulePage() {
  const session = await requireAuth(["STUDENT"]);

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

  const calendarSlots: CalendarSlot[] = lessonSlots.map((slot) => ({
    id: slot.id,
    courseName: slot.course.name,
    courseCode: slot.course.code,
    courseColor: slot.course.color,
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
    room: slot.room,
    teacherName: `${slot.course.teacher.firstName} ${slot.course.teacher.lastName}`,
  }));

  return (
    <DashboardShell
      title="Ders Programı"
      description={`Haftalık ${lessonSlots.length} ders`}
    >
      <WeeklyCalendar slots={calendarSlots} variant="student" />
    </DashboardShell>
  );
}
