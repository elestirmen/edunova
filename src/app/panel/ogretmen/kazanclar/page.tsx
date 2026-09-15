import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Wallet, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate, formatHours, startOfMonth, endOfMonth } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";

export const metadata = { title: "Kazançlarım" };

export default async function TeacherEarningsPage() {
  const session = await requireAuth(["TEACHER"]);
  const teacherId = session.user.id;

  const monthStart = startOfMonth();
  const monthEnd = endOfMonth();

  const [pending, monthEarnings, payouts] = await Promise.all([
    db.teacherEarning.findMany({
      where: { teacherId, payoutId: null },
      include: {
        occurrence: {
          include: { lessonSlot: { include: { course: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.teacherEarning.aggregate({
      where: {
        teacherId,
        createdAt: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true, hours: true },
      _count: { id: true },
    }),
    db.teacherPayout.findMany({
      where: { teacherId },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  const pendingTotal = pending.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <DashboardShell eyebrow="Finans" title="Kazançlarım" description="Aylık hakediş ve ödeme geçmişi">
      <div className="space-y-6">
        <div className="stagger grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Wallet}
            tone="amber"
            label="Bekleyen hakediş"
            value={formatCurrency(pendingTotal)}
            hint={`${pending.length} ders ödeme bekliyor`}
          />
          <StatCard
            icon={TrendingUp}
            tone="brand"
            label="Bu ay toplam"
            value={formatCurrency(Number(monthEarnings._sum.amount ?? 0))}
            hint={`${monthEarnings._count.id} ders • ${formatHours(Number(monthEarnings._sum.hours ?? 0))}`}
          />
          <StatCard
            icon={Coins}
            tone="leaf"
            label="Toplam ödenmiş"
            value={formatCurrency(
              payouts.filter((p) => p.paidAt).reduce((s, p) => s + Number(p.amount), 0)
            )}
            hint={`${payouts.filter((p) => p.paidAt).length} ödeme yapıldı`}
          />
        </div>


        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bekleyen Hakediş Dersleri</CardTitle>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Bekleyen ders yok.
              </p>
            ) : (
              <div className="divide-y">
                {pending.map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">
                        {e.occurrence.lessonSlot.course.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(e.occurrence.date)} •{" "}
                        {formatHours(Number(e.hours))} ×{" "}
                        {formatCurrency(Number(e.hourlyRate))}
                      </p>
                    </div>
                    <p className="text-sm font-bold">
                      {formatCurrency(Number(e.amount))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ödeme Geçmişi</CardTitle>
          </CardHeader>
          <CardContent>
            {payouts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Henüz ödeme yapılmadı.
              </p>
            ) : (
              <div className="divide-y">
                {payouts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">
                        {formatDate(p.periodStart)} – {formatDate(p.periodEnd)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {p.paidAt
                          ? `Ödendi: ${formatDate(p.paidAt)}`
                          : "Bekliyor"}
                        {p.paymentRef && ` • ${p.paymentRef}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">
                        {formatCurrency(Number(p.amount))}
                      </p>
                      {p.paidAt && (
                        <Badge variant="success">
                          <CheckCircle2 className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
