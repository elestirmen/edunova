import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Denetim Kayıtları | Edunova" };

const actionLabels: Record<string, string> = {
  "lesson.deliver": "Ders teslim",
  "lesson.cancel": "Ders iptal",
  "lesson.revert_delivery": "Teslim geri alındı",
  "package.purchase": "Paket satışı",
  "payout.generate": "Hakediş oluşturma",
  "payout.pay": "Hakediş ödendi",
  "teacher_rate.set": "Öğretmen ücreti güncellendi",
  "holiday.upsert": "Tatil eklendi/güncellendi",
  "holiday.delete": "Tatil silindi",
  "parent_link.create": "Veli bağlandı",
  "parent_link.delete": "Veli bağlantısı kaldırıldı",
};

export default async function AdminAuditPage() {
  await requireAuth(["ADMIN"]);

  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: { select: { firstName: true, lastName: true, role: true } },
    },
  });

  return (
    <DashboardShell title="Denetim Kayıtları" description="Sistem üzerinde gerçekleşen tüm önemli işlemler">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" /> Son 100 İşlem
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Henüz kayıt yok.
            </p>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {actionLabels[log.action] ?? log.action}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {log.actor
                        ? `${log.actor.firstName} ${log.actor.lastName}`
                        : "Sistem"}
                      {log.targetType && ` • ${log.targetType}`}
                    </p>
                    {log.metadata && Object.keys(log.metadata as object).length > 0 ? (
                      <pre className="mt-1 overflow-x-auto rounded bg-muted/40 p-1.5 text-[10px] text-muted-foreground">
                        {JSON.stringify(log.metadata, null, 0)}
                      </pre>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
