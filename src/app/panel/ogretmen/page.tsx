import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import {
  endOfMonth,
  formatCurrency,
  formatRelativeTime,
  formatTime,
  getDayLabel,
  getGreeting,
  getTodayDayOfWeek,
  startOfMonth,
} from "@/lib/utils";
import { DayOfWeek } from "@prisma/client";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Clock,
  Coins,
  FolderOpen,
  MapPin,
  Megaphone,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Ana Sayfa" };

export default async function TeacherDashboard() {
  const session = await requireAuth(["TEACHER"]);
  const teacherId = session.user.id;
  const today = getTodayDayOfWeek();
  const monthStart = startOfMonth();
  const monthEnd = endOfMonth();

  const [courses, todayLessons, announcements, totalStudents, monthEarnings] =
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
        take: 4,
        include: { course: { select: { name: true } } },
      }),
      db.enrollment.count({
        where: { course: { teacherId } },
      }),
      db.teacherEarning.aggregate({
        where: { teacherId, createdAt: { gte: monthStart, lt: monthEnd } },
        _sum: { amount: true, hours: true },
      }),
    ]);

  const totalLessonsPerWeek = courses.reduce(
    (sum, c) => sum + c.lessonSlots.length,
    0
  );
  const earnedThisMonth = Number(monthEarnings._sum.amount ?? 0);
  const hoursThisMonth = Number(monthEarnings._sum.hours ?? 0);
  const { text: greetingText } = getGreeting();

  return (
    <DashboardShell
      eyebrow="Öğretmen paneli"
      title={`${greetingText}, ${session.user.firstName} Hoca`}
      description="Bugünkü dersler, öğrenciler ve bu ayki kazancın"
      action={
        <Link href="/panel/ogretmen/yoklama" className="hidden sm:block">
          <Badge variant="default" className="gap-1.5 px-3 py-1.5">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Yoklama al
          </Badge>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* ---------- Özet ---------- */}
        <div className="stagger grid gap-3 grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <StatCard
            icon={Coins}
            tone="leaf"
            label="Bu ay kazanç"
            value={formatCurrency(earnedThisMonth)}
            hint={`${hoursThisMonth.toFixed(1)} saat ders`}
            href="/panel/ogretmen/kazanclar"
            linkLabel="Kazançlarım"
          />
          <StatCard
            icon={BookOpen}
            tone="ocean"
            label="Aktif ders"
            value={courses.length}
            hint={`${totalLessonsPerWeek} ders/hafta`}
            href="/panel/ogretmen/dersler"
            linkLabel="Derslerim"
          />
          <StatCard
            icon={Users}
            tone="brand"
            label="Toplam öğrenci"
            value={totalStudents}
            hint="Tüm derslerinde"
            href="/panel/ogretmen/ogrenciler"
            linkLabel="Öğrencilerim"
          />
          <StatCard
            icon={CalendarDays}
            tone="violet"
            label="Bugünkü ders"
            value={todayLessons.length}
            hint={getDayLabel(today)}
            href="/panel/ogretmen/program"
            linkLabel="Ders programı"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {/* ---------- Bugünün dersleri ---------- */}
            <Card variant="brand">
              <CardHeader className="pb-4">
                <SectionHeader
                  icon={CalendarDays}
                  title="Bugünün Dersleri"
                  description={`${getDayLabel(today)} programı`}
                  action={
                    <Badge variant={todayLessons.length > 0 ? "default" : "muted"}>
                      {todayLessons.length} ders
                    </Badge>
                  }
                />
              </CardHeader>
              <CardContent>
                {todayLessons.length === 0 ? (
                  <EmptyState
                    icon={CalendarDays}
                    title="Bugün ders yok"
                    description="Programında bugüne tanımlı bir ders bulunmuyor."
                    className="py-8"
                  />
                ) : (
                  <div className="space-y-2.5">
                    {todayLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="relative flex items-center gap-3 overflow-hidden rounded-xl border bg-card p-3.5 shadow-xs transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-md"
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
                        {lesson.recurringMeetingUrl ? (
                          <a
                            href={lesson.recurringMeetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg brand-surface px-3 py-2 text-[11px] font-semibold text-primary-foreground shadow-glow transition-transform duration-200 ease-premium hover:scale-[1.03]"
                          >
                            <Video className="h-3.5 w-3.5" />
                            Derse gir
                          </a>
                        ) : (
                          <Badge variant="outline" className="shrink-0">
                            {lesson.course.code}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ---------- Derslerim ---------- */}
            <Card>
              <CardHeader className="pb-4">
                <SectionHeader
                  icon={BookOpen}
                  title="Derslerim"
                  description="Verdiğin dersler ve öğrenci sayıları"
                  href="/panel/ogretmen/dersler"
                  hrefLabel="Tümünü gör"
                />
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <EmptyState
                    icon={BookOpen}
                    title="Henüz ders yok"
                    description="Yönetici sana bir ders tanımladığında burada görünecek."
                  />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="rounded-xl border bg-card p-3.5 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
                      >
                        <div className="mb-2 flex items-center gap-2.5">
                          <span
                            className="h-8 w-8 shrink-0 rounded-lg text-[10px] font-bold text-white shadow-xs flex items-center justify-center"
                            style={{ backgroundColor: course.color }}
                          >
                            {course.code.slice(0, 2).toUpperCase()}
                          </span>
                          <p className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                            {course.name}
                          </p>
                        </div>
                        <div className="tabular flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course._count.enrollments} öğrenci
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {course.lessonSlots.length} ders/hafta
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ---------- Yan sütun ---------- */}
          <div className="space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <SectionHeader icon={ClipboardCheck} title="Hızlı Erişim" />
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { href: "/panel/ogretmen/yoklama", icon: ClipboardCheck, label: "Yoklama Al", desc: "Ders teslimi ve devamlılık" },
                  { href: "/panel/ogretmen/odevler", icon: FolderOpen, label: "Ödev Ver", desc: "Yeni ödev oluştur" },
                  { href: "/panel/ogretmen/duyurular", icon: Megaphone, label: "Duyuru Yayınla", desc: "Sınıfına bilgilendirme" },
                  { href: "/panel/ogretmen/ogrenciler", icon: Users, label: "Öğrencilerim", desc: "Tüm öğrenci listesi" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl border border-transparent bg-muted/40 p-3 transition-all duration-200 ease-premium hover:border-border hover:bg-card hover:shadow-sm"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold leading-tight">{item.label}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform duration-200 ease-premium group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <SectionHeader
                  icon={Megaphone}
                  title="Son Duyurularım"
                  href="/panel/ogretmen/duyurular"
                />
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    Henüz duyuru yayınlamadın.
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
                          {ann.course?.name ?? "Genel"} • {formatRelativeTime(ann.createdAt)}
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
