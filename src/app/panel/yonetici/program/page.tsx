import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminScheduleManager } from "@/components/admin/admin-schedule-manager";

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

  return (
    <DashboardShell
      title="Ders Programı"
      description="Haftalık ders saatlerini oluşturun ve yönetin"
    >
      <AdminScheduleManager
        courses={courses}
        slots={lessonSlots.map((slot) => ({
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
        }))}
      />
    </DashboardShell>
  );
}
