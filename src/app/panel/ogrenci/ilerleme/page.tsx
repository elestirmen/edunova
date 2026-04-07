import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getStreakEmoji } from "@/lib/utils";

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
  const attendanceRate =
    attendances.length > 0
      ? Math.round((presentCount / attendances.length) * 100)
      : 0;

  const level = Math.floor(totalLessons / 10) + 1;
  const levelProgress = totalLessons % 10;

  const levelEmoji = (lvl: number) => {
    if (lvl <= 1) return "🌱";
    if (lvl <= 3) return "🌿";
    if (lvl <= 5) return "🌳";
    if (lvl <= 8) return "🏔️";
    if (lvl <= 10) return "🌟";
    return "👑";
  };

  const milestones = [
    { label: "İlk Ders", target: 1, emoji: "🎒" },
    { label: "Bir Hafta", target: 5, emoji: "📅" },
    { label: "25 Ders", target: 25, emoji: "🚀" },
    { label: "50 Ders", target: 50, emoji: "💎" },
    { label: "100 Ders", target: 100, emoji: "👑" },
  ];

  return (
    <DashboardShell
      title="📊 İlerleme"
      description="Eğitim yolculuğundaki ilerlemen"
    >
      <div className="space-y-6">
        {/* Hero Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 gradient-streak text-white shadow-lg">
            <CardContent className="p-5 text-center">
              <p className="text-3xl mb-1">{getStreakEmoji(currentStreak)}</p>
              <p className="text-4xl font-black">{currentStreak}</p>
              <p className="text-sm font-medium text-white/80">Günlük Seri</p>
            </CardContent>
          </Card>
          <Card className="border-0 gradient-card-purple shadow-lg">
            <CardContent className="p-5 text-center">
              <p className="text-3xl mb-1">🏆</p>
              <p className="text-4xl font-black">{longestStreak}</p>
              <p className="text-sm font-medium text-muted-foreground">En Uzun Seri</p>
            </CardContent>
          </Card>
          <Card className="border-0 gradient-card-blue shadow-lg">
            <CardContent className="p-5 text-center">
              <p className="text-3xl mb-1">📚</p>
              <p className="text-4xl font-black">{totalLessons}</p>
              <p className="text-sm font-medium text-muted-foreground">Toplam Katılım</p>
            </CardContent>
          </Card>
          <Card className="border-0 gradient-card-green shadow-lg">
            <CardContent className="p-5 text-center">
              <p className="text-3xl mb-1">✅</p>
              <p className="text-4xl font-black">%{attendanceRate}</p>
              <p className="text-sm font-medium text-muted-foreground">Katılım Oranı</p>
            </CardContent>
          </Card>
        </div>

        {/* Level */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {levelEmoji(level)} Seviye {level}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-5xl">{levelEmoji(level)}</div>
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold">Seviye {level}</span>
                  <span className="text-sm text-muted-foreground">
                    {levelProgress}/10 ders
                  </span>
                </div>
                <Progress value={levelProgress} max={10} size="lg" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {10 - levelProgress} ders daha ile Seviye {level + 1}&apos;e ulaşacaksın! {levelEmoji(level + 1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>🏅 Kilometre Taşları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone) => {
                const completed = totalLessons >= milestone.target;
                const progress = Math.min(
                  (totalLessons / milestone.target) * 100,
                  100
                );
                return (
                  <div key={milestone.label} className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
                        completed
                          ? "bg-gradient-to-br from-teal-100 to-emerald-100"
                          : "bg-muted"
                      }`}
                    >
                      {completed ? milestone.emoji : "🔒"}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span
                          className={`text-sm font-bold ${
                            completed ? "text-teal-700" : "text-muted-foreground"
                          }`}
                        >
                          {milestone.label}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {Math.min(totalLessons, milestone.target)}/{milestone.target}
                        </span>
                      </div>
                      <Progress
                        value={progress}
                        size="sm"
                        color={completed ? "bg-gradient-to-r from-teal-500 to-emerald-500" : "bg-muted-foreground/20"}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>📋 Son Katılım Geçmişi</CardTitle>
          </CardHeader>
          <CardContent>
            {attendances.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm text-muted-foreground">
                  Henüz katılım kaydı yok.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {attendances.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-3 rounded-xl bg-accent/30 p-3"
                  >
                    <span className="text-lg">
                      {att.isPresent ? "✅" : "❌"}
                    </span>
                    <span className="flex-1 text-sm font-medium">
                      {att.lessonSlot.course.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(att.date).toLocaleDateString("tr-TR")}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        att.isPresent ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {att.isPresent ? "Katıldı" : "Katılmadı"}
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
