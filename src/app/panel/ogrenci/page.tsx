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
} from "@/lib/utils";
import { getBalancesForStudent } from "@/lib/services/ledger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  ClipboardList,
  Clock,
  Flame,
  MapPin,
  Target,
  Wallet,
} from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Ana Sayfa | Edunova" };

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
      title={`${greetingText}, ${session.user.firstName}`}
      description="Bugün hangi derslerin var?"
    >
      <div className="space-y-6">
        {/* ÖNCE: BUGÜN NE VAR? — En kritik bilgi en üstte */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Bugün ({getDayLabel(today)})
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {todayLessons.length} ders
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {todayLessons.length === 0 ? (
              <div className="rounded-lg bg-muted/40 py-6 text-center">
                <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Bugün dersin yok.</p>
                <p className="text-xs text-muted-foreground">
                  Kendine vakit ayır veya tekrar yap.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <span
                      className="h-10 w-1 rounded-full"
                      style={{ backgroundColor: lesson.course.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{lesson.course.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                        {lesson.room && (
                          <span className="inline-flex items-center gap-0.5">
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
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Katıl →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {lowBalance && (
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
            <CardContent className="flex items-center gap-3 p-3 text-sm">
              <Wallet className="h-5 w-5 text-amber-600 shrink-0" />
              <p>
                Derslerinden birinin bakiyesi düşük (
                <strong>{formatHours(lowBalance.balance)}</strong>). Yöneticinle iletişime
                geçip yenilemen iyi olabilir.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Motivasyon şeridi (sade hâl) */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-3">
              <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-950/40">
                <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{currentStreak}</p>
                <p className="text-[11px] text-muted-foreground">Günlük seri</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-3">
              <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950/40">
                <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-1">
                  <p className="text-xl font-bold leading-none">{weeklyProgress}</p>
                  <p className="text-xs text-muted-foreground">/{weeklyTarget} hedef</p>
                </div>
                <Progress
                  value={weeklyProgress}
                  max={weeklyTarget}
                  size="sm"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950/40">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{totalLessons}</p>
                <p className="text-[11px] text-muted-foreground">Toplam ders</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bakiyeler + Derslerim + Bekleyen ödevler */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Derslerim
                </CardTitle>
                <Link
                  href="/panel/ogrenci/dersler"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Tümünü gör <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Henüz kayıtlı dersin yok.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {enrollments.slice(0, 6).map((e) => {
                    const balance = balances.find(
                      (b) => b.courseId === e.course.id
                    );
                    return (
                      <div key={e.id} className="rounded-lg border p-3">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span
                            className="h-7 w-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ backgroundColor: e.course.color }}
                          >
                            {e.course.code.slice(0, 2)}
                          </span>
                          <span className="font-medium text-sm truncate">
                            {e.course.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {e.course.teacher.firstName} {e.course.teacher.lastName}
                        </p>
                        {balance && balance.balance > 0 && (
                          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                            {formatHours(balance.balance)} kaldı
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {pendingAssignments.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Bekleyen Ödevler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingAssignments.map((a) => (
                    <Link
                      key={a.id}
                      href="/panel/ogrenci/odevler"
                      className="block rounded-lg bg-muted/40 p-2.5 hover:bg-accent"
                    >
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {a.course.name}
                        {a.dueDate && ` • Son: ${new Date(a.dueDate).toLocaleDateString("tr-TR")}`}
                      </p>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    Duyurular
                  </CardTitle>
                  <Link
                    href="/panel/ogrenci/duyurular"
                    className="text-xs text-primary hover:underline"
                  >
                    Tümü
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">
                    Duyuru yok.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="rounded-lg bg-muted/40 p-2.5">
                        <p className="text-sm font-medium truncate">{ann.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {ann.content}
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
