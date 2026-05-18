import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { LessonStatus } from "@prisma/client";

export const metadata = { title: "Ders Kayıtları | Edunova" };

const statusLabel: Record<LessonStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  SCHEDULED: { label: "Planlandı", variant: "outline" },
  DELIVERED: { label: "Yapıldı", variant: "success" },
  CANCELLED_EARLY: { label: "İptal (erken)", variant: "secondary" },
  CANCELLED_LATE: { label: "İptal (geç)", variant: "warning" },
  STUDENT_NO_SHOW: { label: "Öğrenci gelmedi", variant: "warning" },
  TEACHER_NO_SHOW: { label: "Öğretmen gelmedi", variant: "destructive" },
};

export default async function ParentLessonsPage() {
  const session = await requireAuth(["PARENT"]);

  const links = await db.parentStudent.findMany({
    where: { parentId: session.user.id },
    include: {
      student: { select: { firstName: true, lastName: true, id: true } },
    },
  });

  const data = await Promise.all(
    links.map(async (link) => {
      const attendance = await db.attendance.findMany({
        where: { studentId: link.studentId },
        include: {
          occurrence: {
            include: {
              lessonSlot: { include: { course: true } },
            },
          },
        },
        orderBy: { occurrence: { date: "desc" } },
        take: 50,
      });
      return { student: link.student, attendance };
    })
  );

  return (
    <DashboardShell title="Ders Kayıtları" description="Çocuğunun ders devamlılığı">
      <div className="space-y-6">
        {data.map((d) => (
          <Card key={d.student.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {d.student.firstName} {d.student.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {d.attendance.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  <Calendar className="mx-auto mb-2 h-6 w-6 opacity-50" />
                  Henüz ders kaydı yok.
                </p>
              ) : (
                <div className="divide-y">
                  {d.attendance.map((a) => {
                    const status = statusLabel[a.occurrence.status];
                    return (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 py-2.5"
                      >
                        {a.isPresent ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        ) : a.occurrence.status === "TEACHER_NO_SHOW" ? (
                          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                        ) : (
                          <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {a.occurrence.lessonSlot.course.name}
                          </p>
                          {a.occurrence.teacherNote && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              {a.occurrence.teacherNote}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {formatDate(a.occurrence.date)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
