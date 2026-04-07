import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminCoursesManager } from "@/components/admin/admin-courses-manager";

export default async function AdminCoursesPage() {
  await requireAuth(["ADMIN"]);

  const [courses, teachers, students] = await Promise.all([
    db.course.findMany({
      orderBy: { name: "asc" },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        enrollments: {
          select: {
            studentId: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            lessonSlots: true,
          },
        },
      },
    }),
    db.user.findMany({
      where: { role: "TEACHER" },
      orderBy: [{ isActive: "desc" }, { firstName: "asc" }, { lastName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
      },
    }),
    db.user.findMany({
      where: { role: "STUDENT" },
      orderBy: [{ isActive: "desc" }, { firstName: "asc" }, { lastName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
      },
    }),
  ]);

  return (
    <DashboardShell
      title="Ders Yönetimi"
      description="Ders oluşturun, öğretmen atayın ve öğrenci kayıtlarını yönetin"
    >
      <AdminCoursesManager
        teachers={teachers}
        students={students}
        courses={courses.map((course) => ({
          id: course.id,
          name: course.name,
          code: course.code,
          description: course.description,
          color: course.color,
          isActive: course.isActive,
          teacherId: course.teacherId,
          teacherName: `${course.teacher.firstName} ${course.teacher.lastName}`,
          enrollmentCount: course._count.enrollments,
          lessonSlotCount: course._count.lessonSlots,
          enrolledStudentIds: course.enrollments.map(
            (enrollment) => enrollment.studentId
          ),
        }))}
      />
    </DashboardShell>
  );
}
