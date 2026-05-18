import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminTopicsManager } from "@/components/admin/admin-topics-manager";

export const metadata = { title: "Müfredat | Edunova" };

export default async function AdminTopicsPage() {
  await requireAuth(["ADMIN"]);
  const [courses, topics] = await Promise.all([
    db.course.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
    db.topic.findMany({
      orderBy: [{ courseId: "asc" }, { order: "asc" }],
    }),
  ]);
  return (
    <DashboardShell title="Müfredat" description="Ders bazında konu ağacı">
      <AdminTopicsManager courses={courses} topics={topics.map((t) => ({
        id: t.id,
        courseId: t.courseId,
        name: t.name,
        order: t.order,
      }))} />
    </DashboardShell>
  );
}
