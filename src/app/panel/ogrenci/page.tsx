import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DayOfWeek } from "@prisma/client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  getMotivationalMessage,
  getDayLabel,
  getTodayDayOfWeek,
  formatTime,
  getGreeting,
  getStreakEmoji,
  getStreakTitle,
} from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default async function StudentDashboard() {
  const session = await requireAuth(["STUDENT"]);
  const userId = session.user.id;
  const today = getTodayDayOfWeek();

  const [enrollments, streak, goals, todayLessons, announcements] =
    await Promise.all([
      db.enrollment.findMany({
        where: { studentId: userId },
        include: {
          course: {
            include: {
              teacher: { select: { firstName: true, lastName: true } },
              lessonSlots: true,
            },
          },
        },
      }),
      db.streak.findUnique({ where: { userId } }),
      db.goal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 1,
      }),
      db.lessonSlot.findMany({
        where: {
          dayOfWeek: today as DayOfWeek,
          course: {
            enrollments: { some: { studentId: userId } },
          },
        },
        include: {
          course: {
            select: { name: true, code: true, color: true },
          },
        },
        orderBy: { startTime: "asc" },
      }),
      db.announcement.findMany({
        where: {
          OR: [
            { isGlobal: true },
            {
              course: {
                enrollments: { some: { studentId: userId } },
              },
            },
          ],
        },
        include: {
          author: { select: { firstName: true, lastName: true } },
          course: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

  const allLessonSlots = enrollments.flatMap((e) =>
    e.course.lessonSlots.map((slot) => ({
      ...slot,
      courseName: e.course.name,
      courseColor: e.course.color,
    }))
  );

  const tomorrowDay = (() => {
    const days = [
      "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY",
    ];
    const todayIdx = days.indexOf(today);
    return days[(todayIdx + 1) % 7];
  })();

  const tomorrowLessons = allLessonSlots
    .filter((s) => s.dayOfWeek === tomorrowDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  const totalLessons = streak?.totalLessons || 0;
  const currentGoal = goals[0];
  const weeklyTarget = currentGoal?.targetPerWeek || 5;
  const weeklyProgress = currentGoal?.currentProgress || 0;

  const { text: greetingText, emoji: greetingEmoji } = getGreeting();
  const streakEmoji = getStreakEmoji(currentStreak);
  const streakTitle = getStreakTitle(currentStreak);

  return (
    <DashboardShell
      title={`${greetingEmoji} ${greetingText}, ${session.user.firstName}!`}
      description={getMotivationalMessage(currentStreak)}
    >
      <div className="space-y-6">
        {/* Hero Stats — Streak & Weekly Target */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Streak Card — Big & Visual */}
          <Card className="overflow-hidden border-0 gradient-streak text-white shadow-lg">
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-white/80">Günlük Seri</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black">{currentStreak}</span>
                    <span className="text-lg font-semibold text-white/80">gün</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-white/90">
                    {streakTitle}
                  </p>
                  <p className="text-xs text-white/70">
                    En uzun seri: {longestStreak} gün
                  </p>
                </div>
                <div className="text-6xl animate-float">{streakEmoji}</div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Target — Progress Ring Style */}
          <Card className="border-0 gradient-card-green shadow-lg">
            <CardContent className="p-6">
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                🎯 Haftalık Hedef
              </p>
              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40" cy="40" r="34"
                      fill="none"
                      stroke="hsl(168 40% 88%)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="40" cy="40" r="34"
                      fill="none"
                      stroke="hsl(168 56% 40%)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(weeklyProgress / weeklyTarget) * 213.6} 213.6`}
                    />
                  </svg>
                  <span className="absolute text-lg font-bold">
                    {weeklyProgress}/{weeklyTarget}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold">
                    {weeklyProgress >= weeklyTarget ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        Hedefe ulaştın!
                      </span>
                    ) : (
                      <>{weeklyTarget - weeklyProgress} ders kaldı</>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {weeklyProgress >= weeklyTarget
                      ? "Tebrikler, bu hafta çok iyi gidiyorsun! 🎉"
                      : "Az kaldı, devam et! 💪"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl gradient-card-blue p-4 text-center">
            <p className="text-2xl">📚</p>
            <p className="text-2xl font-bold">{enrollments.length}</p>
            <p className="text-xs text-muted-foreground">Aktif Ders</p>
          </div>
          <div className="rounded-2xl gradient-card-green p-4 text-center">
            <p className="text-2xl">✅</p>
            <p className="text-2xl font-bold">{totalLessons}</p>
            <p className="text-xs text-muted-foreground">Toplam Katılım</p>
          </div>
          <div className="rounded-2xl gradient-card-orange p-4 text-center">
            <p className="text-2xl">📅</p>
            <p className="text-2xl font-bold">{todayLessons.length}</p>
            <p className="text-xs text-muted-foreground">Bugün Ders</p>
          </div>
          <div className="rounded-2xl gradient-card-purple p-4 text-center">
            <p className="text-2xl">🏆</p>
            <p className="text-2xl font-bold">{longestStreak}</p>
            <p className="text-xs text-muted-foreground">Rekor Seri</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Today's Lessons */}
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <Sparkles className="h-5 w-5 text-teal-500" />
                <CardTitle>Bugünün Dersleri</CardTitle>
                <Badge variant="secondary" className="ml-auto text-xs font-semibold">
                  {getDayLabel(today)}
                </Badge>
              </CardHeader>
              <CardContent>
                {todayLessons.length === 0 ? (
                  <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 py-8 text-center">
                    <p className="mb-1 text-4xl">🎉</p>
                    <p className="font-semibold text-green-700">Bugün ders yok!</p>
                    <p className="text-sm text-green-600">
                      Kendine vakit ayır, tekrar yap veya dinlen.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayLessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="group flex items-center gap-4 rounded-2xl border-2 border-transparent bg-accent/30 p-4 transition-all hover:border-primary/20 hover:shadow-sm"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-white shadow-sm"
                          style={{ backgroundColor: lesson.course.color }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{lesson.course.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                            {lesson.room && (
                              <span className="rounded-md bg-white px-1.5 py-0.5 text-xs font-medium shadow-sm">
                                📍 {lesson.room}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs font-semibold">
                          {lesson.course.code}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tomorrow Preview */}
            {tomorrowLessons.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      ⏭️ Yarın ({getDayLabel(tomorrowDay)})
                    </CardTitle>
                    <Link
                      href="/panel/ogrenci/program"
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Tüm program <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tomorrowLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 rounded-xl bg-accent/30 p-3 text-sm"
                      >
                        <div
                          className="h-8 w-2 rounded-full"
                          style={{ backgroundColor: lesson.courseColor }}
                        />
                        <span className="font-medium">{lesson.courseName}</span>
                        <span className="ml-auto text-muted-foreground">
                          {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Courses Grid */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">📚 Derslerim</CardTitle>
                  <Link
                    href="/panel/ogrenci/dersler"
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Tümünü gör <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-sm text-muted-foreground">
                      Henüz kayıtlı dersin yok. Yakında burada derslerini göreceksin!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {enrollments.slice(0, 4).map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="group rounded-2xl border-2 border-transparent p-4 transition-all hover:border-primary/10 hover:shadow-sm"
                        style={{ backgroundColor: enrollment.course.color + "10" }}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: enrollment.course.color }}
                          >
                            {enrollment.course.code.slice(0, 2)}
                          </div>
                          <span className="font-semibold text-sm">
                            {enrollment.course.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          👨‍🏫 {enrollment.course.teacher.firstName}{" "}
                          {enrollment.course.teacher.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          📅 {enrollment.course.lessonSlots.length} ders/hafta
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Motivation Card */}
            <Card className="border-0 bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 shadow-sm">
              <CardContent className="p-5 text-center">
                <p className="text-3xl mb-2">💡</p>
                <p className="text-sm font-medium text-teal-700">
                  Günün Sözü
                </p>
                <p className="mt-2 text-sm text-teal-600 italic">
                  &ldquo;Bugün öğrendiğin her şey, yarının gücü olacak.&rdquo;
                </p>
              </CardContent>
            </Card>

            {/* Level / XP Progress */}
            <Card className="shadow-sm">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <div>
                      <p className="text-sm font-bold">
                        Seviye {Math.floor(totalLessons / 10) + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {totalLessons % 10}/10 ders
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl">
                    {totalLessons < 10 ? "🌱" : totalLessons < 25 ? "🌿" : totalLessons < 50 ? "🌳" : "🏔️"}
                  </span>
                </div>
                <Progress
                  value={totalLessons % 10}
                  max={10}
                  size="md"
                />
                <p className="mt-2 text-xs text-muted-foreground text-center">
                  {10 - (totalLessons % 10)} ders daha ile seviye atlayacaksın!
                </p>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">📢 Duyurular</CardTitle>
                  <Link
                    href="/panel/ogrenci/duyurular"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Tümü
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-2xl mb-1">🔇</p>
                    <p className="text-sm text-muted-foreground">
                      Henüz duyuru yok.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="rounded-xl bg-accent/30 p-3">
                        <p className="text-sm font-semibold">{ann.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {ann.content}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            👤 {ann.author.firstName} {ann.author.lastName}
                          </span>
                          {ann.course && (
                            <>
                              <span>·</span>
                              <span>📚 {ann.course.name}</span>
                            </>
                          )}
                        </div>
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
