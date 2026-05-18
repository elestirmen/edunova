"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Course {
  id: string;
  name: string;
  code: string;
}
interface Topic {
  id: string;
  courseId: string;
  name: string;
  order: number;
}

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm";

export function AdminTopicsManager({
  courses,
  topics,
}: {
  courses: Course[];
  topics: Topic[];
}) {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id ?? "");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const courseTopics = useMemo(
    () => topics.filter((t) => t.courseId === selectedCourse),
    [topics, selectedCourse]
  );

  async function add() {
    if (!name.trim() || !selectedCourse) return;
    setBusy(true);
    try {
      await fetch("/api/admin/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse,
          name: name.trim(),
          order: courseTopics.length,
        }),
      });
      setName("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Konuyu sil?")) return;
    await fetch(`/api/admin/topics/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ders Seç</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className={selectClassName}
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookMarked className="h-4 w-4" /> Konular
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Yeni konu adı"
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <Button onClick={add} disabled={!name.trim()} isLoading={busy}>
              <Plus className="h-4 w-4" /> Ekle
            </Button>
          </div>
          {courseTopics.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Bu ders için konu yok.
            </p>
          ) : (
            <ol className="divide-y">
              {courseTopics.map((t, i) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm">{t.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(t.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
