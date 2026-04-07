import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Megaphone, Globe, BookOpen } from "lucide-react";

export default async function TeacherAnnouncementsPage() {
  const session = await requireAuth(["TEACHER"]);

  const announcements = await db.announcement.findMany({
    where: {
      OR: [
        { authorId: session.user.id },
        { isGlobal: true },
      ],
    },
    include: {
      author: { select: { firstName: true, lastName: true } },
      course: { select: { name: true, color: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (announcements.length === 0) {
    return (
      <DashboardShell title="Duyurular" description="Duyurularınız ve sistem duyuruları">
        <EmptyState
          icon={Megaphone}
          title="Henüz duyuru yok"
          description="Duyurularınız ve genel duyurular burada görünecek."
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Duyurular" description="Duyurularınız ve sistem duyuruları">
      <div className="space-y-4">
        {announcements.map((ann) => (
          <Card key={ann.id}>
            <CardContent className="p-5">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-semibold">{ann.title}</h3>
                {ann.isGlobal ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Genel
                  </Badge>
                ) : ann.course ? (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {ann.course.name}
                  </Badge>
                ) : null}
              </div>
              <p className="mb-3 text-sm text-muted-foreground whitespace-pre-wrap">
                {ann.content}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{ann.author.firstName} {ann.author.lastName}</span>
                <span>·</span>
                <span>
                  {new Date(ann.createdAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
