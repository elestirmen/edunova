"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarOff, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

interface Holiday {
  id: string;
  date: string;
  name: string;
  reason: string | null;
}

export function AdminHolidaysManager({ holidays }: { holidays: Holiday[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, name, reason: reason || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Kayıt başarısız");
      }
      setDate("");
      setName("");
      setReason("");
      setShowForm(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Bu tatili silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/admin/holidays/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm((s) => !s)} className="gap-1.5">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Vazgeç" : "Yeni Tatil"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Tarih</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">İsim</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Cumhuriyet Bayramı"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Açıklama</label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Resmi tatil"
                />
              </div>
              {error && (
                <p className="sm:col-span-3 text-sm text-destructive">{error}</p>
              )}
              <div className="sm:col-span-3 flex justify-end">
                <Button type="submit" size="sm" isLoading={busy}>
                  Kaydet
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarOff className="h-4 w-4" /> Tanımlı Tatiller
          </CardTitle>
        </CardHeader>
        <CardContent>
          {holidays.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Henüz tatil tanımlanmadı.
            </p>
          ) : (
            <div className="divide-y">
              {holidays.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{h.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(h.date)}
                      {h.reason && ` • ${h.reason}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(h.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
