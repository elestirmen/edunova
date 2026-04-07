import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getDayLabel, formatTime } from "@/lib/utils";
import { BookOpen, Clock, MapPin, User } from "lucide-react";

export const metadata = { title: "Derslerim | Edunova" };

export default async function StudentCoursesPage() {
  const session = await requireAuth(["STUDENT"]);

  const enrollments = await db.enrollment.findMany({
    where: { studentId: session.user.id },
    include: {
      course: {
        include: {
          teacher: { select: { firstName: true, lastName: true } },
          lessonSlots: { orderBy: { startTime: "asc" } },
          _count: { select: { enrollments: true } },
        },
      },
    },
  });

  if (enrollments.length === 0) {
    return (
      <DashboardShell title="Derslerim" description="Kayıtlı olduğun dersler">
        <EmptyState
          icon={BookOpen}
          title="Henüz dersin yok"
          description="Kayıtlı olduğun dersler burada görünecek. Yöneticin seni derslere ekleyecek."
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Derslerim" description="Kayıtlı olduğun dersler">
      <div className="grid gap-6 md:grid-cols-2">
        {enrollments.map((enrollment) => {
          const course = enrollment.course;
          return (
            <Card key={enrollment.id} className="overflow-hidden">
              <div
                className="h-2"
                style={{ backgroundColor: course.color }}
              />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{course.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {course.code}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {course.teacher.firstName} {course.teacher.lastName}
                </div>

                {course.description && (
                  <p className="text-sm text-muted-foreground">
                    {course.description}
                  </p>
                )}

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Ders Saatleri
                  </p>
                  {course.lessonSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Henüz ders saati belirlenmemiş.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {course.lessonSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="w-24 font-medium">
                            {getDayLabel(slot.dayOfWeek)}
                          </span>
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {formatTime(slot.startTime)} -{" "}
                            {formatTime(slot.endTime)}
                          </span>
                          {slot.room && (
                            <>
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {slot.room}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  {course._count.enrollments} öğrenci kayıtlı
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}
