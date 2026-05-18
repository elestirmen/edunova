import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getBalancesForStudent } from "@/lib/services/ledger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatHours } from "@/lib/utils";

export const metadata = { title: "Bakiye & Paketler | Edunova" };

export default async function ParentBalancePage() {
  const session = await requireAuth(["PARENT"]);

  const links = await db.parentStudent.findMany({
    where: { parentId: session.user.id },
    select: { studentId: true, student: { select: { firstName: true, lastName: true } } },
  });

  const data = await Promise.all(
    links.map(async (link) => {
      const [balances, packages, ledger] = await Promise.all([
        getBalancesForStudent(link.studentId),
        db.hourPackage.findMany({
          where: { studentId: link.studentId },
          include: { course: { select: { name: true } } },
          orderBy: { purchasedAt: "desc" },
        }),
        db.hourLedgerEntry.findMany({
          where: { studentId: link.studentId },
          include: { course: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 30,
        }),
      ]);

      const enrichedBalances = await Promise.all(
        balances.map(async (b) => {
          const c = await db.course.findUnique({
            where: { id: b.courseId },
            select: { name: true, code: true, color: true },
          });
          return { ...b, course: c };
        })
      );

      return { student: link.student, balances: enrichedBalances, packages, ledger };
    })
  );

  const reasonLabel: Record<string, string> = {
    PURCHASE: "Paket alımı",
    LESSON_USED: "Ders kullanımı",
    REFUND: "İade",
    ADJUSTMENT: "Düzenleme",
  };

  return (
    <DashboardShell title="Bakiye & Paketler" description="Tüm geçmiş ve mevcut bakiyeler">
      <div className="space-y-6">
        {data.map((d) => (
          <div key={d.student?.firstName} className="space-y-3">
            <h2 className="text-lg font-bold">
              {d.student?.firstName} {d.student?.lastName}
            </h2>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ders Bazında Bakiye</CardTitle>
              </CardHeader>
              <CardContent>
                {d.balances.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Bakiye yok.
                  </p>
                ) : (
                  <div className="divide-y">
                    {d.balances.map((b) => (
                      <div key={b.courseId} className="flex items-center justify-between py-2">
                        <span className="text-sm">{b.course?.name}</span>
                        <Badge
                          variant={
                            b.balance <= 0
                              ? "destructive"
                              : b.balance <= 3
                                ? "warning"
                                : "success"
                          }
                        >
                          {formatHours(b.balance)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Paket Geçmişi</CardTitle>
              </CardHeader>
              <CardContent>
                {d.packages.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Paket kaydı yok.
                  </p>
                ) : (
                  <div className="divide-y">
                    {d.packages.map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium">
                            {p.course.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatDate(p.purchasedAt)}
                            {p.paymentMethod && ` • ${p.paymentMethod}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            {formatHours(Number(p.hoursPurchased))}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatCurrency(Number(p.pricePaid))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Son Hareketler</CardTitle>
              </CardHeader>
              <CardContent>
                {d.ledger.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Hareket yok.
                  </p>
                ) : (
                  <div className="divide-y text-sm">
                    {d.ledger.map((entry) => {
                      const hours = Number(entry.hours);
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between py-1.5"
                        >
                          <div>
                            <p>{reasonLabel[entry.reason] ?? entry.reason}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {entry.course.name} • {formatDate(entry.createdAt)}
                            </p>
                          </div>
                          <span
                            className={
                              hours >= 0 ? "text-emerald-600" : "text-red-600"
                            }
                          >
                            {hours > 0 ? "+" : ""}
                            {formatHours(hours)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
