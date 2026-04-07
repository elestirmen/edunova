import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getDayLabel, formatTime } from "@/lib/utils";
import { BookOpen, Clock, Users, MapPin } from "lucide-react";

export default async function TeacherCoursesPage() {
  const session = await requireAuth(["TEACHER"]);

  const courses = await db.course.findMany({
    where: { teacherId: session.user.id },
    include: {
      lessonSlots: { orderBy: { startTime: "asc" } },
      _count: { select: { enrollments: true } },
    },
  });

  if (courses.length === 0) {
    return (
      <DashboardShell title="Derslerim" description="Verdiğiniz dersler">
        <EmptyState
          icon={BookOpen}
          title="Henüz atanmış dersiniz yok"
          description="Yönetici size ders atadığında burada görünecektir."
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Derslerim" description="Verdiğiniz dersler">
      <div className="grid gap-6 md:grid-cols-2">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="h-2" style={{ backgroundColor: course.color }} />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{course.name}</CardTitle>
                  <Badge variant="outline" className="mt-1">{course.code}</Badge>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {course._count.enrollments}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {course.description && (
                <p className="mb-4 text-sm text-muted-foreground">
                  {course.description}
                </p>
              )}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Ders Saatleri
                </p>
                {course.lessonSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Ders saati belirlenmemiş.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {course.lessonSlots.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-2 text-sm">
                        <span className="w-24 font-medium">{getDayLabel(slot.dayOfWeek)}</span>
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </span>
                        {slot.room && (
                          <>
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{slot.room}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
