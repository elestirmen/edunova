import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StudentGoalsManager } from "@/components/student/student-goals-manager";

export const metadata = { title: "Hedeflerim | Edunova" };

export default async function StudentGoalsPage() {
  const session = await requireAuth(["STUDENT"]);

  const goals = await db.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const active = goals.find((g) => !g.isCompleted);
  const completed = goals.filter((g) => g.isCompleted);

  return (
    <DashboardShell title="Hedeflerim" description="Kendi haftalık hedefini belirle">
      <StudentGoalsManager
        active={
          active
            ? {
                id: active.id,
                title: active.title,
                targetPerWeek: active.targetPerWeek,
                currentProgress: active.currentProgress,
                isSelfProposed: active.isSelfProposed,
              }
            : null
        }
        completed={completed.map((g) => ({
          id: g.id,
          title: g.title,
          targetPerWeek: g.targetPerWeek,
        }))}
      />
    </DashboardShell>
  );
}
