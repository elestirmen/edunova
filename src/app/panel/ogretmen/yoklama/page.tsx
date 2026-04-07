import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TeacherAttendance } from "@/components/teacher/teacher-attendance";

export const metadata = { title: "Yoklama | Edunova" };

export default async function TeacherAttendancePage() {
  const session = await requireAuth(["TEACHER"]);

  const lessonSlots = await db.lessonSlot.findMany({
    where: { course: { teacherId: session.user.id } },
    include: {
      course: {
        select: {
          name: true,
          code: true,
          color: true,
          enrollments: {
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  const slots = lessonSlots.map((slot) => ({
    id: slot.id,
    courseName: slot.course.name,
    courseCode: slot.course.code,
    courseColor: slot.course.color,
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
    room: slot.room,
    students: slot.course.enrollments.map((e) => e.student),
  }));

  return (
    <DashboardShell title="Yoklama" description="Ders yoklaması alın">
      <TeacherAttendance lessonSlots={slots} />
    </DashboardShell>
  );
}
