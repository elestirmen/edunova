import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckCircle2, Clock, Heart, NotebookPen, XCircle } from "lucide-react";
import { formatDate, startOfWeek, endOfWeek, formatHours } from "@/lib/utils";

export const metadata = { title: "Haftalık Özet" };

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
      eyebrow="Veli"
      title="Haftalık Özet"
      description={`${formatDate(wkStart)} – ${formatDate(wkEnd)} dönemi`}
    >
      {summaries.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Heart}
              title="Bağlı öğrenci bulunmuyor"
              description="Hesabın bir öğrenciyle eşleştirildiğinde haftalık özet burada görünecek."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {summaries.map((s) => (
            <section key={s.student.id} className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
                <Avatar
                  firstName={s.student.firstName}
                  lastName={s.student.lastName}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[15px] font-semibold tracking-tight">
                    {s.student.firstName} {s.student.lastName}
                  </h2>
                  <p className="text-xs text-muted-foreground">Bu haftanın özeti</p>
                </div>
              </div>

              <div className="stagger grid gap-4 sm:grid-cols-3">
                <StatCard
                  icon={CheckCircle2}
                  tone="leaf"
                  label="Tamamlanan ders"
                  value={s.delivered}
                  hint="Katılım sağlanan"
                />
                <StatCard
                  icon={XCircle}
                  tone={s.missed > 0 ? "amber" : "neutral"}
                  label="Kaçırılan / iptal"
                  value={s.missed}
                  hint="Bu hafta"
                />
                <StatCard
                  icon={Clock}
                  tone="ocean"
                  label="Kullanılan saat"
                  value={formatHours(s.hoursUsed)}
                  hint="Bakiyeden düşen"
                />
              </div>

              <Card>
                <CardHeader className="pb-4">
                  <SectionHeader
                    icon={NotebookPen}
                    title="Bu Haftaki Ders Notları"
                    description="Öğretmenlerin ders sonrası notları"
                  />
                </CardHeader>
                <CardContent>
                  {s.notes.length === 0 ? (
                    <p className="py-6 text-center text-xs text-muted-foreground">
                      Bu hafta için ders notu girilmemiş.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {s.notes.map((occ) => (
                        <div
                          key={occ.id}
                          className="rounded-xl border-l-2 bg-muted/40 px-3.5 py-3"
                          style={{ borderLeftColor: occ.lessonSlot.course.color }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-[13px] font-semibold">
                              {occ.lessonSlot.course.name}
                            </p>
                            <span className="tabular shrink-0 text-[11px] text-muted-foreground">
                              {formatDate(occ.date)}
                            </span>
                          </div>
                          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                            {occ.teacherNote}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
