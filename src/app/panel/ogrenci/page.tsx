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
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  Sparkles,
  Target,
  Trophy,
  User,
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
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
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

  const { text: greetingText } = getGreeting();

  return (
    <DashboardShell
      title={`${greetingText}, ${session.user.firstName}!`}
      description={getMotivationalMessage(currentStreak)}
    >
      <div className="space-y-6">
        {/* Hero Stats */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="overflow-hidden border-0 gradient-streak text-white shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-white/80">Gunluk Seri</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">{currentStreak}</span>
                    <span className="text-sm font-medium text-white/70">gun</span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-white/90">{getStreakTitle(currentStreak)}</p>
                  <p className="text-xs text-white/60">En uzun: {longestStreak} gun</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Flame className="h-10 w-10 text-white/90" />
                  <span className="text-lg">{getStreakEmoji(currentStreak)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 gradient-card-green shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground mb-2">
                <Target className="h-4 w-4" />
                Haftalik Hedef
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <svg className="h-16 w-16 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(168 40% 88%)" strokeWidth="7" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(168 56% 40%)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(Math.min(weeklyProgress / weeklyTarget, 1)) * 213.6} 213.6`} />
                  </svg>
                  <span className="absolute text-sm font-bold">{weeklyProgress}/{weeklyTarget}</span>
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold">
                    {weeklyProgress >= weeklyTarget ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Hedefe ulastin!
                      </span>
                    ) : (
                      <>{weeklyTarget - weeklyProgress} ders kaldi</>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {weeklyProgress >= weeklyTarget ? "Bu hafta harika gidiyorsun!" : "Devam et, az kaldi!"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatMini icon={BookOpen} label="Aktif Ders" value={enrollments.length} color="text-blue-600 bg-blue-50" />
          <StatMini icon={CheckCircle2} label="Toplam Katilim" value={totalLessons} color="text-emerald-600 bg-emerald-50" />
          <StatMini icon={Calendar} label="Bugun Ders" value={todayLessons.length} color="text-amber-600 bg-amber-50" />
          <StatMini icon={Trophy} label="Rekor Seri" value={longestStreak} color="text-purple-600 bg-purple-50" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Today's Lessons */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Bugunun Dersleri</CardTitle>
                <Badge variant="secondary" className="ml-auto text-xs">{getDayLabel(today)}</Badge>
              </CardHeader>
              <CardContent>
                {todayLessons.length === 0 ? (
                  <div className="rounded-lg bg-emerald-50 py-6 text-center">
                    <Calendar className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                    <p className="font-medium text-emerald-700">Bugun ders yok!</p>
                    <p className="text-sm text-emerald-600">Kendine vakit ayir veya tekrar yap.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todayLessons.map((lesson, index) => (
                      <div key={lesson.id} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: lesson.course.color }}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{lesson.course.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                            {lesson.room && (
                              <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" />{lesson.room}</span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">{lesson.course.code}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tomorrow Preview */}
            {tomorrowLessons.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Yarin ({getDayLabel(tomorrowDay)})</CardTitle>
                    <Link href="/panel/ogrenci/program" className="flex items-center gap-1 text-xs text-primary hover:underline">
                      Tum program <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {tomorrowLessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm">
                        <span className="h-6 w-1.5 rounded-full" style={{ backgroundColor: lesson.courseColor }} />
                        <span className="font-medium">{lesson.courseName}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Courses */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Derslerim</CardTitle>
                  </div>
                  <Link href="/panel/ogrenci/dersler" className="flex items-center gap-1 text-xs text-primary hover:underline">
                    Tumunu gor <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <div className="py-6 text-center">
                    <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Henuz kayitli dersin yok.</p>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {enrollments.slice(0, 4).map((enrollment) => (
                      <div key={enrollment.id} className="rounded-lg border p-3 transition-colors hover:bg-muted/30">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="h-7 w-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: enrollment.course.color }}>
                            {enrollment.course.code.slice(0, 2)}
                          </span>
                          <span className="font-medium text-sm truncate">{enrollment.course.name}</span>
                        </div>
                        <div className="space-y-0.5 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1"><User className="h-3 w-3" />{enrollment.course.teacher.firstName} {enrollment.course.teacher.lastName}</p>
                          <p className="flex items-center gap-1"><Calendar className="h-3 w-3" />{enrollment.course.lessonSlots.length} ders/hafta</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Level */}
            <Card>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-bold">Seviye {Math.floor(totalLessons / 10) + 1}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{totalLessons % 10}/10 ders</span>
                </div>
                <Progress value={totalLessons % 10} max={10} size="sm" />
                <p className="mt-1.5 text-[11px] text-muted-foreground text-center">
                  {10 - (totalLessons % 10)} ders daha ile seviye atlayacaksin!
                </p>
              </CardContent>
            </Card>

            {/* Motivation */}
            <Card className="border-0 bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
              <CardContent className="p-4 text-center">
                <Sparkles className="mx-auto mb-1.5 h-5 w-5 text-teal-500" />
                <p className="text-xs font-medium text-teal-700">Gunun Sozu</p>
                <p className="mt-1.5 text-sm text-teal-600 italic">
                  &ldquo;Bugun ogrendigin her sey, yarinin gucu olacak.&rdquo;
                </p>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">Duyurular</CardTitle>
                  </div>
                  <Link href="/panel/ogrenci/duyurular" className="text-xs text-primary hover:underline">Tumu</Link>
                </div>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <div className="py-3 text-center">
                    <Bell className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Henuz duyuru yok.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="rounded-lg bg-muted/40 p-2.5">
                        <p className="text-sm font-medium">{ann.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{ann.content}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-0.5"><User className="h-2.5 w-2.5" />{ann.author.firstName} {ann.author.lastName}</span>
                          {ann.course && (
                            <><span>·</span><span className="flex items-center gap-0.5"><BookOpen className="h-2.5 w-2.5" />{ann.course.name}</span></>
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

function StatMini({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string }) {
  const [iconColor, bgColor] = color.split(" ");
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <div className={`rounded-lg p-2 ${bgColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div>
          <p className="text-xl font-bold leading-none">{value}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
