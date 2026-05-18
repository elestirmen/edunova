import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminTeacherRatesManager } from "@/components/admin/admin-teacher-rates-manager";

export const metadata = { title: "Öğretmen Ücretleri | Edunova" };

export default async function AdminRatesPage() {
  await requireAuth(["ADMIN"]);

  const teachers = await db.user.findMany({
    where: { role: "TEACHER", isActive: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });

  const rates = await db.teacherRate.findMany({
    where: { effectiveTo: null },
    orderBy: { effectiveFrom: "desc" },
  });

  const grouped = teachers.map((t) => ({
    teacher: t,
    individual: rates.find((r) => r.teacherId === t.id && r.courseType === "INDIVIDUAL"),
    group: rates.find((r) => r.teacherId === t.id && r.courseType === "GROUP"),
  }));

  return (
    <DashboardShell title="Öğretmen Ücretleri" description="Saatlik tarifeler (birebir ve grup için ayrı)">
      <AdminTeacherRatesManager
        rows={grouped.map((g) => ({
          teacherId: g.teacher.id,
          teacherName: `${g.teacher.firstName} ${g.teacher.lastName}`,
          individualRate: g.individual ? Number(g.individual.hourlyRate) : null,
          groupRate: g.group ? Number(g.group.hourlyRate) : null,
        }))}
      />
    </DashboardShell>
  );
}
