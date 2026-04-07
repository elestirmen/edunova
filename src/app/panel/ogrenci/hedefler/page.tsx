import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { Target, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Hedeflerim | Edunova" };

export default async function StudentGoalsPage() {
  const session = await requireAuth(["STUDENT"]);

  const goals = await db.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const activeGoal = goals.find((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  return (
    <DashboardShell
      title="Hedeflerim"
      description="Kişisel öğrenme hedeflerini takip et"
    >
      <div className="space-y-6">
        {/* Active Goal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Aktif Hedef
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeGoal ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{activeGoal.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Haftalık hedef: {activeGoal.targetPerWeek} ders
                  </p>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>İlerleme</span>
                    <span className="font-medium">
                      {activeGoal.currentProgress}/{activeGoal.targetPerWeek}
                    </span>
                  </div>
                  <Progress
                    value={activeGoal.currentProgress}
                    max={activeGoal.targetPerWeek}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {activeGoal.currentProgress >= activeGoal.targetPerWeek
                    ? "Hedefe ulaştın! Tebrikler!"
                    : `${activeGoal.targetPerWeek - activeGoal.currentProgress} ders daha ile hedefe ulaşacaksın.`}
                </p>
              </div>
            ) : (
              <EmptyState
                icon={Target}
                title="Aktif hedefin yok"
                description="Yöneticin senin için haftalık hedefler belirleyecek."
              />
            )}
          </CardContent>
        </Card>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tamamlanan Hedefler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {goal.targetPerWeek} ders/hafta
                      </p>
                    </div>
                    <Badge variant="success">Tamamlandı</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
