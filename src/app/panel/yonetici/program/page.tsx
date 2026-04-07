import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminScheduleManager } from "@/components/admin/admin-schedule-manager";
import type { CalendarSlot } from "@/components/ui/weekly-calendar";

export const metadata = { title: "Ders Programı | Edunova" };

export default async function AdminSchedulePage() {
  await requireAuth(["ADMIN"]);

  const [courses, lessonSlots] = await Promise.all([
    db.course.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        color: true,
      },
    }),
    db.lessonSlot.findMany({
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            teacher: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
  ]);

  const slotRecords = lessonSlots.map((slot) => ({
    id: slot.id,
    courseId: slot.courseId,
    courseName: slot.course.name,
    courseCode: slot.course.code,
    courseColor: slot.course.color,
    teacherName: `${slot.course.teacher.firstName} ${slot.course.teacher.lastName}`,
    enrollmentCount: slot.course._count.enrollments,
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
    room: slot.room,
  }));

  const calendarSlots: CalendarSlot[] = slotRecords.map((s) => ({
    id: s.id,
    courseName: s.courseName,
    courseCode: s.courseCode,
    courseColor: s.courseColor,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    room: s.room,
    teacherName: s.teacherName,
    enrollmentCount: s.enrollmentCount,
  }));

  return (
    <DashboardShell
      title="Ders Programı"
      description="Haftalık ders saatlerini oluşturun ve yönetin"
    >
      <AdminScheduleManager
        courses={courses}
        slots={slotRecords}
        calendarSlots={calendarSlots}
      />
    </DashboardShell>
  );
}
