import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, BookOpen, TrendingUp, Flame, GraduationCap } from "lucide-react";

export default async function AdminStatsPage() {
  await requireAuth(["ADMIN"]);

  const [
    totalStudents,
    totalTeachers,
    totalCourses,
    totalLessonSlots,
    totalEnrollments,
    totalAttendances,
    presentAttendances,
    topStreaks,
  ] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.user.count({ where: { role: "TEACHER" } }),
    db.course.count(),
    db.lessonSlot.count(),
    db.enrollment.count(),
    db.attendance.count(),
    db.attendance.count({ where: { isPresent: true } }),
    db.streak.findMany({
      orderBy: { currentStreak: "desc" },
      take: 5,
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  const attendanceRate =
    totalAttendances > 0
      ? Math.round((presentAttendances / totalAttendances) * 100)
      : 0;

  const avgEnrollmentPerCourse =
    totalCourses > 0 ? Math.round(totalEnrollments / totalCourses) : 0;

  return (
    <DashboardShell
      title="İstatistikler"
      description="Sistem geneli istatistikler"
    >
      <div className="space-y-6">
        {/* Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5 text-center">
              <GraduationCap className="mx-auto mb-2 h-8 w-8 text-blue-500" />
              <p className="text-3xl font-bold">{totalStudents}</p>
              <p className="text-sm text-muted-foreground">Toplam Öğrenci</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-green-500" />
              <p className="text-3xl font-bold">{totalTeachers}</p>
              <p className="text-sm text-muted-foreground">Toplam Öğretmen</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <BookOpen className="mx-auto mb-2 h-8 w-8 text-purple-500" />
              <p className="text-3xl font-bold">{totalCourses}</p>
              <p className="text-sm text-muted-foreground">Aktif Ders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <TrendingUp className="mx-auto mb-2 h-8 w-8 text-amber-500" />
              <p className="text-3xl font-bold">%{attendanceRate}</p>
              <p className="text-sm text-muted-foreground">Katılım Oranı</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Özet Metrikler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Toplam Ders Saati</span>
                <span className="font-semibold">{totalLessonSlots}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Toplam Kayıt</span>
                <span className="font-semibold">{totalEnrollments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ders Başına Ort. Öğrenci</span>
                <span className="font-semibold">{avgEnrollmentPerCourse}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Toplam Yoklama Kaydı</span>
                <span className="font-semibold">{totalAttendances}</span>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Genel Katılım Oranı</span>
                  <span className="font-semibold">%{attendanceRate}</span>
                </div>
                <Progress value={attendanceRate} />
              </div>
            </CardContent>
          </Card>

          {/* Top Streaks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                En Yüksek Seriler
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topStreaks.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Henüz seri verisi yok.
                </p>
              ) : (
                <div className="space-y-3">
                  {topStreaks.map((streak, index) => (
                    <div
                      key={streak.id}
                      className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {streak.user.firstName} {streak.user.lastName}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-orange-600">
                        <Flame className="h-4 w-4" />
                        <span className="font-bold">{streak.currentStreak}</span>
                        <span className="text-xs text-muted-foreground">gün</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
