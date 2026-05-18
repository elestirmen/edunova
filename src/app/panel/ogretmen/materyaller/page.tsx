import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TeacherMaterialsManager } from "@/components/teacher/teacher-materials-manager";

export const metadata = { title: "Materyaller | Edunova" };

export default async function TeacherMaterialsPage() {
  const session = await requireAuth(["TEACHER"]);

  const [courses, materials] = await Promise.all([
    db.course.findMany({
      where: { teacherId: session.user.id, isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
    db.material.findMany({
      where: { course: { teacherId: session.user.id } },
      include: {
        course: { select: { name: true } },
        topic: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <DashboardShell title="Materyaller" description="Öğrencilerinle paylaştığın kaynaklar">
      <TeacherMaterialsManager
        courses={courses}
        materials={materials.map((m) => ({
          id: m.id,
          courseId: m.courseId,
          courseName: m.course.name,
          topicName: m.topic?.name ?? null,
          title: m.title,
          description: m.description,
          type: m.type,
          url: m.url,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </DashboardShell>
  );
}
