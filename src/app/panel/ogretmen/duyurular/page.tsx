"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Globe, Megaphone, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  isGlobal: boolean;
  authorName: string;
  courseName: string | null;
  createdAt: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

export default function TeacherAnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState({ title: "", content: "", courseId: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/teacher/announcements/list").then((r) => r.json()),
      fetch("/api/teacher/courses").then((r) => r.json()),
    ])
      .then(([annData, courseData]) => {
        setAnnouncements(annData.announcements || []);
        setCourses(courseData.courses || []);
        if (courseData.courses?.length > 0 && !form.courseId) {
          setForm((f) => ({ ...f, courseId: courseData.courses[0].id }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const res = await fetch("/api/teacher/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isGlobal: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm({ title: "", content: "", courseId: courses[0]?.id || "" });
      setShowForm(false);
      setNotice({ type: "success", message: "Duyuru yayınlandı." });
      router.refresh();
      const listRes = await fetch("/api/teacher/announcements/list");
      const listData = await listRes.json();
      setAnnouncements(listData.announcements || []);
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Duyuru oluşturulamadı." });
    } finally {
      setIsCreating(false);
    }
  }

  const selectClassName = "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <DashboardShell title="Duyurular" description="Duyurularınız ve sistem duyuruları">
      <div className="space-y-6">
        {notice && (
          <div className={cn("flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm", notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700")}>
            {notice.message}
            <button onClick={() => setNotice(null)} className="ml-2 shrink-0 rounded p-0.5 hover:bg-black/5"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{announcements.length} duyuru</p>
          <Button size="sm" className="gap-1.5 h-9" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Duyuru Yayınla
          </Button>
        </div>

        {showForm && (
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Yeni Duyuru</CardTitle>
                </div>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleCreate}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Başlık</span>
                    <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Duyuru başlığı" className="h-9" />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Ders</span>
                    <select className={selectClassName} value={form.courseId} onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}>
                      {courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                    </select>
                  </label>
                </div>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">İçerik</span>
                  <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={3} placeholder="Duyuru metni (en az 10 karakter)" className="min-h-0" />
                </label>
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

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Yükleniyor...</div>
        ) : announcements.length === 0 ? (
          <div className="py-12 text-center">
            <Megaphone className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Henüz duyuru yok.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((ann) => (
              <Card key={ann.id}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-sm font-semibold">{ann.title}</h3>
                    {ann.isGlobal ? (
                      <Badge variant="secondary" className="gap-0.5 text-[10px] shrink-0"><Globe className="h-2.5 w-2.5" />Genel</Badge>
                    ) : ann.courseName ? (
                      <Badge variant="outline" className="gap-0.5 text-[10px] shrink-0"><BookOpen className="h-2.5 w-2.5" />{ann.courseName}</Badge>
                    ) : null}
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground whitespace-pre-wrap">{ann.content}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{ann.authorName}</span>
                    <span>·</span>
                    <span>{new Date(ann.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
