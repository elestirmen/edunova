"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileText, FolderOpen, Image as ImageIcon, Link2, Plus, Trash2, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Material {
  id: string;
  courseId: string;
  courseName: string;
  topicName: string | null;
  title: string;
  description: string | null;
  type: "PDF" | "LINK" | "VIDEO" | "IMAGE" | "OTHER";
  url: string;
  createdAt: string;
}

const typeIcons = {
  PDF: FileText,
  LINK: Link2,
  VIDEO: Video,
  IMAGE: ImageIcon,
  OTHER: FolderOpen,
};

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm";

export function TeacherMaterialsManager({
  courses,
  materials,
}: {
  courses: Course[];
  materials: Material[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"PDF" | "LINK" | "VIDEO" | "IMAGE" | "OTHER">("LINK");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title,
          type,
          url,
          description: description || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Eklenemedi");
      }
      setTitle("");
      setUrl("");
      setDescription("");
      setShowForm(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Sil?")) return;
    await fetch(`/api/teacher/materials/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm((s) => !s)} className="gap-1.5">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Vazgeç" : "Yeni Materyal"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">Ders</label>
                <select
                  className={selectClassName}
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Tür</label>
                <select
                  className={selectClassName}
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                >
                  <option value="LINK">Link</option>
                  <option value="PDF">PDF</option>
                  <option value="VIDEO">Video</option>
                  <option value="IMAGE">Görsel</option>
                  <option value="OTHER">Diğer</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium">Başlık</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium">URL</label>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  placeholder="https://..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium">Açıklama (opsiyonel)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
              {error && (
                <p className="sm:col-span-2 text-sm text-destructive">{error}</p>
              )}
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" isLoading={busy}>
                  Kaydet
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tüm Materyaller</CardTitle>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Henüz materyal yok.
            </p>
          ) : (
            <ul className="divide-y">
              {materials.map((m) => {
                const Icon = typeIcons[m.type];
                return (
                  <li key={m.id} className="flex items-center gap-3 py-2.5">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium hover:underline truncate"
                        >
                          {m.title}
                        </a>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {m.courseName}
                        {m.topicName && ` • ${m.topicName}`} •{" "}
                        {formatDate(m.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {m.type}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => remove(m.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
