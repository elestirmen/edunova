"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle2, Plus, Target, Trash2, X } from "lucide-react";

interface GoalRecord {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  title: string;
  targetPerWeek: number;
  currentProgress: number;
  isCompleted: boolean;
  createdAt: string;
}

interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AdminGoalsManagerProps {
  goals: GoalRecord[];
  students: StudentOption[];
}

const selectClassName = "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function AdminGoalsManager({ goals, students }: AdminGoalsManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState({
    userId: students[0]?.id || "",
    title: "",
    targetPerWeek: 5,
  });

  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(null), 4000);
      return () => clearTimeout(t);
    }
  }, [notice]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsCreating(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm({ userId: students[0]?.id || "", title: "", targetPerWeek: 5 });
      setShowForm(false);
      setNotice({ type: "success", message: "Hedef oluşturuldu." });
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Hedef oluşturulamadı." });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(goalId: string) {
    if (!window.confirm("Bu hedefi silmek istiyor musunuz?")) return;
    setDeletingId(goalId);
    try {
      const res = await fetch(`/api/admin/goals/${goalId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setNotice({ type: "success", message: "Hedef silindi." });
      router.refresh();
    } catch {
      setNotice({ type: "error", message: "Hedef silinemedi." });
    } finally {
      setDeletingId(null);
    }
  }

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  return (
    <div className="space-y-6">
      {notice && (
        <div className={cn("flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm", notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700")}>
          {notice.message}
          <button onClick={() => setNotice(null)} className="ml-2 shrink-0 rounded p-0.5 hover:bg-black/5"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="grid grid-cols-2 gap-3 flex-1 max-w-md">
          <div className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">Aktif Hedef</p>
            <p className="mt-1 text-2xl font-bold leading-none">{activeGoals.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">Tamamlanan</p>
            <p className="mt-1 text-2xl font-bold leading-none">{completedGoals.length}</p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5 h-9" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Yeni Hedef
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Yeni Hedef Oluştur</CardTitle>
              </div>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <CardDescription>Bir öğrenci için haftalık ders hedefi belirleyin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleCreate}>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Öğrenci</span>
                  <select className={selectClassName} value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}>
                    {students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Hedef Başlığı</span>
                  <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Haftalık 5 ders" className="h-9" />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Haftalık Hedef (ders)</span>
                  <Input type="number" min={1} max={50} value={form.targetPerWeek} onChange={(e) => setForm((f) => ({ ...f, targetPerWeek: parseInt(e.target.value) || 5 }))} className="h-9" />
                </label>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" className="gap-1.5" isLoading={isCreating}>
                  <Target className="h-4 w-4" />
                  Oluştur
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Hedefler</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {goals.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Henüz hedef oluşturulmamış.</div>
          ) : (
            <div className="divide-y">
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-3 px-4 py-3 sm:px-6">
                  {goal.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <Target className="h-5 w-5 shrink-0 text-primary" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{goal.studentName}</span>
                      {goal.isCompleted && <Badge variant="success" className="text-[10px]">Tamamlandı</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{goal.title}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Progress value={goal.currentProgress} max={goal.targetPerWeek} size="sm" className="flex-1 max-w-[200px]" />
                      <span className="text-[11px] text-muted-foreground">{goal.currentProgress}/{goal.targetPerWeek}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(goal.id)} disabled={deletingId === goal.id}>
                    <Trash2 className="h-3.5 w-3.5" />
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
