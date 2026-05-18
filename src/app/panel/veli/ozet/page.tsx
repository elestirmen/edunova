import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, startOfWeek, endOfWeek, formatHours } from "@/lib/utils";

export const metadata = { title: "Haftalık Özet | Edunova" };

export default async function ParentWeeklySummaryPage() {
  const session = await requireAuth(["PARENT"]);

  const links = await db.parentStudent.findMany({
    where: { parentId: session.user.id },
    include: { student: { select: { firstName: true, lastName: true, id: true } } },
  });

  const wkStart = startOfWeek();
  const wkEnd = endOfWeek();

  const summaries = await Promise.all(
    links.map(async (link) => {
      const [delivered, missed, hoursUsed, recentNotes] = await Promise.all([
        db.lessonOccurrence.count({
          where: {
            status: "DELIVERED",
            date: { gte: wkStart, lt: wkEnd },
            attendances: {
              some: { studentId: link.studentId, isPresent: true },
            },
          },
        }),
        db.lessonOccurrence.count({
          where: {
            date: { gte: wkStart, lt: wkEnd },
            OR: [
              {
                status: "DELIVERED",
                attendances: {
                  some: { studentId: link.studentId, isPresent: false },
                },
              },
              { status: { in: ["CANCELLED_LATE", "STUDENT_NO_SHOW"] } },
            ],
          },
        }),
        db.hourLedgerEntry.aggregate({
          where: {
            studentId: link.studentId,
            reason: "LESSON_USED",
            createdAt: { gte: wkStart, lt: wkEnd },
          },
          _sum: { hours: true },
        }),
        db.lessonOccurrence.findMany({
          where: {
            status: "DELIVERED",
            date: { gte: wkStart, lt: wkEnd },
            attendances: { some: { studentId: link.studentId } },
            teacherNote: { not: null },
          },
          include: { lessonSlot: { include: { course: true } } },
          orderBy: { date: "desc" },
        }),
      ]);

      return {
        student: link.student,
        delivered,
        missed,
        hoursUsed: Math.abs(Number(hoursUsed._sum.hours ?? 0)),
        notes: recentNotes,
      };
    })
  );

  return (
    <DashboardShell
      title="Haftalık Özet"
      description={`${formatDate(wkStart)} – ${formatDate(wkEnd)}`}
    >
      <div className="space-y-6">
        {summaries.map((s) => (
          <Card key={s.student.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {s.student.firstName} {s.student.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {s.delivered}
                  </p>
                  <p className="text-xs text-muted-foreground">Tamamlanan ders</p>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {s.missed}
                  </p>
                  <p className="text-xs text-muted-foreground">Kaçırılan / iptal</p>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {formatHours(s.hoursUsed)}
                  </p>
                  <p className="text-xs text-muted-foreground">Kullanılan saat</p>
                </div>
              </div>

              {s.notes.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold">Bu haftaki ders notları</p>
                  <div className="space-y-2">
                    {s.notes.map((occ) => (
                      <div
                        key={occ.id}
                        className="rounded-lg bg-muted/40 p-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {occ.lessonSlot.course.name}
                          </p>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDate(occ.date)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {occ.teacherNote}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
