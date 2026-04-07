import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminGoalsManager } from "@/components/admin/admin-goals-manager";

export const metadata = { title: "Hedef Yönetimi | Edunova" };

export default async function AdminGoalsPage() {
  await requireAuth(["ADMIN"]);

  const [goals, students] = await Promise.all([
    db.goal.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findMany({
      where: { role: "STUDENT", isActive: true },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
  ]);

  return (
    <DashboardShell title="Hedef Yönetimi" description="Öğrenci haftalık hedeflerini oluşturun ve yönetin">
      <AdminGoalsManager
        goals={goals.map((g) => ({
          id: g.id,
          userId: g.userId,
          studentName: `${g.user.firstName} ${g.user.lastName}`,
          studentEmail: g.user.email,
          title: g.title,
          targetPerWeek: g.targetPerWeek,
          currentProgress: g.currentProgress,
          isCompleted: g.isCompleted,
          createdAt: g.createdAt.toISOString(),
        }))}
        students={students}
      />
    </DashboardShell>
  );
}
