import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminUsersManager } from "@/components/admin/admin-users-manager";

export const metadata = { title: "Kullanıcı Yönetimi | Edunova" };

export default async function AdminUsersPage() {
  await requireAuth(["ADMIN"]);

  const users = await db.user.findMany({
    orderBy: [{ role: "asc" }, { firstName: "asc" }, { lastName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      phone: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          enrollments: true,
          teacherCourses: true,
        },
      },
    },
  });

  return (
    <DashboardShell
      title="Kullanıcı Yönetimi"
      description="Öğrenci, öğretmen ve yönetici hesaplarını oluşturun ve yönetin"
    >
      <AdminUsersManager
        users={users.map((user) => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          phone: user.phone,
          bio: user.bio,
          createdAt: user.createdAt.toISOString(),
          enrollmentCount: user._count.enrollments,
          teachingCourseCount: user._count.teacherCourses,
        }))}
      />
    </DashboardShell>
  );
}
