"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  Clock3,
  Grid3X3,
  List,
  MapPin,
  Plus,
  Save,
  Trash2,
  User,
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
import { WeeklyCalendar } from "@/components/ui/weekly-calendar";
import type { CalendarSlot } from "@/components/ui/weekly-calendar";
import { cn, getDayLabel } from "@/lib/utils";

type DayKey = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

interface CourseOption {
  id: string;
  name: string;
  code: string;
  color: string;
}

interface SlotRecord {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  courseColor: string;
  teacherName: string;
  enrollmentCount: number;
  dayOfWeek: DayKey;
  startTime: string;
  endTime: string;
  room: string | null;
}

interface SlotFormState {
  courseId: string;
  dayOfWeek: DayKey;
  startTime: string;
  endTime: string;
  room: string;
}

interface AdminScheduleManagerProps {
  courses: CourseOption[];
  slots: SlotRecord[];
  calendarSlots: CalendarSlot[];
}

const DAYS: DayKey[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function getInitialSlotForm(courseId: string): SlotFormState {
  return { courseId, dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:30", room: "" };
}

function getSlotDraft(slot: SlotRecord): SlotFormState {
  return { courseId: slot.courseId, dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime, room: slot.room ?? "" };
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function AdminScheduleManager({ courses, slots, calendarSlots }: AdminScheduleManagerProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [createForm, setCreateForm] = useState<SlotFormState>(getInitialSlotForm(courses[0]?.id ?? ""));
  const [drafts, setDrafts] = useState<Record<string, SlotFormState>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [savingSlotId, setSavingSlotId] = useState<string | null>(null);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setDrafts(Object.fromEntries(slots.map((s) => [s.id, getSlotDraft(s)])));
  }, [slots]);

  useEffect(() => {
    setCreateForm((c) => ({ ...c, courseId: c.courseId || courses[0]?.id || "" }));
  }, [courses]);

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

  async function handleCreateSlot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setNotice(null);
    try {
      await submitJson("/api/admin/lesson-slots", "POST", createForm);
      setCreateForm(getInitialSlotForm(courses[0]?.id ?? ""));
      setShowCreateForm(false);
      setNotice({ type: "success", message: "Ders saati eklendi." });
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: getApiErrorMessage(error, "Ders saati eklenemedi.") });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSaveSlot(slotId: string) {
    const draft = drafts[slotId];
    if (!draft) return;
    setSavingSlotId(slotId);
    setNotice(null);
    try {
      await submitJson(`/api/admin/lesson-slots/${slotId}`, "PATCH", draft);
      setNotice({ type: "success", message: "Ders saati güncellendi." });
      setExpandedSlotId(null);
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: getApiErrorMessage(error, "Ders saati güncellenemedi.") });
    } finally {
      setSavingSlotId(null);
    }
  }

  async function handleDeleteSlot(slotId: string) {
    if (!window.confirm("Bu ders saatini silmek istiyor musunuz?")) return;
    setDeletingSlotId(slotId);
    setNotice(null);
    try {
      await submitJson(`/api/admin/lesson-slots/${slotId}`, "DELETE");
      setNotice({ type: "success", message: "Ders saati silindi." });
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: getApiErrorMessage(error, "Ders saati silinemedi.") });
    } finally {
      setDeletingSlotId(null);
    }
  }

  function updateDraft<K extends keyof SlotFormState>(slotId: string, field: K, value: SlotFormState[K]) {
    setDrafts((c) => ({ ...c, [slotId]: { ...c[slotId], [field]: value } }));
  }

  const slotsByDay = DAYS.map((day) => ({
    day,
    slots: slots.filter((s) => s.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime)),
  })).filter(({ slots: daySlots }) => daySlots.length > 0);

  const emptyDays = DAYS.filter((day) => !slots.some((s) => s.dayOfWeek === day));

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{slots.length} ders saati, {slotsByDay.length} gün</p>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex rounded-lg border bg-muted/40 p-0.5">
            <button
              onClick={() => setViewMode("calendar")}
              className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors", viewMode === "calendar" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              Takvim
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors", viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              <List className="h-3.5 w-3.5" />
              Liste
            </button>
          </div>
          <Button size="sm" className="gap-1.5 h-9" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4" />
            Yeni Ders Saati
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Yeni Ders Saati Ekle</CardTitle>
              </div>
              <button onClick={() => setShowCreateForm(false)} className="rounded-lg p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <CardDescription>Haftalık programa yeni bir slot ekleyin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleCreateSlot}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Field label="Ders">
                  <select className={selectClassName} value={createForm.courseId} onChange={(e) => setCreateForm((c) => ({ ...c, courseId: e.target.value }))}>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                  </select>
                </Field>
                <Field label="Gün">
                  <select className={selectClassName} value={createForm.dayOfWeek} onChange={(e) => setCreateForm((c) => ({ ...c, dayOfWeek: e.target.value as DayKey }))}>
                    {DAYS.map((d) => <option key={d} value={d}>{getDayLabel(d)}</option>)}
                  </select>
                </Field>
                <Field label="Başlangıç">
                  <Input type="time" value={createForm.startTime} onChange={(e) => setCreateForm((c) => ({ ...c, startTime: e.target.value }))} className="h-9" />
                </Field>
                <Field label="Bitiş">
                  <Input type="time" value={createForm.endTime} onChange={(e) => setCreateForm((c) => ({ ...c, endTime: e.target.value }))} className="h-9" />
                </Field>
                <Field label="Derslik">
                  <Input value={createForm.room} onChange={(e) => setCreateForm((c) => ({ ...c, room: e.target.value }))} placeholder="A-101" className="h-9" />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" className="gap-1.5" isLoading={isCreating}>
                  <Plus className="h-4 w-4" />
                  Ekle
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <Card>
          <CardContent className="p-4">
            <WeeklyCalendar slots={calendarSlots} variant="admin" />
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <>
          {slotsByDay.map(({ day, slots: daySlots }) => (
            <Card key={day}>
              <CardHeader className="pb-2 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">{getDayLabel(day)}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-normal">{daySlots.length} ders</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {daySlots.map((slot) => {
                    const isExpanded = expandedSlotId === slot.id;
                    const draft = drafts[slot.id];

                    return (
                      <div key={slot.id} className={cn("transition-colors", isExpanded && "bg-muted/30")}>
                        <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slot.courseColor }} />
                          <button
                            type="button"
                            onClick={() => setExpandedSlotId(isExpanded ? null : slot.id)}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{slot.courseName}</span>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{slot.courseCode}</Badge>
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-2.5 text-[11px] text-muted-foreground">
                                <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />{slot.startTime} - {slot.endTime}</span>
                                <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{slot.teacherName}</span>
                                {slot.room && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{slot.room}</span>}
                                <span>{slot.enrollmentCount} öğrenci</span>
                              </div>
                            </div>
                            <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteSlot(slot.id)}
                            disabled={deletingSlotId === slot.id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {isExpanded && draft && (
                          <div className="border-t bg-muted/20 px-4 py-3 sm:px-6">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                              <Field label="Ders">
                                <select className={selectClassName} value={draft.courseId} onChange={(e) => updateDraft(slot.id, "courseId", e.target.value)}>
                                  {courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                                </select>
                              </Field>
                              <Field label="Gün">
                                <select className={selectClassName} value={draft.dayOfWeek} onChange={(e) => updateDraft(slot.id, "dayOfWeek", e.target.value as DayKey)}>
                                  {DAYS.map((d) => <option key={d} value={d}>{getDayLabel(d)}</option>)}
                                </select>
                              </Field>
                              <Field label="Başlangıç">
                                <Input type="time" value={draft.startTime} onChange={(e) => updateDraft(slot.id, "startTime", e.target.value)} className="h-9" />
                              </Field>
                              <Field label="Bitiş">
                                <Input type="time" value={draft.endTime} onChange={(e) => updateDraft(slot.id, "endTime", e.target.value)} className="h-9" />
                              </Field>
                              <Field label="Derslik">
                                <Input value={draft.room} onChange={(e) => updateDraft(slot.id, "room", e.target.value)} placeholder="A-101" className="h-9" />
                              </Field>
                            </div>
                            <div className="mt-3 flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setExpandedSlotId(null)}>İptal</Button>
                              <Button size="sm" className="gap-1.5" onClick={() => handleSaveSlot(slot.id)} isLoading={savingSlotId === slot.id}>
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
              </CardContent>
            </Card>
          ))}

          {emptyDays.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
              <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>{emptyDays.map((d) => getDayLabel(d)).join(", ")} günleri için ders planlanmamış.</p>
            </div>
          )}
        </>
      )}
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
