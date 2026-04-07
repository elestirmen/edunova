import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Lock,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  XCircle,
} from "lucide-react";

export default async function StudentProgressPage() {
  const session = await requireAuth(["STUDENT"]);
  const userId = session.user.id;

  const [streak, attendances] = await Promise.all([
    db.streak.findUnique({ where: { userId } }),
    db.attendance.findMany({
      where: { studentId: userId },
      include: {
        lessonSlot: {
          include: { course: { select: { name: true, color: true } } },
        },
      },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  const totalLessons = streak?.totalLessons || 0;

  const presentCount = attendances.filter((a) => a.isPresent).length;
  const attendanceRate = attendances.length > 0 ? Math.round((presentCount / attendances.length) * 100) : 0;

  const level = Math.floor(totalLessons / 10) + 1;
  const levelProgress = totalLessons % 10;

  const milestones = [
    { label: "Ilk Ders", target: 1, icon: BookOpen },
    { label: "Bir Hafta", target: 5, icon: Clock },
    { label: "25 Ders", target: 25, icon: TrendingUp },
    { label: "50 Ders", target: 50, icon: Award },
    { label: "100 Ders", target: 100, icon: Trophy },
  ];

  return (
    <DashboardShell title="Ilerleme" description="Egitim yolculugundaki ilerlemen">
      <div className="space-y-6">
        {/* Hero Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 gradient-streak text-white">
            <CardContent className="p-4 text-center">
              <Flame className="mx-auto mb-1 h-6 w-6" />
              <p className="text-3xl font-black">{currentStreak}</p>
              <p className="text-xs font-medium text-white/80">Gunluk Seri</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="mx-auto mb-1 h-6 w-6 text-amber-500" />
              <p className="text-3xl font-black">{longestStreak}</p>
              <p className="text-xs text-muted-foreground">En Uzun Seri</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="mx-auto mb-1 h-6 w-6 text-blue-500" />
              <p className="text-3xl font-black">{totalLessons}</p>
              <p className="text-xs text-muted-foreground">Toplam Katilim</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-emerald-500" />
              <p className="text-3xl font-black">%{attendanceRate}</p>
              <p className="text-xs text-muted-foreground">Katilim Orani</p>
            </CardContent>
          </Card>
        </div>

        {/* Level */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Seviye {level}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-bold">Seviye {level}</span>
                  <span className="text-xs text-muted-foreground">{levelProgress}/10 ders</span>
                </div>
                <Progress value={levelProgress} max={10} size="md" />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {10 - levelProgress} ders daha ile Seviye {level + 1}&apos;e ulasacaksin!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" />
              Kilometre Taslari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones.map((milestone) => {
                const completed = totalLessons >= milestone.target;
                const progress = Math.min((totalLessons / milestone.target) * 100, 100);
                const Icon = completed ? milestone.icon : Lock;
                return (
                  <div key={milestone.label} className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${completed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex items-center justify-between">
                        <span className={`text-sm font-medium ${completed ? "text-primary" : "text-muted-foreground"}`}>{milestone.label}</span>
                        <span className="text-[11px] text-muted-foreground">{Math.min(totalLessons, milestone.target)}/{milestone.target}</span>
                      </div>
                      <Progress value={progress} size="sm" color={completed ? "bg-gradient-to-r from-teal-500 to-emerald-500" : "bg-muted-foreground/20"} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Son Katilim Gecmisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendances.length === 0 ? (
              <div className="py-6 text-center">
                <TrendingUp className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Henuz katilim kaydi yok.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {attendances.map((att) => (
                  <div key={att.id} className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2">
                    {att.isPresent ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                    )}
                    <span className="flex-1 truncate text-sm font-medium">{att.lessonSlot.course.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{new Date(att.date).toLocaleDateString("tr-TR")}</span>
                    <span className={`text-xs font-medium shrink-0 ${att.isPresent ? "text-emerald-600" : "text-red-500"}`}>
                      {att.isPresent ? "Katildi" : "Katilmadi"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
