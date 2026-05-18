import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Duyurular | Edunova" };

export default async function ParentAnnouncementsPage() {
  const session = await requireAuth(["PARENT"]);

  const links = await db.parentStudent.findMany({
    where: { parentId: session.user.id },
    select: { studentId: true },
  });
  const studentIds = links.map((l) => l.studentId);

  const announcements = await db.announcement.findMany({
    where: {
      OR: [
        { isGlobal: true },
        {
          course: {
            enrollments: { some: { studentId: { in: studentIds } } },
          },
        },
      ],
    },
    include: {
      author: { select: { firstName: true, lastName: true } },
      course: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <DashboardShell title="Duyurular" description="Çocuğunla ilgili tüm duyurular">
      {announcements.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
            Henüz duyuru yok.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <Card key={ann.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-sm font-bold">{ann.title}</h3>
                  {ann.isGlobal ? (
                    <Badge variant="default" className="shrink-0 text-[10px]">
                      Genel
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {ann.course?.name}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {ann.content}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {ann.author.firstName} {ann.author.lastName} •{" "}
                  {formatDateTime(ann.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
