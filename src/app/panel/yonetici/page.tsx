import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  Calendar,
  Megaphone,
  GraduationCap,
  UserCheck,
  ArrowRight,
  BarChart3,
  Settings,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await requireAuth(["ADMIN"]);

  const [
    totalStudents,
    totalTeachers,
    totalCourses,
    totalAnnouncements,
    totalLessonSlots,
    recentUsers,
  ] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.user.count({ where: { role: "TEACHER" } }),
    db.course.count(),
    db.announcement.count(),
    db.lessonSlot.count(),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  const roleLabels: Record<string, string> = {
    STUDENT: "Öğrenci",
    TEACHER: "Öğretmen",
    ADMIN: "Yönetici",
  };

  const stats = [
    { label: "Öğrenci", value: totalStudents, icon: GraduationCap, color: "text-blue-600 bg-blue-50" },
    { label: "Öğretmen", value: totalTeachers, icon: UserCheck, color: "text-emerald-600 bg-emerald-50" },
    { label: "Ders", value: totalCourses, icon: BookOpen, color: "text-purple-600 bg-purple-50" },
    { label: "Ders Saati", value: totalLessonSlots, icon: Calendar, color: "text-amber-600 bg-amber-50" },
    { label: "Duyuru", value: totalAnnouncements, icon: Megaphone, color: "text-rose-600 bg-rose-50" },
  ];

  const quickActions = [
    { label: "Kullanıcı Yönetimi", desc: "Ekle, düzenle, yönet", href: "/panel/yonetici/kullanicilar", icon: Users },
    { label: "Ders Yönetimi", desc: "Dersler ve kayıtlar", href: "/panel/yonetici/dersler", icon: BookOpen },
    { label: "Ders Programı", desc: "Saatler ve sınıflar", href: "/panel/yonetici/program", icon: Calendar },
    { label: "Duyurular", desc: "Duyuruları yönet", href: "/panel/yonetici/duyurular", icon: Megaphone },
    { label: "İstatistikler", desc: "Raporlar ve analiz", href: "/panel/yonetici/istatistikler", icon: BarChart3 },
    { label: "Ayarlar", desc: "Sistem ayarları", href: "/panel/yonetici/ayarlar", icon: Settings },
  ];

  return (
    <DashboardShell
      title={`Hoş geldin, ${session.user.firstName}!`}
      description="Sistem yönetim paneli"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2.5 ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Quick Actions */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Hızlı Erişim</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent hover:shadow-sm"
                >
                  <action.icon className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-[11px] text-muted-foreground">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Son Kayıtlar</CardTitle>
                <Link
                  href="/panel/yonetici/kullanicilar"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Tümü <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="shrink-0 text-right ml-3">
                    <Badge variant="secondary" className="text-[10px]">
                      {roleLabels[user.role]}
                    </Badge>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
