import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StudentAssignmentsView } from "@/components/student/student-assignments-view";

export const metadata = { title: "Ödevlerim | Edunova" };

export default async function StudentAssignmentsPage() {
  const session = await requireAuth(["STUDENT"]);

  const assignments = await db.assignment.findMany({
    where: {
      course: { enrollments: { some: { studentId: session.user.id } } },
    },
    include: {
      course: { select: { name: true, code: true } },
      submissions: { where: { studentId: session.user.id } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  return (
    <DashboardShell title="Ödevlerim" description="Sana atanan ödevleri görüntüle ve teslim et">
      <StudentAssignmentsView
        assignments={assignments.map((a) => {
          const mine = a.submissions[0];
          return {
            id: a.id,
            title: a.title,
            description: a.description,
            courseName: a.course.name,
            dueDate: a.dueDate?.toISOString() ?? null,
            maxGrade: a.maxGrade,
            submission: mine
              ? {
                  id: mine.id,
                  status: mine.status,
                  grade: mine.grade,
                  feedback: mine.feedback,
                  textAnswer: mine.textAnswer,
                  fileUrl: mine.fileUrl,
                  submittedAt: mine.submittedAt?.toISOString() ?? null,
                }
              : null,
          };
        })}
      />
    </DashboardShell>
  );
}
