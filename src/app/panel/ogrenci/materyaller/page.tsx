import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, FolderOpen, Image as ImageIcon, Link2, Video } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Materyaller | Edunova" };

const typeIcons = {
  PDF: FileText,
  LINK: Link2,
  VIDEO: Video,
  IMAGE: ImageIcon,
  OTHER: FolderOpen,
};

export default async function StudentMaterialsPage() {
  const session = await requireAuth(["STUDENT"]);

  const materials = await db.material.findMany({
    where: {
      course: { enrollments: { some: { studentId: session.user.id } } },
    },
    include: {
      course: { select: { name: true, color: true } },
      topic: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Ders bazlı grupla
  const groups = new Map<
    string,
    { courseName: string; color: string; items: typeof materials }
  >();
  for (const m of materials) {
    const key = m.courseId;
    if (!groups.has(key)) {
      groups.set(key, {
        courseName: m.course.name,
        color: m.course.color,
        items: [],
      });
    }
    groups.get(key)!.items.push(m);
  }

  return (
    <DashboardShell title="Materyaller" description="Öğretmenlerinin paylaştığı kaynaklar">
      {materials.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            <FolderOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
            Henüz materyal paylaşılmamış.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Array.from(groups.values()).map((group) => (
            <Card key={group.courseName}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  {group.courseName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {group.items.map((m) => {
                    const Icon = typeIcons[m.type as keyof typeof typeIcons];
                    return (
                      <li key={m.id} className="flex items-center gap-3 py-2.5">
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium hover:underline"
                          >
                            {m.title}
                          </a>
                          {m.description && (
                            <p className="text-[11px] text-muted-foreground">
                              {m.description}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground">
                            {m.topic && `${m.topic.name} • `}
                            {formatDate(m.createdAt)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {m.type}
                        </Badge>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
