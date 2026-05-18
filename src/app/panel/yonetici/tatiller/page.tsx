import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminHolidaysManager } from "@/components/admin/admin-holidays-manager";

export const metadata = { title: "Tatiller | Edunova" };

export default async function AdminHolidaysPage() {
  await requireAuth(["ADMIN"]);
  const holidays = await db.holiday.findMany({ orderBy: { date: "asc" } });
  return (
    <DashboardShell title="Tatiller" description="Resmi tatil ve istisnai günler">
      <AdminHolidaysManager
        holidays={holidays.map((h) => ({
          id: h.id,
          date: h.date.toISOString(),
          name: h.name,
          reason: h.reason,
        }))}
      />
    </DashboardShell>
  );
}
