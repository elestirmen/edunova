import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Mail } from "lucide-react";

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
          courses: [] as string[],
        });
      }
      allStudents.get(enrollment.student.id)!.courses.push(course.name);
    });
  });

  const students = Array.from(allStudents.values());

  return (
    <DashboardShell
      title="Öğrencilerim"
      description={`Toplam ${students.length} öğrenci`}
    >
      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Henüz öğrenciniz yok"
          description="Derslerinize öğrenci kaydedildiğinde burada görünecektir."
        />
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <Card key={student.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar
                  firstName={student.firstName}
                  lastName={student.lastName}
                />
                <div className="flex-1">
                  <p className="font-medium">
                    {student.firstName} {student.lastName}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {student.email}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {student.courses.map((courseName: string) => (
                    <Badge key={courseName} variant="secondary" className="text-xs">
                      {courseName}
                    </Badge>
                  ))}
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">
                    {student.streaks?.currentStreak || 0} gün
                  </p>
                  <p className="text-xs text-muted-foreground">seri</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
