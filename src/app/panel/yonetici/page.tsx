import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Coins,
  GraduationCap,
  Heart,
  Megaphone,
  Package,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import {
  endOfMonth,
  formatCurrency,
  formatHours,
  formatRelativeTime,
  getRoleLabel,
  startOfMonth,
} from "@/lib/utils";

export const metadata = { title: "Yönetici Paneli" };

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
  const margin =
    revenueAmount > 0 ? Math.round((grossProfit / revenueAmount) * 100) : null;

  // Düşük bakiye listesi
  const lowBalanceRaw = balances
    .map((b) => ({ ...b, balance: Number(b._sum.hours ?? 0) }))
    .filter((b) => b.balance > 0 && b.balance <= 3)
    .sort((a, b) => a.balance - b.balance);
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

  const monthLabel = new Date().toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardShell
      eyebrow="Operasyon"
      title={`Hoş geldin, ${session.user.firstName}`}
      description={`${monthLabel} — finans ve operasyon özeti`}
      action={
        <Link href="/panel/yonetici/paketler" className="hidden sm:block">
          <Button size="sm" className="gap-1.5">
            <Package className="h-4 w-4" />
            Paket Sat
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* ---------- Finansal şerit ---------- */}
        <div className="stagger grid gap-3 grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <StatCard
            icon={Wallet}
            tone="ocean"
            label="Bu ay gelir"
            value={formatCurrency(revenueAmount)}
            hint="Satılan saat paketleri"
            href="/panel/yonetici/paketler"
            linkLabel="Paket satışları"
          />
          <StatCard
            icon={Coins}
            tone="amber"
            label="Ödenmemiş hakediş"
            value={formatCurrency(pendingAmount)}
            hint="Ödeme bekleyen öğretmen kazancı"
            href="/panel/yonetici/hakedis"
            linkLabel="Hakediş yönet"
          />
          <StatCard
            icon={TrendingUp}
            tone="brand"
            label="Bu ay teslim ders"
            value={deliveredThisMonth}
            hint="Tüm öğretmenler"
            href="/panel/yonetici/istatistikler"
            linkLabel="İstatistikler"
          />
          <StatCard
            icon={grossProfit >= 0 ? TrendingUp : TrendingDown}
            tone={grossProfit >= 0 ? "leaf" : "rose"}
            label="Brüt kâr (tahmini)"
            value={formatCurrency(grossProfit)}
            hint="Gelir − ödenen − bekleyen"
            trend={
              margin !== null
                ? {
                    value: `%${margin} marj`,
                    direction: grossProfit >= 0 ? "up" : "down",
                  }
                : undefined
            }
          />
        </div>

        {/* ---------- Kişi/ders sayaçları ---------- */}
        <Card variant="flat" className="overflow-hidden">
          <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
            {[
              { icon: GraduationCap, label: "Öğrenci", value: totalStudents, href: "/panel/yonetici/kullanicilar" },
              { icon: Users, label: "Öğretmen", value: totalTeachers, href: "/panel/yonetici/kullanicilar" },
              { icon: Heart, label: "Veli", value: totalParents, href: "/panel/yonetici/veliler" },
              { icon: BookOpen, label: "Ders", value: totalCourses, href: "/panel/yonetici/dersler" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center gap-3 bg-card p-4 transition-colors hover:bg-accent/50"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <item.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="tabular text-xl font-bold leading-none">{item.value}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{item.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-5">
          {/* ---------- Hızlı erişim ---------- */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-4">
              <SectionHeader
                icon={ShieldCheck}
                title="Hızlı Erişim"
                description="Günlük operasyon işlemleri"
              />
            </CardHeader>
            <CardContent className="grid gap-2.5 sm:grid-cols-2">
              <QuickLink href="/panel/yonetici/paketler" icon={Package} label="Saat Paketi Sat" desc="Veliden paket alımı" />
              <QuickLink href="/panel/yonetici/hakedis" icon={Coins} label="Hakediş Hesapla" desc="Ay sonu ödeme" />
              <QuickLink href="/panel/yonetici/kullanicilar" icon={UserPlus} label="Kullanıcı Ekle" desc="Öğrenci / öğretmen / veli" />
              <QuickLink href="/panel/yonetici/tatiller" icon={Calendar} label="Tatil Tanımla" desc="Resmi tatil / iptal" />
              <QuickLink href="/panel/yonetici/ucretler" icon={Wallet} label="Öğretmen Ücretleri" desc="Saatlik tarife belirle" />
              <QuickLink href="/panel/yonetici/duyurular" icon={Megaphone} label="Duyuru Yayınla" desc="Tüm kullanıcılara" />
            </CardContent>
          </Card>

          {/* ---------- Düşük bakiye ---------- */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <SectionHeader
                icon={TrendingDown}
                title="Bakiyesi Düşen Öğrenciler"
                description="3 saat ve altı kalanlar"
                href="/panel/yonetici/paketler"
                hrefLabel="Paketler"
              />
            </CardHeader>
            <CardContent className="space-y-2">
              {lowBalances.length === 0 ? (
                <EmptyState
                  icon={ShieldCheck}
                  title="Risk yok"
                  description="Şu an bakiyesi kritik seviyede olan öğrenci bulunmuyor."
                  className="py-8"
                />
              ) : (
                lowBalances.map((b) => (
                  <div
                    key={`${b.studentId}-${b.courseId}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">
                        {b.student?.firstName} {b.student?.lastName}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {b.course?.name}
                      </p>
                    </div>
                    <Badge variant="warning" className="shrink-0 tabular">
                      {formatHours(b.balance)}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* ---------- Son kayıtlar ---------- */}
        <Card>
          <CardHeader className="pb-4">
            <SectionHeader
              icon={Users}
              title="Son Kayıtlar"
              description="Sisteme en son eklenen kullanıcılar"
              href="/panel/yonetici/kullanicilar"
            />
          </CardHeader>
          <CardContent className="space-y-2">
            {recentUsers.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="Henüz kullanıcı yok"
                description="İlk öğrenci, öğretmen veya veli hesabını oluştur."
              />
            ) : (
              recentUsers.map((user) => (
                <Link
                  key={user.id}
                  href="/panel/yonetici/kullanicilar"
                  className="group flex items-center gap-3 rounded-xl border border-transparent bg-muted/40 px-3 py-2.5 transition-all duration-200 ease-premium hover:border-border hover:bg-card hover:shadow-sm"
                >
                  <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    <Badge variant="secondary">{getRoleLabel(user.role)}</Badge>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatRelativeTime(user.createdAt)}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform duration-200 ease-premium group-hover:translate-x-0.5" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
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
      className="group flex items-center gap-3 rounded-xl border bg-card p-3 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 transition-transform duration-200 ease-premium group-hover:scale-105">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold leading-tight">{label}</p>
        <p className="truncate text-[11px] text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform duration-200 ease-premium group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
