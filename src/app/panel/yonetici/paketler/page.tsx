import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminPackagesManager } from "@/components/admin/admin-packages-manager";

export const metadata = { title: "Saat Paketleri | Edunova" };

export default async function AdminPackagesPage() {
  await requireAuth(["ADMIN"]);

  const [students, courses, packages, ledgerBalances] = await Promise.all([
    db.user.findMany({
      where: { role: "STUDENT", isActive: true },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: [{ firstName: "asc" }],
    }),
    db.course.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true, color: true, type: true },
      orderBy: { name: "asc" },
    }),
    db.hourPackage.findMany({
      include: {
        student: { select: { firstName: true, lastName: true } },
        course: { select: { name: true, code: true } },
      },
      orderBy: { purchasedAt: "desc" },
      take: 50,
    }),
    db.hourLedgerEntry.groupBy({
      by: ["studentId", "courseId"],
      _sum: { hours: true },
    }),
  ]);

  const balances = await Promise.all(
    ledgerBalances.map(async (b) => {
      const balance = Number(b._sum.hours ?? 0);
      const student = students.find((s) => s.id === b.studentId);
      const course = courses.find((c) => c.id === b.courseId);
      return {
        studentId: b.studentId,
        courseId: b.courseId,
        balance,
        student: student ?? null,
        course: course ?? null,
      };
    })
  );

  return (
    <DashboardShell
      title="Saat Paketleri"
      description="Veliden paket alımı ve öğrenci bakiyeleri"
    >
      <AdminPackagesManager
        students={students}
        courses={courses}
        packages={packages.map((p) => ({
          id: p.id,
          studentName: `${p.student.firstName} ${p.student.lastName}`,
          courseName: p.course.name,
          courseCode: p.course.code,
          hoursPurchased: Number(p.hoursPurchased),
          pricePaid: Number(p.pricePaid),
          purchasedAt: p.purchasedAt.toISOString(),
          paymentMethod: p.paymentMethod,
        }))}
        balances={balances.filter((b) => b.student && b.course)}
      />
    </DashboardShell>
  );
}
