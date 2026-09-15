import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getBalancesForStudent } from "@/lib/services/ledger";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Heart,
  Package,
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

export const metadata = { title: "Veli Paneli" };

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
      eyebrow="Veli paneli"
      title={`Hoş geldin, ${session.user.firstName}`}
      description="Çocuğunun bakiyesi, devamlılığı ve ders kayıtları"
    >
      {children.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Heart}
              title="Bağlı öğrenci bulunmuyor"
              description="Hesabın henüz bir öğrenciyle eşleştirilmemiş. Ajans yöneticisiyle iletişime geçebilirsin."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {children.map((child) => {
            const totalBalance = child.balances.reduce((s, b) => s + b.balance, 0);
            const lowBalance = child.balances.find(
              (b) => b.balance > 0 && b.balance <= 3
            );
            const attendedCount = child.recentAttendance.filter(
              (a) => a.isPresent
            ).length;

            return (
              <section key={child.student.id} className="space-y-4">
                {/* ---------- Öğrenci başlığı ---------- */}
                <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
                  <Avatar
                    firstName={child.student.firstName}
                    lastName={child.student.lastName}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold tracking-tight">
                      {child.student.firstName} {child.student.lastName}
                    </h2>
                    <p className="truncate text-xs text-muted-foreground">
                      {child.student.email}
                    </p>
                  </div>
                  <Badge variant={totalBalance > 3 ? "success" : "warning"} className="tabular">
                    {formatHours(totalBalance)} kaldı
                  </Badge>
                </div>

                {/* ---------- Özet ---------- */}
                <div className="stagger grid gap-4 sm:grid-cols-3">
                  <StatCard
                    icon={Wallet}
                    tone={totalBalance > 3 ? "leaf" : "amber"}
                    label="Toplam bakiye"
                    value={formatHours(totalBalance)}
                    hint="Tüm derslerde kalan saat"
                    href="/panel/veli/bakiye"
                    linkLabel="Bakiye & paketler"
                  />
                  <StatCard
                    icon={BookOpen}
                    tone="ocean"
                    label="Bu hafta ders"
                    value={child.weekDelivered}
                    hint="Teslim edilen ders"
                    href="/panel/veli/dersler"
                    linkLabel="Ders kayıtları"
                  />
                  <StatCard
                    icon={Clock}
                    tone="brand"
                    label="Son ders"
                    value={
                      child.recentAttendance[0]
                        ? formatDate(child.recentAttendance[0].occurrence.date)
                        : "—"
                    }
                    hint={
                      child.recentAttendance.length > 0
                        ? `Son ${child.recentAttendance.length} derste ${attendedCount} katılım`
                        : "Henüz ders kaydı yok"
                    }
                  />
                </div>

                {/* ---------- Bakiye uyarısı ---------- */}
                {lowBalance && (
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-4">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300">
                      <Wallet className="h-4 w-4" />
                    </span>
                    <div className="text-[13px] leading-relaxed">
                      <p className="font-semibold">Paket yenileme zamanı</p>
                      <p className="text-muted-foreground">
                        <strong>{lowBalance.course?.name}</strong> dersi için kalan{" "}
                        <strong>{formatHours(lowBalance.balance)}</strong>.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid gap-5 lg:grid-cols-2">
                  {/* ---------- Ders bazında bakiye ---------- */}
                  <Card>
                    <CardHeader className="pb-4">
                      <SectionHeader
                        icon={Wallet}
                        title="Ders Bazında Bakiye"
                        description="Her ders için kalan saat"
                      />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {child.balances.length === 0 ? (
                        <p className="py-6 text-center text-xs text-muted-foreground">
                          Bakiye bilgisi yok.
                        </p>
                      ) : (
                        child.balances.map((b) => (
                          <div
                            key={b.courseId}
                            className="flex items-center justify-between gap-3 rounded-xl border border-transparent bg-muted/40 px-3 py-2.5 transition-colors hover:border-border hover:bg-card"
                          >
                            <div className="flex min-w-0 items-center gap-2.5">
                              <span
                                className="h-8 w-1.5 shrink-0 rounded-full"
                                style={{ backgroundColor: b.course?.color ?? undefined }}
                              />
                              <p className="truncate text-[13px] font-medium">
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
                              className="tabular shrink-0"
                            >
                              {formatHours(b.balance)}
                            </Badge>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* ---------- Son dersler ---------- */}
                  <Card>
                    <CardHeader className="pb-4">
                      <SectionHeader
                        icon={CalendarCheck}
                        title="Son Dersler"
                        description="Devamlılık kaydı"
                        href="/panel/veli/dersler"
                      />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {child.recentAttendance.length === 0 ? (
                        <p className="py-6 text-center text-xs text-muted-foreground">
                          Henüz ders kaydı yok.
                        </p>
                      ) : (
                        child.recentAttendance.map((a) => (
                          <div
                            key={a.id}
                            className="flex items-center gap-2.5 rounded-xl border border-transparent bg-muted/40 px-3 py-2.5"
                          >
                            {a.isPresent ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-leaf-600 dark:text-leaf-400" />
                            ) : (
                              <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                            )}
                            <p className="min-w-0 flex-1 truncate text-[13px] font-medium">
                              {a.occurrence.lessonSlot.course.name}
                            </p>
                            <span className="tabular shrink-0 text-[11px] text-muted-foreground">
                              {formatDate(a.occurrence.date)}
                            </span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* ---------- Son paketler ---------- */}
                {child.packages.length > 0 && (
                  <Card>
                    <CardHeader className="pb-4">
                      <SectionHeader
                        icon={Package}
                        title="Son Paketler"
                        description="Satın alınan saat paketleri"
                        href="/panel/veli/bakiye"
                      />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {child.packages.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-transparent bg-muted/40 px-3 py-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <Package className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="tabular text-[13px] font-semibold">
                                {formatHours(Number(p.hoursPurchased))}
                              </p>
                              <p className="truncate text-[11px] text-muted-foreground">
                                {formatDate(p.purchasedAt)}
                                {p.paymentMethod && ` • ${p.paymentMethod}`}
                              </p>
                            </div>
                          </div>
                          <p className="tabular shrink-0 text-[13px] font-semibold">
                            {formatCurrency(Number(p.pricePaid))}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </section>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
