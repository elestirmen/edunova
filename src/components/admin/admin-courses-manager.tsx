"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  Save,
  Search,
  Trash2,
  UserCheck,
  Users,
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

interface TeacherOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

interface CourseRecord {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string;
  isActive: boolean;
  teacherId: string;
  teacherName: string;
  enrollmentCount: number;
  lessonSlotCount: number;
  enrolledStudentIds: string[];
}

interface CourseFormState {
  name: string;
  code: string;
  description: string;
  color: string;
  teacherId: string;
  isActive: boolean;
  studentIds: string[];
}

interface AdminCoursesManagerProps {
  courses: CourseRecord[];
  teachers: TeacherOption[];
  students: StudentOption[];
}

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const emptyCourseForm: CourseFormState = {
  name: "",
  code: "",
  description: "",
  color: "#6366F1",
  teacherId: "",
  isActive: true,
  studentIds: [],
};

function getCourseDraft(course: CourseRecord): CourseFormState {
  return {
    name: course.name,
    code: course.code,
    description: course.description ?? "",
    color: course.color,
    teacherId: course.teacherId,
    isActive: course.isActive,
    studentIds: course.enrolledStudentIds,
  };
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function AdminCoursesManager({ courses, teachers, students }: AdminCoursesManagerProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [createForm, setCreateForm] = useState<CourseFormState>({
    ...emptyCourseForm,
    teacherId: teachers[0]?.id ?? "",
  });
  const [drafts, setDrafts] = useState<Record<string, CourseFormState>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [savingCourseId, setSavingCourseId] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setDrafts(Object.fromEntries(courses.map((c) => [c.id, getCourseDraft(c)])));
  }, [courses]);

  useEffect(() => {
    setCreateForm((c) => ({ ...c, teacherId: c.teacherId || teachers[0]?.id || "" }));
  }, [teachers]);

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  const filteredCourses = courses.filter((course) => {
    const haystack = `${course.name} ${course.code} ${course.teacherName}`.toLowerCase();
    return search.trim().length === 0 || haystack.includes(search.toLowerCase());
  });

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

  async function handleCreateCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setNotice(null);
    try {
      await submitJson("/api/admin/courses", "POST", createForm);
      setCreateForm({ ...emptyCourseForm, teacherId: teachers[0]?.id ?? "" });
      setShowCreateForm(false);
      setNotice({ type: "success", message: "Yeni ders oluşturuldu." });
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: getApiErrorMessage(error, "Ders oluşturulamadı.") });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSaveCourse(courseId: string) {
    const draft = drafts[courseId];
    if (!draft) return;
    setSavingCourseId(courseId);
    setNotice(null);
    try {
      await submitJson(`/api/admin/courses/${courseId}`, "PATCH", draft);
      setNotice({ type: "success", message: "Ders bilgileri güncellendi." });
      setExpandedCourseId(null);
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: getApiErrorMessage(error, "Ders güncellenemedi.") });
    } finally {
      setSavingCourseId(null);
    }
  }

  async function handleDeleteCourse(courseId: string, courseName: string) {
    if (!window.confirm(`"${courseName}" dersini silmek istiyor musunuz?`)) return;
    setDeletingCourseId(courseId);
    setNotice(null);
    try {
      await submitJson(`/api/admin/courses/${courseId}`, "DELETE");
      setNotice({ type: "success", message: "Ders silindi." });
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: getApiErrorMessage(error, "Ders silinemedi.") });
    } finally {
      setDeletingCourseId(null);
    }
  }

  function updateDraft<K extends keyof CourseFormState>(courseId: string, field: K, value: CourseFormState[K]) {
    setDrafts((current) => ({ ...current, [courseId]: { ...current[courseId], [field]: value } }));
  }

  function toggleStudentForDraft(courseId: string | "create", studentId: string, checked: boolean) {
    if (courseId === "create") {
      setCreateForm((c) => ({
        ...c,
        studentIds: checked ? [...c.studentIds, studentId] : c.studentIds.filter((id) => id !== studentId),
      }));
      return;
    }
    const currentDraft = drafts[courseId];
    if (!currentDraft) return;
    updateDraft(courseId, "studentIds", checked ? [...currentDraft.studentIds, studentId] : currentDraft.studentIds.filter((id) => id !== studentId));
  }

  const totalEnrollments = courses.reduce((t, c) => t + c.enrollmentCount, 0);
  const totalLessonSlots = courses.reduce((t, c) => t + c.lessonSlotCount, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Toplam Ders" value={courses.length} />
        <MiniStat label="Aktif Ders" value={courses.filter((c) => c.isActive).length} />
        <MiniStat label="Kayıtlı Öğrenci" value={totalEnrollments} />
        <MiniStat label="Ders Saati" value={totalLessonSlots} />
      </div>

      {/* Notice */}
      {notice && (
        <div className={cn("flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm", notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700")}>
          {notice.message}
          <button onClick={() => setNotice(null)} className="ml-2 shrink-0 rounded p-0.5 hover:bg-black/5"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-9 text-sm" placeholder="Ders adı, kodu veya öğretmen ara..." />
        </div>
        <Button size="sm" className="gap-1.5 h-9" onClick={() => setShowCreateForm(!showCreateForm)}>
          <BookOpen className="h-4 w-4" />
          Yeni Ders
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Yeni Ders Oluştur</CardTitle>
              </div>
              <button onClick={() => setShowCreateForm(false)} className="rounded-lg p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <CardDescription>Ders oluşturun, öğretmen atayın ve ilk öğrenci grubunu ekleyin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateCourse}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Ders Adı">
                  <Input value={createForm.name} onChange={(e) => setCreateForm((c) => ({ ...c, name: e.target.value }))} placeholder="Matematik" className="h-9" />
                </Field>
                <Field label="Ders Kodu">
                  <Input value={createForm.code} onChange={(e) => setCreateForm((c) => ({ ...c, code: e.target.value.toUpperCase() }))} placeholder="MAT101" className="h-9" />
                </Field>
                <Field label="Renk">
                  <Input type="color" value={createForm.color} onChange={(e) => setCreateForm((c) => ({ ...c, color: e.target.value.toUpperCase() }))} className="h-9 p-1" />
                </Field>
                <Field label="Sorumlu Öğretmen">
                  <select className={selectClassName} value={createForm.teacherId} onChange={(e) => setCreateForm((c) => ({ ...c, teacherId: e.target.value }))}>
                    {teachers.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}{!t.isActive ? " (Pasif)" : ""}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Açıklama">
                <Textarea value={createForm.description} onChange={(e) => setCreateForm((c) => ({ ...c, description: e.target.value }))} rows={2} placeholder="Dersin kapsamı ve hedefleri" className="min-h-0" />
              </Field>
              <StudentSelector title="İlk Kayıt Listesi" selectedStudentIds={createForm.studentIds} students={students} onToggle={(sid, checked) => toggleStudentForDraft("create", sid, checked)} />
              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={createForm.isActive} onChange={(e) => setCreateForm((c) => ({ ...c, isActive: e.target.checked }))} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                  Ders aktif olsun
                </label>
                <Button type="submit" size="sm" className="gap-1.5" isLoading={isCreating}>
                  <BookOpen className="h-4 w-4" />
                  Oluştur
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Course List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Ders Kataloğu</CardTitle>
            <Badge variant="outline" className="font-normal">{filteredCourses.length} / {courses.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCourses.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Arama kriterine uyan ders bulunamadı.</div>
          ) : (
            <div className="divide-y">
              {filteredCourses.map((course) => {
                const isExpanded = expandedCourseId === course.id;
                const draft = drafts[course.id];

                return (
                  <div key={course.id} className={cn("transition-colors", isExpanded && "bg-muted/30")}>
                    {/* Compact Row */}
                    <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: course.color }} />
                      <button
                        type="button"
                        onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">{course.name}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">{course.code}</Badge>
                            {!course.isActive && <Badge variant="warning" className="text-[10px] px-1.5 py-0">Pasif</Badge>}
                          </div>
                          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><UserCheck className="h-3 w-3" />{course.teacherName}</span>
                            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{course.enrollmentCount}</span>
                            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{course.lessonSlotCount} slot</span>
                          </div>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteCourse(course.id, course.name)}
                        disabled={deletingCourseId === course.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Expanded Edit */}
                    {isExpanded && draft && (
                      <div className="border-t bg-muted/20 px-4 py-4 sm:px-6">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <Field label="Ders Adı">
                            <Input value={draft.name} onChange={(e) => updateDraft(course.id, "name", e.target.value)} className="h-9" />
                          </Field>
                          <Field label="Ders Kodu">
                            <Input value={draft.code} onChange={(e) => updateDraft(course.id, "code", e.target.value.toUpperCase())} className="h-9" />
                          </Field>
                          <Field label="Renk">
                            <Input type="color" value={draft.color} onChange={(e) => updateDraft(course.id, "color", e.target.value.toUpperCase())} className="h-9 p-1" />
                          </Field>
                          <Field label="Sorumlu Öğretmen">
                            <select className={selectClassName} value={draft.teacherId} onChange={(e) => updateDraft(course.id, "teacherId", e.target.value)}>
                              {teachers.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}{!t.isActive ? " (Pasif)" : ""}</option>)}
                            </select>
                          </Field>
                          <div className="sm:col-span-2 lg:col-span-4">
                            <Field label="Açıklama">
                              <Textarea value={draft.description} onChange={(e) => updateDraft(course.id, "description", e.target.value)} rows={2} className="min-h-0" />
                            </Field>
                          </div>
                        </div>
                        <div className="mt-3">
                          <StudentSelector
                            title="Kayıtlı Öğrenciler"
                            selectedStudentIds={draft.studentIds}
                            students={students}
                            onToggle={(sid, checked) => toggleStudentForDraft(course.id, sid, checked)}
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={draft.isActive} onChange={(e) => updateDraft(course.id, "isActive", e.target.checked)} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                            Ders aktif
                          </label>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setExpandedCourseId(null)}>İptal</Button>
                            <Button size="sm" className="gap-1.5" onClick={() => handleSaveCourse(course.id)} isLoading={savingCourseId === course.id}>
                              <Save className="h-3.5 w-3.5" />
                              Kaydet
                            </Button>
                          </div>
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

function StudentSelector({
  title,
  selectedStudentIds,
  students,
  onToggle,
}: {
  title: string;
  selectedStudentIds: string[];
  students: StudentOption[];
  onToggle: (studentId: string, checked: boolean) => void;
}) {
  const [studentSearch, setStudentSearch] = useState("");
  const filtered = students.filter((s) => {
    if (studentSearch.trim().length === 0) return true;
    return `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(studentSearch.toLowerCase());
  });

  return (
    <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-muted-foreground">{title}</p>
        <Badge variant="secondary" className="text-[10px]">{selectedStudentIds.length} seçili</Badge>
      </div>
      {students.length > 8 && (
        <Input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder="Öğrenci ara..." className="h-8 text-xs" />
      )}
      <div className="grid max-h-48 gap-1 overflow-y-auto pr-1 sm:grid-cols-2">
        {filtered.map((student) => {
          const checked = selectedStudentIds.includes(student.id);
          return (
            <label key={student.id} className={cn("flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors cursor-pointer", checked ? "border-primary/30 bg-primary/5" : "bg-background hover:bg-muted/40")}>
              <input type="checkbox" checked={checked} onChange={(e) => onToggle(student.id, e.target.checked)} className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-primary" />
              <span className="truncate font-medium">{student.firstName} {student.lastName}</span>
              {!student.isActive && <Badge variant="warning" className="text-[9px] px-1 py-0 ml-auto">Pasif</Badge>}
            </label>
          );
        })}
      </div>
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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold leading-none">{value}</p>
    </div>
  );
}
