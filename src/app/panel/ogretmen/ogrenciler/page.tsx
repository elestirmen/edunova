import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Mail, Flame } from "lucide-react";

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

  const students = Array.from(allStudents.values());

  return (
    <DashboardShell
      title="Ogrencilerim"
      description={`Toplam ${students.length} ogrenci`}
    >
      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Henuz ogrencisiniz yok"
          description="Derslerinize ogrenci kaydedildiginde burada gorunecektir."
        />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Ogrenci Listesi</CardTitle>
              <Badge variant="outline" className="font-normal">{students.length} ogrenci</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {students.map((student) => (
                <div key={student.id} className="flex items-center gap-3 px-4 py-3 sm:px-6">
                  <Avatar firstName={student.firstName} lastName={student.lastName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{student.firstName} {student.lastName}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                      <Mail className="h-3 w-3 shrink-0" />
                      {student.email}
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-wrap gap-1 shrink-0 max-w-[200px] justify-end">
                    {student.courses.map((courseName) => (
                      <Badge key={courseName} variant="secondary" className="text-[10px]">{courseName}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-sm">
                    <Flame className="h-3.5 w-3.5 text-orange-500" />
                    <span className="font-medium">{student.streaks?.currentStreak || 0}</span>
                    <span className="text-[11px] text-muted-foreground">gun</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
