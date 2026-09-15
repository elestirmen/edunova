import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DayOfWeek } from "@prisma/client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  getDayLabel,
  getTodayDayOfWeek,
  formatTime,
  getGreeting,
  formatHours,
  formatLongDate,
  getMotivationalMessage,
} from "@/lib/utils";
import { getBalancesForStudent } from "@/lib/services/ledger";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Clock,
  Flame,
  MapPin,
  Target,
  Video,
  Wallet,
} from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Ana Sayfa" };

export default async function StudentDashboard() {
  const session = await requireAuth(["STUDENT"]);
  const userId = session.user.id;
  const today = getTodayDayOfWeek();

  const [
    todayLessons,
    streak,
    goals,
    enrollments,
    announcements,
    balances,
    pendingAssignments,
  ] = await Promise.all([
    db.lessonSlot.findMany({
      where: {
        dayOfWeek: today as DayOfWeek,
        course: {
          enrollments: { some: { studentId: userId } },
        },
      },
      include: {
        course: {
          select: { id: true, name: true, code: true, color: true },
        },
      },
      orderBy: { startTime: "asc" },
    }),
    db.streak.findUnique({ where: { userId } }),
    db.goal.findMany({
      where: { userId, isCompleted: false },
      orderBy: { createdAt: "desc" },
      take: 1,
    }),
    db.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: {
          include: { teacher: { select: { firstName: true, lastName: true } } },
        },
      },
    }),
    db.announcement.findMany({
      where: {
        OR: [
          { isGlobal: true },
          { course: { enrollments: { some: { studentId: userId } } } },
        ],
      },
      include: {
        author: { select: { firstName: true, lastName: true } },
        course: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    getBalancesForStudent(userId),
    db.assignment.findMany({
      where: {
        course: { enrollments: { some: { studentId: userId } } },
        submissions: { none: { studentId: userId, submittedAt: { not: null } } },
      },
      include: { course: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
      take: 3,
    }),
  ]);

  const currentStreak = streak?.currentStreak ?? 0;
  const totalLessons = streak?.totalLessons ?? 0;
  const currentGoal = goals[0];
  const weeklyTarget = currentGoal?.targetPerWeek ?? 5;
  const weeklyProgress = currentGoal?.currentProgress ?? 0;
  const { text: greetingText } = getGreeting();

  // Düşük bakiyeli ders var mı?
  const lowBalance = balances.find((b) => b.balance > 0 && b.balance <= 3);

  return (
    <DashboardShell
      eyebrow={formatLongDate()}
      title={`${greetingText}, ${session.user.firstName}`}
      description={getMotivationalMessage(currentStreak)}
    >
      <div className="space-y-6">
        {/* ---------- Bugünün dersleri ---------- */}
        <Card variant="brand" className="overflow-hidden">
          <CardHeader className="pb-4">
            <SectionHeader
              icon={CalendarDays}
              title={`Bugün — ${getDayLabel(today)}`}
              description={
                todayLessons.length > 0
                  ? "Derse panelden tek tıkla katıl"
                  : "Bugün programında ders görünmüyor"
              }
              action={
                <Badge variant={todayLessons.length > 0 ? "default" : "muted"}>
                  {todayLessons.length} ders
                </Badge>
              }
              href="/panel/ogrenci/program"
              hrefLabel="Program"
            />
          </CardHeader>
          <CardContent>
            {todayLessons.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Bugün dersin yok"
                description="Kendine vakit ayır ya da geçmiş konuların tekrarını yap."
                className="py-8"
              />
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {todayLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="group relative flex items-center gap-3 overflow-hidden rounded-xl border bg-card p-3.5 shadow-xs transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span
                      className="absolute inset-y-0 left-0 w-1"
                      style={{ backgroundColor: lesson.course.color }}
                    />
                    <span
                      className="ml-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: lesson.course.color }}
                    >
                      {lesson.course.code.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">
                        {lesson.course.name}
                      </p>
                      <div className="tabular mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(lesson.startTime)}–{formatTime(lesson.endTime)}
                        </span>
                        {lesson.room && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {lesson.room}
                          </span>
                        )}
                      </div>
                    </div>
                    {lesson.recurringMeetingUrl && (
                      <a
                        href={lesson.recurringMeetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg brand-surface px-3 py-2 text-[11px] font-semibold text-primary-foreground shadow-glow transition-transform duration-200 ease-premium hover:scale-[1.03]"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Katıl
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ---------- Bakiye uyarısı ---------- */}
        {lowBalance && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-4">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300">
              <Wallet className="h-4 w-4" />
            </span>
            <div className="text-[13px] leading-relaxed">
              <p className="font-semibold">Ders bakiyen azalıyor</p>
              <p className="text-muted-foreground">
                Derslerinden birinde <strong>{formatHours(lowBalance.balance)}</strong>{" "}
                kaldı. Yöneticinle iletişime geçip paketini yenilemen iyi olur.
              </p>
            </div>
          </div>
        )}

        {/* ---------- Motivasyon şeridi ---------- */}
        <div className="stagger grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Flame}
            tone="amber"
            label="Günlük seri"
            value={currentStreak}
            hint={currentStreak > 0 ? "Gün üst üste" : "Bugün başlat"}
            href="/panel/ogrenci/ilerleme"
            linkLabel="İlerlemem"
          />
          <div className="group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
            <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-leaf-500/12 to-transparent blur-2xl" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Haftalık hedef
                </p>
                <p className="tabular mt-2 flex items-baseline gap-1 font-bold leading-none tracking-tight">
                  <span className="text-[26px]">{weeklyProgress}</span>
                  <span className="text-sm text-muted-foreground">/ {weeklyTarget}</span>
                </p>
                <Progress
                  value={weeklyProgress}
                  max={weeklyTarget}
                  size="sm"
                  className="mt-3"
                />
              </div>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf-500/12 text-leaf-700 ring-1 ring-inset ring-leaf-500/20 dark:bg-leaf-400/15 dark:text-leaf-300">
                <Target className="h-[18px] w-[18px]" />
              </span>
            </div>
          </div>
          <StatCard
            icon={BookOpen}
            tone="ocean"
            label="Toplam ders"
            value={totalLessons}
            hint="Tamamlanan ders sayısı"
          />
        </div>

        {/* ---------- Dersler + yan sütun ---------- */}
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <SectionHeader
                icon={BookOpen}
                title="Derslerim"
                description="Kayıtlı olduğun dersler ve kalan saatlerin"
                href="/panel/ogrenci/dersler"
                hrefLabel="Tümünü gör"
              />
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="Henüz kayıtlı dersin yok"
                  description="Yöneticin seni bir derse eklediğinde burada görünecek."
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {enrollments.slice(0, 6).map((e) => {
                    const balance = balances.find((b) => b.courseId === e.course.id);
                    const remaining = balance?.balance ?? 0;
                    return (
                      <div
                        key={e.id}
                        className="group rounded-xl border bg-card p-3.5 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
                      >
                        <div className="mb-2 flex items-center gap-2.5">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: e.course.color }}
                          >
                            {e.course.code.slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold leading-tight">
                              {e.course.name}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {e.course.teacher.firstName} {e.course.teacher.lastName}
                            </p>
                          </div>
                        </div>
                        {remaining > 0 && (
                          <div className="flex items-center justify-between rounded-lg bg-muted/60 px-2.5 py-1.5">
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              Kalan
                            </span>
                            <span
                              className={`tabular text-[11px] font-bold ${
                                remaining <= 3
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-leaf-700 dark:text-leaf-300"
                              }`}
                            >
                              {formatHours(remaining)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-5">
            {pendingAssignments.length > 0 && (
              <Card>
                <CardHeader className="pb-4">
                  <SectionHeader
                    icon={ClipboardList}
                    title="Bekleyen Ödevler"
                    href="/panel/ogrenci/odevler"
                  />
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingAssignments.map((a) => (
                    <Link
                      key={a.id}
                      href="/panel/ogrenci/odevler"
                      className="group flex items-center gap-2.5 rounded-xl border border-transparent bg-muted/40 p-3 transition-all duration-200 ease-premium hover:border-border hover:bg-card hover:shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold">{a.title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {a.course.name}
                          {a.dueDate &&
                            ` • Son: ${new Date(a.dueDate).toLocaleDateString("tr-TR")}`}
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform duration-200 ease-premium group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-4">
                <SectionHeader
                  icon={Bell}
                  title="Duyurular"
                  href="/panel/ogrenci/duyurular"
                />
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    Şu an duyuru yok.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((ann) => (
                      <div
                        key={ann.id}
                        className="rounded-xl border-l-2 border-primary/40 bg-muted/40 px-3 py-2.5"
                      >
                        <p className="truncate text-[13px] font-semibold">{ann.title}</p>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                          {ann.content}
                        </p>
                        <p className="mt-1.5 text-[10px] text-muted-foreground/70">
                          {ann.course?.name ?? "Genel"} • {ann.author.firstName}{" "}
                          {ann.author.lastName}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
