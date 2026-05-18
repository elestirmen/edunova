import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TeacherAssignmentsManager } from "@/components/teacher/teacher-assignments-manager";

export const metadata = { title: "Ödevler | Edunova" };

export default async function TeacherAssignmentsPage() {
  const session = await requireAuth(["TEACHER"]);

  const [courses, assignments] = await Promise.all([
    db.course.findMany({
      where: { teacherId: session.user.id, isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
    db.assignment.findMany({
      where: { course: { teacherId: session.user.id } },
      include: {
        course: { select: { name: true } },
        submissions: {
          include: {
            student: { select: { firstName: true, lastName: true, id: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <DashboardShell title="Ödevler" description="Ödev oluştur ve teslimleri değerlendir">
      <TeacherAssignmentsManager
        courses={courses}
        assignments={assignments.map((a) => ({
          id: a.id,
          courseId: a.courseId,
          courseName: a.course.name,
          title: a.title,
          description: a.description,
          dueDate: a.dueDate?.toISOString() ?? null,
          maxGrade: a.maxGrade,
          submissions: a.submissions.map((s) => ({
            id: s.id,
            studentId: s.studentId,
            studentName: `${s.student.firstName} ${s.student.lastName}`,
            status: s.status,
            grade: s.grade,
            feedback: s.feedback,
            submittedAt: s.submittedAt?.toISOString() ?? null,
            fileUrl: s.fileUrl,
            textAnswer: s.textAnswer,
          })),
        }))}
      />
    </DashboardShell>
  );
}
