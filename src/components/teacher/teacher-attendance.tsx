"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Save, X, XCircle } from "lucide-react";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface LessonSlot {
  id: string;
  courseName: string;
  courseCode: string;
  courseColor: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string | null;
  students: Student[];
}

interface TeacherAttendanceProps {
  lessonSlots: LessonSlot[];
}

export function TeacherAttendance({ lessonSlots }: TeacherAttendanceProps) {
  const router = useRouter();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
    lessonSlots[0]?.id ?? null
  );
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const selectedSlot = lessonSlots.find((s) => s.id === selectedSlotId);

  function initAttendance(slot: LessonSlot) {
    const initial: Record<string, boolean> = {};
    slot.students.forEach((s) => {
      initial[s.id] = true;
    });
    setAttendance(initial);
  }

  function handleSelectSlot(slotId: string) {
    setSelectedSlotId(slotId);
    const slot = lessonSlots.find((s) => s.id === slotId);
    if (slot) initAttendance(slot);
  }

  function toggleAll(present: boolean) {
    if (!selectedSlot) return;
    const next: Record<string, boolean> = {};
    selectedSlot.students.forEach((s) => {
      next[s.id] = present;
    });
    setAttendance(next);
  }

  async function handleSave() {
    if (!selectedSlot) return;
    setIsSaving(true);
    setNotice(null);

    try {
      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonSlotId: selectedSlot.id,
          date: new Date().toISOString(),
          records: selectedSlot.students.map((s) => ({
            studentId: s.id,
            isPresent: attendance[s.id] ?? true,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNotice({ type: "success", message: "Yoklama başarıyla kaydedildi." });
      router.refresh();
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Yoklama kaydedilemedi.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (lessonSlots.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Yoklama alınacak ders bulunamadı.
      </div>
    );
  }

  if (!selectedSlot) {
    handleSelectSlot(lessonSlots[0].id);
    return null;
  }

  if (Object.keys(attendance).length === 0 && selectedSlot.students.length > 0) {
    initAttendance(selectedSlot);
  }

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const totalCount = selectedSlot.students.length;

  return (
    <div className="space-y-6">
      {notice && (
        <div className={cn("flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm", notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700")}>
          {notice.message}
          <button onClick={() => setNotice(null)} className="ml-2 shrink-0 rounded p-0.5 hover:bg-black/5"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Slot Selector */}
      <div className="flex flex-wrap gap-2">
        {lessonSlots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => handleSelectSlot(slot.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
              slot.id === selectedSlotId ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted/40"
            )}
          >
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: slot.courseColor }} />
            <span className="font-medium">{slot.courseName}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Clock className="h-3 w-3" />{slot.startTime}
            </span>
          </button>
        ))}
      </div>

      {/* Attendance Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{selectedSlot.courseName} - Yoklama</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedSlot.startTime} - {selectedSlot.endTime}
                {selectedSlot.room && ` | ${selectedSlot.room}`}
                {" | "}{new Date().toLocaleDateString("tr-TR")}
              </p>
            </div>
            <Badge variant="outline">{presentCount}/{totalCount}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {totalCount === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Bu derste kayıtlı öğrenci yok.</p>
          ) : (
            <>
              <div className="mb-3 flex gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => toggleAll(true)}>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Hepsini İşaretle
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => toggleAll(false)}>
                  <XCircle className="h-3.5 w-3.5 text-red-500" /> Hepsini Kaldır
                </Button>
              </div>

              <div className="divide-y">
                {selectedSlot.students.map((student) => {
                  const isPresent = attendance[student.id] ?? true;
                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => setAttendance((a) => ({ ...a, [student.id]: !a[student.id] }))}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                        isPresent ? "hover:bg-emerald-50/50" : "bg-red-50/30 hover:bg-red-50/50"
                      )}
                    >
                      <Avatar firstName={student.firstName} lastName={student.lastName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                      </div>
                      {isPresent ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 shrink-0 text-red-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-end">
                <Button className="gap-1.5" onClick={handleSave} isLoading={isSaving}>
                  <Save className="h-4 w-4" />
                  Yoklamayı Kaydet
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
