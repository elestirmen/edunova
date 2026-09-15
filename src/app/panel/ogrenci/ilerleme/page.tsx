import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
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

export const metadata = { title: "İlerleme" };

export default async function StudentProgressPage() {
  const session = await requireAuth(["STUDENT"]);
  const userId = session.user.id;

  const [streak, attendances] = await Promise.all([
    db.streak.findUnique({ where: { userId } }),
    db.attendance.findMany({
      where: { studentId: userId },
      include: {
        occurrence: {
          include: {
            lessonSlot: {
              include: { course: { select: { name: true, color: true } } },
            },
          },
        },
      },
      orderBy: { occurrence: { date: "desc" } },
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

  const milestones = [
    { label: "İlk Ders", target: 1, icon: BookOpen },
    { label: "Bir Hafta", target: 5, icon: Clock },
    { label: "25 Ders", target: 25, icon: TrendingUp },
    { label: "50 Ders", target: 50, icon: Award },
    { label: "100 Ders", target: 100, icon: Trophy },
  ];

  return (
    <DashboardShell
      eyebrow="Öğrenci"
      title="İlerleme"
      description="Eğitim yolculuğundaki ilerlemen"
    >
      <div className="space-y-6">
        {/* ---------- Özet ---------- */}
        <div className="stagger grid gap-4 grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Flame}
            tone="amber"
            label="Günlük seri"
            value={currentStreak}
            hint="Gün üst üste"
          />
          <StatCard
            icon={Trophy}
            tone="violet"
            label="En uzun seri"
            value={longestStreak}
            hint="Kişisel rekorun"
          />
          <StatCard
            icon={BookOpen}
            tone="ocean"
            label="Toplam katılım"
            value={totalLessons}
            hint="Tamamlanan ders"
          />
          <StatCard
            icon={CheckCircle2}
            tone="leaf"
            label="Katılım oranı"
            value={`%${attendanceRate}`}
            hint={`Son ${attendances.length} ders`}
          />
        </div>

        {/* ---------- Seviye ---------- */}
        <Card variant="brand">
          <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="relative shrink-0">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/20 blur-2xl" />
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl brand-surface text-primary-foreground shadow-glow">
                <Sparkles className="h-4 w-4 opacity-80" />
                <span className="tabular text-lg font-bold leading-none">{level}</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[15px] font-semibold tracking-tight">
                  Seviye {level}
                </p>
                <p className="tabular text-xs text-muted-foreground">
                  {levelProgress}/10 ders
                </p>
              </div>
              <Progress value={levelProgress} max={10} size="md" />
              <p className="mt-2 text-xs text-muted-foreground">
                {10 - levelProgress} ders daha ile Seviye {level + 1}&apos;e
                ulaşacaksın.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* ---------- Kilometre taşları ---------- */}
          <Card>
            <CardHeader className="pb-4">
              <SectionHeader
                icon={Target}
                title="Kilometre Taşları"
                description="Toplam ders sayına göre açılır"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              {milestones.map((milestone) => {
                const completed = totalLessons >= milestone.target;
                const progress = Math.min(
                  (totalLessons / milestone.target) * 100,
                  100
                );
                const Icon = completed ? milestone.icon : Lock;
                return (
                  <div key={milestone.label} className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${
                        completed
                          ? "bg-primary/10 text-primary ring-primary/15"
                          : "bg-muted text-muted-foreground/70 ring-border"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span
                          className={`text-[13px] font-semibold ${
                            completed ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {milestone.label}
                        </span>
                        <span className="tabular text-[11px] text-muted-foreground">
                          {Math.min(totalLessons, milestone.target)}/
                          {milestone.target}
                        </span>
                      </div>
                      <Progress
                        value={progress}
                        size="sm"
                        color={completed ? undefined : "bg-muted-foreground/25"}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* ---------- Katılım geçmişi ---------- */}
          <Card>
            <CardHeader className="pb-4">
              <SectionHeader
                icon={TrendingUp}
                title="Son Katılım Geçmişi"
                description={`${presentCount}/${attendances.length} derse katıldın`}
              />
            </CardHeader>
            <CardContent>
              {attendances.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="Henüz katılım kaydı yok"
                  description="Derslerin işlendikçe geçmişin burada birikecek."
                />
              ) : (
                <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
                  {attendances.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2.5 rounded-xl border border-transparent bg-muted/40 px-3 py-2.5 transition-colors hover:border-border hover:bg-card"
                    >
                      <span
                        className="h-8 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: att.occurrence.lessonSlot.course.color,
                        }}
                      />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                        {att.occurrence.lessonSlot.course.name}
                      </span>
                      <span className="tabular shrink-0 text-[11px] text-muted-foreground">
                        {formatDate(att.occurrence.date)}
                      </span>
                      <Badge
                        variant={att.isPresent ? "success" : "destructive"}
                        className="shrink-0"
                      >
                        {att.isPresent ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {att.isPresent ? "Katıldı" : "Katılmadı"}
                      </Badge>
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
