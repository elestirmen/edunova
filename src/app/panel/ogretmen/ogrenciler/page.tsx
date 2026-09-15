import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section";
import { StatCard } from "@/components/ui/stat-card";
import { BookOpen, Flame, Mail, Users } from "lucide-react";

export const metadata = { title: "Öğrencilerim" };

export default async function TeacherStudentsPage() {
  const session = await requireAuth(["TEACHER"]);

  const courses = await db.course.findMany({
    where: { teacherId: session.user.id },
    include: {
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              streaks: { select: { currentStreak: true, totalLessons: true } },
            },
          },
        },
      },
    },
  });

  interface StudentWithCourses {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    streaks: { currentStreak: number; totalLessons: number } | null;
    courses: string[];
  }

  const allStudents = new Map<string, StudentWithCourses>();
  courses.forEach((course) => {
    course.enrollments.forEach((enrollment) => {
      if (!allStudents.has(enrollment.student.id)) {
        allStudents.set(enrollment.student.id, {
          ...enrollment.student,
          courses: [],
        });
      }
      allStudents.get(enrollment.student.id)!.courses.push(course.name);
    });
  });

  const students = Array.from(allStudents.values()).sort((a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, "tr")
  );

  const activeStreaks = students.filter(
    (s) => (s.streaks?.currentStreak ?? 0) > 0
  ).length;
  const totalAttended = students.reduce(
    (sum, s) => sum + (s.streaks?.totalLessons ?? 0),
    0
  );

  return (
    <DashboardShell
      eyebrow="Öğretmen"
      title="Öğrencilerim"
      description={`Derslerine kayıtlı ${students.length} öğrenci`}
    >
      {students.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Users}
              title="Henüz öğrencin yok"
              description="Derslerine öğrenci kaydedildiğinde burada görünecek."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="stagger grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={Users}
              tone="brand"
              label="Toplam öğrenci"
              value={students.length}
              hint={`${courses.length} derste`}
            />
            <StatCard
              icon={Flame}
              tone="amber"
              label="Aktif seri"
              value={activeStreaks}
              hint="Serisi devam eden öğrenci"
            />
            <StatCard
              icon={BookOpen}
              tone="leaf"
              label="Toplam işlenen ders"
              value={totalAttended}
              hint="Öğrenci katılımı"
            />
          </div>

          <Card>
            <CardHeader className="pb-4">
              <SectionHeader
                icon={Users}
                title="Öğrenci Listesi"
                description="Ad, ders ve seri bilgisi"
                action={<Badge variant="secondary">{students.length} öğrenci</Badge>}
              />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/70">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40 sm:px-6"
                  >
                    <Avatar
                      firstName={student.firstName}
                      lastName={student.lastName}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                        <Mail className="h-3 w-3 shrink-0" />
                        {student.email}
                      </p>
                    </div>
                    <div className="hidden max-w-[240px] shrink-0 flex-wrap justify-end gap-1 sm:flex">
                      {student.courses.map((courseName) => (
                        <Badge key={courseName} variant="muted">
                          {courseName}
                        </Badge>
                      ))}
                    </div>
                    <div className="tabular flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                      <Flame className="h-3.5 w-3.5" />
                      {student.streaks?.currentStreak ?? 0}
                      <span className="font-normal opacity-70">gün</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
