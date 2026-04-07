import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminAnnouncementsManager } from "@/components/admin/admin-announcements-manager";

export const metadata = { title: "Duyuru Yönetimi | Edunova" };

export default async function AdminAnnouncementsPage() {
  await requireAuth(["ADMIN"]);

  const [announcements, courses] = await Promise.all([
    db.announcement.findMany({
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.course.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
      },
    }),
  ]);

  return (
    <DashboardShell
      title="Duyuru Yönetimi"
      description="Genel ve derse özel duyuruları yayınlayın ve düzenleyin"
    >
      <AdminAnnouncementsManager
        courses={courses}
        announcements={announcements.map((announcement) => ({
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          isGlobal: announcement.isGlobal,
          courseId: announcement.courseId,
          courseName: announcement.course?.name ?? null,
          authorName: `${announcement.author.firstName} ${announcement.author.lastName}`,
          createdAt: announcement.createdAt.toISOString(),
        }))}
      />
    </DashboardShell>
  );
}
