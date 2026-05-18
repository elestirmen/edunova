import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminPayoutsManager } from "@/components/admin/admin-payouts-manager";

export const metadata = { title: "Öğretmen Hakediş | Edunova" };

export default async function AdminPayoutsPage() {
  await requireAuth(["ADMIN"]);

  const teachers = await db.user.findMany({
    where: { role: "TEACHER", isActive: true },
    select: { id: true, firstName: true, lastName: true, email: true },
    orderBy: { firstName: "asc" },
  });

  const summary = await Promise.all(
    teachers.map(async (t) => {
      const [pending, lastPayout] = await Promise.all([
        db.teacherEarning.aggregate({
          where: { teacherId: t.id, payoutId: null },
          _sum: { amount: true, hours: true },
          _count: { id: true },
        }),
        db.teacherPayout.findFirst({
          where: { teacherId: t.id },
          orderBy: { createdAt: "desc" },
        }),
      ]);
      return {
        teacher: t,
        pendingAmount: Number(pending._sum.amount ?? 0),
        pendingHours: Number(pending._sum.hours ?? 0),
        pendingCount: pending._count.id,
        lastPayoutAmount: lastPayout ? Number(lastPayout.amount) : null,
        lastPayoutDate: lastPayout?.paidAt?.toISOString() ?? null,
        lastPayoutPending: lastPayout && !lastPayout.paidAt ? lastPayout.id : null,
      };
    })
  );

  const payouts = await db.teacherPayout.findMany({
    include: { teacher: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <DashboardShell
      title="Öğretmen Hakediş"
      description="Ödenmemiş hakedişleri görüntüle ve ödeme yap"
    >
      <AdminPayoutsManager
        summary={summary}
        payouts={payouts.map((p) => ({
          id: p.id,
          teacherName: `${p.teacher.firstName} ${p.teacher.lastName}`,
          amount: Number(p.amount),
          periodStart: p.periodStart.toISOString(),
          periodEnd: p.periodEnd.toISOString(),
          paidAt: p.paidAt?.toISOString() ?? null,
          paymentRef: p.paymentRef,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </DashboardShell>
  );
}
