"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  Globe,
  Megaphone,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CourseOption {
  id: string;
  name: string;
  code: string;
}

interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  isGlobal: boolean;
  courseId: string | null;
  courseName: string | null;
  authorName: string;
  createdAt: string;
}

interface AnnouncementFormState {
  title: string;
  content: string;
  isGlobal: boolean;
  courseId: string;
}

interface AdminAnnouncementsManagerProps {
  announcements: AnnouncementRecord[];
  courses: CourseOption[];
}

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const emptyAnnouncementForm: AnnouncementFormState = {
  title: "",
  content: "",
  isGlobal: true,
  courseId: "",
};

function getAnnouncementDraft(a: AnnouncementRecord): AnnouncementFormState {
  return { title: a.title, content: a.content, isGlobal: a.isGlobal, courseId: a.courseId ?? "" };
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function AdminAnnouncementsManager({ announcements, courses }: AdminAnnouncementsManagerProps) {
  const router = useRouter();
  const [createForm, setCreateForm] = useState<AnnouncementFormState>(emptyAnnouncementForm);
  const [drafts, setDrafts] = useState<Record<string, AnnouncementFormState>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setDrafts(Object.fromEntries(announcements.map((a) => [a.id, getAnnouncementDraft(a)])));
  }, [announcements]);

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  async function submitJson(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) {
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.error ?? "İşlem başarısız oldu");
    return result;
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setNotice(null);
    try {
      await submitJson("/api/admin/announcements", "POST", createForm);
      setCreateForm(emptyAnnouncementForm);
      setShowCreateForm(false);
      setNotice({ type: "success", message: "Duyuru oluşturuldu." });
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: getApiErrorMessage(error, "Duyuru oluşturulamadı.") });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSave(id: string) {
    const draft = drafts[id];
    if (!draft) return;
    setSavingId(id);
    setNotice(null);
    try {
      await submitJson(`/api/admin/announcements/${id}`, "PATCH", draft);
      setNotice({ type: "success", message: "Duyuru güncellendi." });
      setExpandedId(null);
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: getApiErrorMessage(error, "Duyuru güncellenemedi.") });
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Bu duyuruyu silmek istiyor musunuz?")) return;
    setDeletingId(id);
    setNotice(null);
    try {
      await submitJson(`/api/admin/announcements/${id}`, "DELETE");
      setNotice({ type: "success", message: "Duyuru silindi." });
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: getApiErrorMessage(error, "Duyuru silinemedi.") });
    } finally {
      setDeletingId(null);
    }
  }

  function updateDraft<K extends keyof AnnouncementFormState>(id: string, field: K, value: AnnouncementFormState[K]) {
    setDrafts((c) => ({ ...c, [id]: { ...c[id], [field]: value } }));
  }

  return (
    <div className="space-y-6">
      {/* Notice */}
      {notice && (
        <div className={cn("flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm", notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700")}>
          {notice.message}
          <button onClick={() => setNotice(null)} className="ml-2 shrink-0 rounded p-0.5 hover:bg-black/5"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{announcements.length} duyuru</p>
        <Button size="sm" className="gap-1.5 h-9" onClick={() => setShowCreateForm(!showCreateForm)}>
          <Megaphone className="h-4 w-4" />
          Yeni Duyuru
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Yeni Duyuru Yayınla</CardTitle>
              </div>
              <button onClick={() => setShowCreateForm(false)} className="rounded-lg p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <CardDescription>Tüm platforma veya belirli bir derse yayın yapın.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleCreate}>
              <Field label="Başlık">
                <Input value={createForm.title} onChange={(e) => setCreateForm((c) => ({ ...c, title: e.target.value }))} placeholder="Ders değişikliği" className="h-9" />
              </Field>
              <Field label="İçerik">
                <Textarea value={createForm.content} onChange={(e) => setCreateForm((c) => ({ ...c, content: e.target.value }))} rows={4} placeholder="Duyuru metni" className="min-h-0" />
              </Field>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={createForm.isGlobal} onChange={(e) => setCreateForm((c) => ({ ...c, isGlobal: e.target.checked, courseId: e.target.checked ? "" : c.courseId }))} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                  Genel duyuru
                </label>
                {!createForm.isGlobal && (
                  <select className={cn(selectClassName, "w-auto min-w-[180px]")} value={createForm.courseId} onChange={(e) => setCreateForm((c) => ({ ...c, courseId: e.target.value }))}>
                    <option value="">Ders seçin</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                  </select>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" className="gap-1.5" isLoading={isCreating}>
                  <Megaphone className="h-4 w-4" />
                  Yayınla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Announcement List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Duyuru Akışı</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {announcements.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Henüz duyuru yok.</div>
          ) : (
            <div className="divide-y">
              {announcements.map((announcement) => {
                const isExpanded = expandedId === announcement.id;
                const draft = drafts[announcement.id];

                return (
                  <div key={announcement.id} className={cn("transition-colors", isExpanded && "bg-muted/30")}>
                    {/* Compact Row */}
                    <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">{announcement.title}</span>
                            {announcement.isGlobal ? (
                              <Badge variant="secondary" className="gap-0.5 text-[10px] px-1.5 py-0 shrink-0"><Globe className="h-2.5 w-2.5" />Genel</Badge>
                            ) : announcement.courseName ? (
                              <Badge variant="outline" className="gap-0.5 text-[10px] px-1.5 py-0 shrink-0"><BookOpen className="h-2.5 w-2.5" />{announcement.courseName}</Badge>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {announcement.authorName} · {new Date(announcement.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(announcement.id)}
                        disabled={deletingId === announcement.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Expanded Edit */}
                    {isExpanded && draft && (
                      <div className="border-t bg-muted/20 px-4 py-4 sm:px-6 space-y-3">
                        <Field label="Başlık">
                          <Input value={draft.title} onChange={(e) => updateDraft(announcement.id, "title", e.target.value)} className="h-9" />
                        </Field>
                        <Field label="İçerik">
                          <Textarea value={draft.content} onChange={(e) => updateDraft(announcement.id, "content", e.target.value)} rows={4} className="min-h-0" />
                        </Field>
                        <div className="flex flex-wrap items-center gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={draft.isGlobal} onChange={(e) => updateDraft(announcement.id, "isGlobal", e.target.checked)} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                            Genel duyuru
                          </label>
                          {!draft.isGlobal && (
                            <select className={cn(selectClassName, "w-auto min-w-[180px]")} value={draft.courseId} onChange={(e) => updateDraft(announcement.id, "courseId", e.target.value)}>
                              <option value="">Ders seçin</option>
                              {courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                            </select>
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setExpandedId(null)}>İptal</Button>
                          <Button size="sm" className="gap-1.5" onClick={() => handleSave(announcement.id)} isLoading={savingId === announcement.id}>
                            <Save className="h-3.5 w-3.5" />
                            Kaydet
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
