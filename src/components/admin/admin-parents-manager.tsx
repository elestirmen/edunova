"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

interface Link {
  parentId: string;
  studentId: string;
  parentName: string;
  studentName: string;
}

interface Props {
  parents: Person[];
  students: Person[];
  links: Link[];
}

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm";

export function AdminParentsManager({ parents, students, links }: Props) {
  const router = useRouter();
  const [parentId, setParentId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function link() {
    if (!parentId || !studentId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/parent-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, studentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Eklenemedi");
      }
      setParentId("");
      setStudentId("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  async function unlink(parentId: string, studentId: string) {
    if (!confirm("Bağlantıyı kaldır?")) return;
    await fetch(
      `/api/admin/parent-links?parentId=${parentId}&studentId=${studentId}`,
      { method: "DELETE" }
    );
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Yeni Eşleştirme</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <select
            className={selectClassName}
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">— Veli seç —</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
          <select
            className={selectClassName}
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            <option value="">— Öğrenci seç —</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
          <Button onClick={link} isLoading={busy} disabled={!parentId || !studentId}>
            <Plus className="mr-1 h-4 w-4" /> Bağla
          </Button>
          {error && <p className="sm:col-span-3 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4" /> Mevcut Eşleştirmeler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Henüz veli-öğrenci eşleşmesi yok.
            </p>
          ) : (
            <div className="divide-y">
              {links.map((l) => (
                <div
                  key={`${l.parentId}-${l.studentId}`}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Heart className="h-4 w-4 text-rose-500 shrink-0" />
                    <p className="text-sm">
                      <span className="font-medium">{l.parentName}</span>
                      <span className="text-muted-foreground"> → </span>
                      <span className="font-medium">{l.studentName}</span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => unlink(l.parentId, l.studentId)}
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
