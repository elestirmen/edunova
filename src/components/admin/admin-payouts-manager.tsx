"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Coins, FileText, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate, formatHours } from "@/lib/utils";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SummaryRow {
  teacher: Teacher;
  pendingAmount: number;
  pendingHours: number;
  pendingCount: number;
  lastPayoutAmount: number | null;
  lastPayoutDate: string | null;
  lastPayoutPending: string | null;
}

interface PayoutRow {
  id: string;
  teacherName: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  paymentRef: string | null;
  createdAt: string;
}

interface Props {
  summary: SummaryRow[];
  payouts: PayoutRow[];
}

export function AdminPayoutsManager({ summary, payouts }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [payDialog, setPayDialog] = useState<PayoutRow | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function generatePayout(teacherId: string) {
    setBusyId(teacherId);
    setError(null);
    try {
      const res = await fetch("/api/admin/payouts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hakediş oluşturulamadı");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusyId(null);
    }
  }

  async function markPaid() {
    if (!payDialog) return;
    setBusyId(payDialog.id);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/payouts/${payDialog.id}/pay`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentRef: paymentRef || undefined }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Ödeme işaretlenemedi");
      }
      setPayDialog(null);
      setPaymentRef("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusyId(null);
    }
  }

  const totalPending = summary.reduce((s, r) => s + r.pendingAmount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="rounded-lg bg-amber-100 dark:bg-amber-950/40 p-2.5">
            <Coins className="h-5 w-5 text-amber-700 dark:text-amber-300" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Toplam ödenmemiş hakediş</p>
            <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Öğretmen Başına Bekleyen Hakediş</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aktif öğretmen yok.
            </p>
          ) : (
            <div className="divide-y">
              {summary.map((row) => (
                <div
                  key={row.teacher.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {row.teacher.firstName} {row.teacher.lastName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {row.pendingCount} ders • {formatHours(row.pendingHours)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-base font-bold">
                        {formatCurrency(row.pendingAmount)}
                      </p>
                      {row.lastPayoutDate && (
                        <p className="text-[10px] text-muted-foreground">
                          Son ödeme: {formatDate(row.lastPayoutDate)}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generatePayout(row.teacher.id)}
                      isLoading={busyId === row.teacher.id}
                      disabled={row.pendingAmount <= 0}
                      className="gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Hakediş Oluştur
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tüm Hakediş Kayıtları</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Henüz hakediş kaydı yok.
            </p>
          ) : (
            <div className="divide-y">
              {payouts.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{p.teacherName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(p.periodStart)} – {formatDate(p.periodEnd)}
                      {p.paymentRef && ` • ${p.paymentRef}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold">{formatCurrency(p.amount)}</p>
                    {p.paidAt ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {formatDate(p.paidAt)}
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setPayDialog(p)}
                        className="gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Ödendi İşaretle
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {payDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Ödeme Onayı</CardTitle>
                <button
                  onClick={() => setPayDialog(null)}
                  className="rounded p-1 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                <strong>{payDialog.teacherName}</strong> için{" "}
                <strong>{formatCurrency(payDialog.amount)}</strong> ödendi olarak
                işaretlenecek.
              </p>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Ödeme referansı (opsiyonel)
                </label>
                <Input
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="EFT no, makbuz no, vb."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPayDialog(null)}
                >
                  Vazgeç
                </Button>
                <Button
                  size="sm"
                  onClick={markPaid}
                  isLoading={busyId === payDialog.id}
                >
                  Ödendi İşaretle
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
