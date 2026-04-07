import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDayLabel, getTodayDayOfWeek, formatTime } from "@/lib/utils";
import { DayOfWeek } from "@prisma/client";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Megaphone,
  TrendingUp,
  ArrowRight,
  MapPin,
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

  const totalLessonsPerWeek = courses.reduce((sum, c) => sum + c.lessonSlots.length, 0);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Gunaydin";
    if (hour < 18) return "Iyi gunler";
    return "Iyi aksamlar";
  })();

  const stats = [
    { label: "Aktif Ders", value: courses.length, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
    { label: "Toplam Ogrenci", value: totalStudents, icon: Users, color: "text-emerald-600 bg-emerald-50" },
    { label: "Haftalik Ders", value: totalLessonsPerWeek, icon: Calendar, color: "text-purple-600 bg-purple-50" },
    { label: "Bugunku Ders", value: todayLessons.length, icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <DashboardShell
      title={`${greeting}, ${session.user.firstName} Hoca!`}
      description="Ders ve ogrenci yonetimi"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2.5 ${stat.color.split(" ")[1]}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color.split(" ")[0]}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Lessons + Courses */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Bugunun Dersleri</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">{getDayLabel(today)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {todayLessons.length === 0 ? (
                  <div className="rounded-lg bg-muted/50 py-6 text-center">
                    <Calendar className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Bugun ders bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todayLessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center gap-3 rounded-lg border p-3">
                        <span className="h-8 w-1 rounded-full" style={{ backgroundColor: lesson.course.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{lesson.course.name}</p>
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

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Derslerim</CardTitle>
                  </div>
                  <Link href="/panel/ogretmen/dersler" className="flex items-center gap-1 text-xs text-primary hover:underline">
                    Tumunu gor <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {courses.map((course) => (
                    <div key={course.id} className="rounded-lg border p-3">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: course.color }} />
                        <span className="text-sm font-medium truncate">{course.name}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        <span>{course._count.enrollments} ogrenci</span>
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
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Hizli Erisim</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <Link href="/panel/ogretmen/duyurular" className="flex items-center gap-2.5 rounded-lg bg-muted/40 p-2.5 text-sm transition-colors hover:bg-accent">
                  <Megaphone className="h-4 w-4 text-primary" />
                  Duyuru Yayinla
                </Link>
                <Link href="/panel/ogretmen/ogrenciler" className="flex items-center gap-2.5 rounded-lg bg-muted/40 p-2.5 text-sm transition-colors hover:bg-accent">
                  <Users className="h-4 w-4 text-primary" />
                  Ogrencileri Gor
                </Link>
                <Link href="/panel/ogretmen/program" className="flex items-center gap-2.5 rounded-lg bg-muted/40 p-2.5 text-sm transition-colors hover:bg-accent">
                  <Calendar className="h-4 w-4 text-primary" />
                  Ders Programi
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Son Duyurularim</CardTitle>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">Henuz duyuru yayinlamadiniz.</p>
                ) : (
                  <div className="space-y-2.5">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="border-b pb-2.5 last:border-0 last:pb-0">
                        <p className="text-sm font-medium">{ann.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{ann.content}</p>
                        {ann.course && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{ann.course.name}</p>
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
