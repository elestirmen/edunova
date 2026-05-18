import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  Calendar,
  Megaphone,
  GraduationCap,
  Coins,
  ArrowRight,
  Package,
  Wallet,
  TrendingDown,
  Heart,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  endOfMonth,
  formatCurrency,
  formatDate,
  formatHours,
  getRoleLabel,
  startOfMonth,
} from "@/lib/utils";

export const metadata = { title: "Yönetici Paneli | Edunova" };

export default async function AdminDashboard() {
  const session = await requireAuth(["ADMIN"]);

  const monthStart = startOfMonth();
  const monthEnd = endOfMonth();

  const [
    totalStudents,
    totalTeachers,
    totalParents,
    totalCourses,
    deliveredThisMonth,
    revenue,
    pendingEarnings,
    paidThisMonth,
    recentUsers,
    balances,
  ] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.user.count({ where: { role: "TEACHER" } }),
    db.user.count({ where: { role: "PARENT" } }),
    db.course.count(),
    db.lessonOccurrence.count({
      where: { status: "DELIVERED", date: { gte: monthStart, lt: monthEnd } },
    }),
    db.hourPackage.aggregate({
      where: { purchasedAt: { gte: monthStart, lt: monthEnd } },
      _sum: { pricePaid: true },
    }),
    db.teacherEarning.aggregate({
      where: { payoutId: null },
      _sum: { amount: true },
    }),
    db.teacherPayout.aggregate({
      where: { paidAt: { gte: monthStart, lt: monthEnd } },
      _sum: { amount: true },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    db.hourLedgerEntry.groupBy({
      by: ["studentId", "courseId"],
      _sum: { hours: true },
    }),
  ]);

  const revenueAmount = Number(revenue._sum.pricePaid ?? 0);
  const pendingAmount = Number(pendingEarnings._sum.amount ?? 0);
  const paidAmount = Number(paidThisMonth._sum.amount ?? 0);
  const grossProfit = revenueAmount - paidAmount - pendingAmount;

  // Düşük bakiye listesi
  const lowBalanceRaw = balances
    .map((b) => ({ ...b, balance: Number(b._sum.hours ?? 0) }))
    .filter((b) => b.balance > 0 && b.balance <= 3);
  const lowBalances = await Promise.all(
    lowBalanceRaw.slice(0, 6).map(async (b) => {
      const [student, course] = await Promise.all([
        db.user.findUnique({
          where: { id: b.studentId },
          select: { firstName: true, lastName: true },
        }),
        db.course.findUnique({
          where: { id: b.courseId },
          select: { name: true, code: true },
        }),
      ]);
      return { ...b, student, course };
    })
  );

  return (
    <DashboardShell
      title={`Hoş geldin, ${session.user.firstName}`}
      description="Operasyon ve finans özeti"
    >
      <div className="space-y-6">
        {/* Finansal Şerit */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" /> Bu ay gelir
              </div>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(revenueAmount)}</p>
              <Link href="/panel/yonetici/paketler" className="text-[11px] text-primary hover:underline">
                Paket satışları →
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Coins className="h-3.5 w-3.5" /> Ödenmemiş hakediş
              </div>
              <p className="mt-1 text-2xl font-bold text-amber-600">{formatCurrency(pendingAmount)}</p>
              <Link href="/panel/yonetici/hakedis" className="text-[11px] text-primary hover:underline">
                Hakediş yönet →
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> Bu ay teslim ders
              </div>
              <p className="mt-1 text-2xl font-bold">{deliveredThisMonth}</p>
              <p className="text-[11px] text-muted-foreground">Tüm öğretmenler</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingDown className="h-3.5 w-3.5" /> Brüt kâr (tahmini)
              </div>
              <p
                className={`mt-1 text-2xl font-bold ${
                  grossProfit >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {formatCurrency(grossProfit)}
              </p>
              <p className="text-[11px] text-muted-foreground">Gelir − ödenen − bekleyen</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Şeridi (geleneksel) */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <StatMini icon={GraduationCap} label="Öğrenci" value={totalStudents} />
          <StatMini icon={Users} label="Öğretmen" value={totalTeachers} />
          <StatMini icon={Heart} label="Veli" value={totalParents} />
          <StatMini icon={BookOpen} label="Ders" value={totalCourses} />
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Hızlı erişim */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Hızlı Erişim</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              <QuickLink href="/panel/yonetici/paketler" icon={Package} label="Saat Paketi Sat" desc="Veliden paket alımı" />
              <QuickLink href="/panel/yonetici/hakedis" icon={Coins} label="Hakediş Hesapla" desc="Ay sonu ödeme" />
              <QuickLink href="/panel/yonetici/kullanicilar" icon={Users} label="Kullanıcı Ekle" desc="Öğrenci/öğretmen/veli" />
              <QuickLink href="/panel/yonetici/tatiller" icon={Calendar} label="Tatil Tanımla" desc="Resmi tatil/iptal" />
              <QuickLink href="/panel/yonetici/ucretler" icon={Wallet} label="Öğretmen Ücretleri" desc="Saatlik tarife belirle" />
              <QuickLink href="/panel/yonetici/duyurular" icon={Megaphone} label="Duyuru Yayınla" desc="Tüm kullanıcılara" />
            </CardContent>
          </Card>

          {/* Düşük bakiye uyarısı */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-amber-600" />
                Bakiyesi Düşen Öğrenciler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lowBalances.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Şu an risk altında öğrenci yok.
                </p>
              ) : (
                lowBalances.map((b) => (
                  <div
                    key={`${b.studentId}-${b.courseId}`}
                    className="flex items-center justify-between rounded-lg bg-amber-50 dark:bg-amber-950/30 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {b.student?.firstName} {b.student?.lastName}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {b.course?.name}
                      </p>
                    </div>
                    <Badge variant="warning" className="shrink-0">
                      {formatHours(b.balance)}
                    </Badge>
                  </div>
                ))
              )}
              <Link
                href="/panel/yonetici/paketler"
                className="block text-center text-xs text-primary hover:underline pt-1"
              >
                Tümünü gör →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Son Kayıtlar */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Son Kayıtlar</CardTitle>
              <Link
                href="/panel/yonetici/kullanicilar"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Tümü <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                </div>
                <div className="shrink-0 text-right ml-3">
                  <Badge variant="secondary" className="text-[10px]">
                    {getRoleLabel(user.role)}
                  </Badge>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function StatMini({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <div className="rounded-lg bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xl font-bold leading-none">{value}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  desc,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent hover:shadow-sm"
    >
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
