"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus, Save, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency, formatDate, formatHours } from "@/lib/utils";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  type: "INDIVIDUAL" | "GROUP";
}
interface Package {
  id: string;
  studentName: string;
  courseName: string;
  courseCode: string;
  hoursPurchased: number;
  pricePaid: number;
  purchasedAt: string;
  paymentMethod: string | null;
}
interface Balance {
  studentId: string;
  courseId: string;
  balance: number;
  student: Student | null;
  course: Course | null;
}

interface Props {
  students: Student[];
  courses: Course[];
  packages: Package[];
  balances: Balance[];
}

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm";

export function AdminPackagesManager({
  students,
  courses,
  packages,
  balances,
}: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [hours, setHours] = useState("10");
  const [price, setPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Havale");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const filteredBalances = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = balances.filter((b) => b.balance !== 0);
    list.sort((a, b) => a.balance - b.balance);
    if (!q) return list;
    return list.filter((b) => {
      const studentName = `${b.student?.firstName ?? ""} ${b.student?.lastName ?? ""}`.toLowerCase();
      return (
        studentName.includes(q) ||
        b.course?.name.toLowerCase().includes(q) ||
        b.course?.code.toLowerCase().includes(q)
      );
    });
  }, [balances, search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!studentId || !courseId || !hours || !price) {
      setError("Tüm alanları doldurun");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          courseId,
          hoursPurchased: Number(hours),
          pricePaid: Number(price),
          paymentMethod: paymentMethod || undefined,
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Paket eklenemedi");
      setShowForm(false);
      setStudentId("");
      setCourseId("");
      setHours("10");
      setPrice("");
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Toplam {balances.length} aktif bakiye • {packages.length} paket geçmişi
        </p>
        <Button onClick={() => setShowForm((s) => !s)} size="sm" className="gap-1.5">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Vazgeç" : "Yeni Paket"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Yeni Saat Paketi</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">Öğrenci</label>
                <select
                  className={selectClassName}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                >
                  <option value="">— Seçin —</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Ders</label>
                <select
                  className={selectClassName}
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                >
                  <option value="">— Seçin —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type === "GROUP" ? "Grup" : "Birebir"})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Saat</label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Toplam Ücret (₺)</label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Ödeme</label>
                <Input
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="Havale / Nakit / Kart"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Not</label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={1}
                  placeholder="Opsiyonel"
                />
              </div>
              {error && (
                <div className="sm:col-span-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                  Vazgeç
                </Button>
                <Button type="submit" size="sm" className="gap-1.5" isLoading={submitting}>
                  <Save className="h-4 w-4" /> Paketi Kaydet
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Mevcut Bakiyeler</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ara"
                  className="h-8 w-48 pl-7 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredBalances.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Eşleşen bakiye yok.
              </p>
            ) : (
              <div className="divide-y">
                {filteredBalances.map((b) => (
                  <div
                    key={`${b.studentId}-${b.courseId}`}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {b.student?.firstName} {b.student?.lastName}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {b.course?.name} • {b.course?.code}
                      </p>
                    </div>
                    <Badge
                      variant={
                        b.balance <= 0
                          ? "destructive"
                          : b.balance <= 3
                            ? "warning"
                            : "success"
                      }
                      className="shrink-0"
                    >
                      {formatHours(b.balance)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Son Satışlar</CardTitle>
          </CardHeader>
          <CardContent>
            {packages.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Henüz satış kaydı yok.
              </p>
            ) : (
              <ul className="divide-y">
                {packages.slice(0, 12).map((p) => (
                  <li key={p.id} className="py-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {p.studentName}
                        </p>
                        <p
                          className={cn(
                            "truncate text-[11px] text-muted-foreground"
                          )}
                        >
                          {p.courseName}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold">
                          {formatHours(p.hoursPurchased)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatCurrency(p.pricePaid)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatDate(p.purchasedAt)}{" "}
                      {p.paymentMethod && `• ${p.paymentMethod}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
