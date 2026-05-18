import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getBalancesForStudent } from "@/lib/services/ledger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Heart,
  Wallet,
  XCircle,
} from "lucide-react";
import {
  endOfWeek,
  formatCurrency,
  formatDate,
  formatHours,
  startOfWeek,
} from "@/lib/utils";

export const metadata = { title: "Veli Paneli | Edunova" };

export default async function ParentDashboard() {
  const session = await requireAuth(["PARENT"]);

  const links = await db.parentStudent.findMany({
    where: { parentId: session.user.id },
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  const wkStart = startOfWeek();
  const wkEnd = endOfWeek();

  const children = await Promise.all(
    links.map(async (link) => {
      const [balances, recentAttendance, weekDeliveredAggregate, packages] =
        await Promise.all([
          getBalancesForStudent(link.studentId),
          db.attendance.findMany({
            where: { studentId: link.studentId },
            include: {
              occurrence: {
                include: { lessonSlot: { include: { course: true } } },
              },
            },
            orderBy: { occurrence: { date: "desc" } },
            take: 5,
          }),
          db.lessonOccurrence.aggregate({
            where: {
              status: "DELIVERED",
              date: { gte: wkStart, lt: wkEnd },
              attendances: { some: { studentId: link.studentId } },
            },
            _count: { id: true },
          }),
          db.hourPackage.findMany({
            where: { studentId: link.studentId },
            orderBy: { purchasedAt: "desc" },
            take: 5,
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

      return {
        student: link.student,
        balances: enrichedBalances,
        recentAttendance,
        weekDelivered: weekDeliveredAggregate._count.id,
        packages,
      };
    })
  );

  return (
    <DashboardShell
      title={`Hoş geldin, ${session.user.firstName}`}
      description="Çocuğunun eğitim durumu"
    >
      {children.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            <Heart className="mx-auto mb-2 h-8 w-8 opacity-50" />
            Henüz seninle bağlı öğrenci yok. Yöneticinle iletişime geç.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {children.map((child) => {
            const totalBalance = child.balances.reduce(
              (s, b) => s + b.balance,
              0
            );
            const lowBalance = child.balances.find(
              (b) => b.balance > 0 && b.balance <= 3
            );
            return (
              <div key={child.student.id} className="space-y-3">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <Heart className="h-4 w-4 text-rose-500" />
                  {child.student.firstName} {child.student.lastName}
                </h2>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Wallet className="h-3.5 w-3.5" /> Toplam bakiye
                      </div>
                      <p className="mt-1 text-2xl font-bold">
                        {formatHours(totalBalance)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" /> Bu hafta ders
                      </div>
                      <p className="mt-1 text-2xl font-bold">
                        {child.weekDelivered}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> Son ders
                      </div>
                      <p className="mt-1 text-sm font-medium">
                        {child.recentAttendance[0]
                          ? formatDate(child.recentAttendance[0].occurrence.date)
                          : "—"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {lowBalance && (
                  <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                    <CardContent className="flex items-center gap-3 p-3 text-sm">
                      <Wallet className="h-5 w-5 text-amber-600 shrink-0" />
                      <p>
                        <strong>{lowBalance.course?.name}</strong> dersi için kalan{" "}
                        <strong>{formatHours(lowBalance.balance)}</strong>. Paket
                        yenileme zamanı.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Ders Bazında Bakiye
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {child.balances.length === 0 ? (
                        <p className="py-4 text-center text-xs text-muted-foreground">
                          Bakiye bilgisi yok.
                        </p>
                      ) : (
                        <div className="divide-y">
                          {child.balances.map((b) => (
                            <div
                              key={b.courseId}
                              className="flex items-center justify-between py-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="h-3 w-3 rounded-full shrink-0"
                                  style={{ backgroundColor: b.course?.color }}
                                />
                                <p className="text-sm truncate">
                                  {b.course?.name}
                                </p>
                              </div>
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
                      <CardTitle className="text-base">Son Dersler</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {child.recentAttendance.length === 0 ? (
                        <p className="py-4 text-center text-xs text-muted-foreground">
                          Henüz ders kaydı yok.
                        </p>
                      ) : (
                        <div className="divide-y">
                          {child.recentAttendance.map((a) => (
                            <div
                              key={a.id}
                              className="flex items-center gap-2 py-2"
                            >
                              {a.isPresent ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                              ) : (
                                <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                              )}
                              <p className="flex-1 truncate text-sm">
                                {a.occurrence.lessonSlot.course.name}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(a.occurrence.date)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {child.packages.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Son Paketler</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y">
                        {child.packages.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between py-2"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {formatHours(Number(p.hoursPurchased))}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {formatDate(p.purchasedAt)}
                                {p.paymentMethod && ` • ${p.paymentMethod}`}
                              </p>
                            </div>
                            <p className="text-sm font-semibold">
                              {formatCurrency(Number(p.pricePaid))}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
