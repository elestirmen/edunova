import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Wallet, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate, formatHours, startOfMonth, endOfMonth } from "@/lib/utils";

export const metadata = { title: "Kazançlarım | Edunova" };

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
    <DashboardShell title="Kazançlarım" description="Aylık hakediş ve ödeme geçmişi">
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" /> Bekleyen
              </div>
              <p className="mt-1 text-2xl font-bold text-amber-600">
                {formatCurrency(pendingTotal)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {pending.length} ders
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> Bu ay toplam
              </div>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(Number(monthEarnings._sum.amount ?? 0))}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {monthEarnings._count.id} ders •{" "}
                {formatHours(Number(monthEarnings._sum.hours ?? 0))}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Coins className="h-3.5 w-3.5" /> Toplam ödenmiş
              </div>
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {formatCurrency(
                  payouts.filter((p) => p.paidAt).reduce((s, p) => s + Number(p.amount), 0)
                )}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {payouts.filter((p) => p.paidAt).length} ödeme
              </p>
            </CardContent>
          </Card>
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
