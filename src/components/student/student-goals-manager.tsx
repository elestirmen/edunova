"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Save, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ActiveGoal {
  id: string;
  title: string;
  targetPerWeek: number;
  currentProgress: number;
  isSelfProposed: boolean;
}

interface CompletedGoal {
  id: string;
  title: string;
  targetPerWeek: number;
}

interface Props {
  active: ActiveGoal | null;
  completed: CompletedGoal[];
}

export function StudentGoalsManager({ active, completed }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(!active);
  const [title, setTitle] = useState(active?.title ?? "");
  const [target, setTarget] = useState(String(active?.targetPerWeek ?? 5));
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await fetch("/api/student/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          targetPerWeek: Number(target),
        }),
      });
      setShowForm(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Bu Haftaki Hedefim
          </CardTitle>
        </CardHeader>
        <CardContent>
          {active && !showForm ? (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{active.title}</h3>
                  {active.isSelfProposed && (
                    <Badge variant="secondary" className="text-[10px]">
                      Kendi koyduğun
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Haftalık {active.targetPerWeek} ders hedefi
                </p>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>İlerleme</span>
                  <span className="font-medium">
                    {active.currentProgress}/{active.targetPerWeek}
                  </span>
                </div>
                <Progress value={active.currentProgress} max={active.targetPerWeek} />
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                Hedefi Değiştir
              </Button>
            </div>
          ) : (
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Hedef başlığı</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Bu hafta 4 derse katılmak"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Haftalık ders sayısı
                </label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" isLoading={busy} className="gap-1.5">
                  <Save className="h-4 w-4" />
                  Kaydet
                </Button>
                {active && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowForm(false)}
                  >
                    Vazgeç
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {completed.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tamamlanan Hedefler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completed.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-3 rounded-lg bg-muted/40 p-3"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{g.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {g.targetPerWeek} ders/hafta
                    </p>
                  </div>
                  <Badge variant="success">Tamamlandı</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
