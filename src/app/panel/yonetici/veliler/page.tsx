import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminParentsManager } from "@/components/admin/admin-parents-manager";

export const metadata = { title: "Veliler | Edunova" };

export default async function AdminParentsPage() {
  await requireAuth(["ADMIN"]);

  const [parents, students, links] = await Promise.all([
    db.user.findMany({
      where: { role: "PARENT", isActive: true },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: "asc" },
    }),
    db.user.findMany({
      where: { role: "STUDENT", isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
    db.parentStudent.findMany({
      include: {
        parent: { select: { firstName: true, lastName: true } },
        student: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  return (
    <DashboardShell title="Veliler" description="Veli-öğrenci eşleştirmeleri">
      <AdminParentsManager
        parents={parents}
        students={students}
        links={links.map((l) => ({
          parentId: l.parentId,
          studentId: l.studentId,
          parentName: `${l.parent.firstName} ${l.parent.lastName}`,
          studentName: `${l.student.firstName} ${l.student.lastName}`,
        }))}
      />
    </DashboardShell>
  );
}
