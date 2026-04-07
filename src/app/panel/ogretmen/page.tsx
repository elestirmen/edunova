import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getDayLabel,
  getTodayDayOfWeek,
  formatTime,
} from "@/lib/utils";
import { DayOfWeek } from "@prisma/client";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Megaphone,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default async function TeacherDashboard() {
  const session = await requireAuth(["TEACHER"]);
  const teacherId = session.user.id;
  const today = getTodayDayOfWeek();

  const [courses, todayLessons, announcements, totalStudents] =
    await Promise.all([
      db.course.findMany({
        where: { teacherId },
        include: {
          _count: { select: { enrollments: true } },
          lessonSlots: true,
        },
      }),
      db.lessonSlot.findMany({
        where: {
          dayOfWeek: today as DayOfWeek,
          course: { teacherId },
        },
        include: {
          course: { select: { name: true, code: true, color: true } },
        },
        orderBy: { startTime: "asc" },
      }),
      db.announcement.findMany({
        where: { authorId: teacherId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { course: { select: { name: true } } },
      }),
      db.enrollment.count({
        where: { course: { teacherId } },
      }),
    ]);

  const totalLessonsPerWeek = courses.reduce(
    (sum, c) => sum + c.lessonSlots.length,
    0
  );

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi günler";
    return "İyi akşamlar";
  })();

  return (
    <DashboardShell
      title={`${greeting}, ${session.user.firstName} Hoca!`}
      description="Ders ve öğrenci yönetimi"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-lg bg-blue-100 p-3">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-xs text-muted-foreground">Aktif Ders</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-lg bg-green-100 p-3">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-xs text-muted-foreground">Toplam Öğrenci</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-lg bg-purple-100 p-3">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLessonsPerWeek}</p>
                <p className="text-xs text-muted-foreground">Haftalık Ders</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-lg bg-amber-100 p-3">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayLessons.length}</p>
                <p className="text-xs text-muted-foreground">Bugünkü Ders</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Lessons */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Bugünün Dersleri
                  </CardTitle>
                  <Badge variant="secondary">{getDayLabel(today)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {todayLessons.length === 0 ? (
                  <div className="rounded-lg bg-muted/50 py-8 text-center">
                    <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Bugün ders bulunmuyor.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-4 rounded-lg border p-4"
                      >
                        <div
                          className="h-10 w-1 rounded-full"
                          style={{ backgroundColor: lesson.course.color }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{lesson.course.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(lesson.startTime)} -{" "}
                            {formatTime(lesson.endTime)}
                            {lesson.room && (
                              <>
                                <span>·</span>
                                {lesson.room}
                              </>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">{lesson.course.code}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Courses */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Derslerim</CardTitle>
                  <Link
                    href="/panel/ogretmen/dersler"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Tümünü gör <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: course.color }}
                        />
                        <span className="font-medium text-sm">
                          {course.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{course._count.enrollments} öğrenci</span>
                        <span>·</span>
                        <span>{course.lessonSlots.length} ders/hafta</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="/panel/ogretmen/duyurular"
                  className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 text-sm transition-colors hover:bg-accent"
                >
                  <Megaphone className="h-4 w-4 text-primary" />
                  Duyuru Yayınla
                </Link>
                <Link
                  href="/panel/ogretmen/ogrenciler"
                  className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 text-sm transition-colors hover:bg-accent"
                >
                  <Users className="h-4 w-4 text-primary" />
                  Öğrencileri Gör
                </Link>
                <Link
                  href="/panel/ogretmen/program"
                  className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 text-sm transition-colors hover:bg-accent"
                >
                  <Calendar className="h-4 w-4 text-primary" />
                  Ders Programı
                </Link>
              </CardContent>
            </Card>

            {/* Recent Announcements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Son Duyurularım</CardTitle>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Henüz duyuru yayınlamadınız.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="border-b pb-3 last:border-0 last:pb-0">
                        <p className="text-sm font-medium">{ann.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {ann.content}
                        </p>
                        {ann.course && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {ann.course.name}
                          </p>
                        )}
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
