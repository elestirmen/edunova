"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, dayOfWeekFromDate, formatDate } from "@/lib/utils";
import { CheckCircle2, Clock, Save, X, XCircle, AlertTriangle } from "lucide-react";

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

interface Props {
  lessonSlots: LessonSlot[];
}

export function TeacherAttendance({ lessonSlots }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Seçilen tarihin haftanın gününe göre slot listesi
  const slotsForDay = useMemo(() => {
    const day = dayOfWeekFromDate(new Date(date));
    return lessonSlots.filter((s) => s.dayOfWeek === day);
  }, [lessonSlots, date]);

  const selectedSlot = useMemo(
    () => slotsForDay.find((s) => s.id === selectedSlotId) ?? null,
    [slotsForDay, selectedSlotId]
  );

  function selectSlot(slot: LessonSlot) {
    setSelectedSlotId(slot.id);
    const init: Record<string, boolean> = {};
    slot.students.forEach((s) => (init[s.id] = true));
    setAttendance(init);
    setNote("");
  }

  function toggleAll(present: boolean) {
    if (!selectedSlot) return;
    const next: Record<string, boolean> = {};
    selectedSlot.students.forEach((s) => (next[s.id] = present));
    setAttendance(next);
  }

  async function save() {
    if (!selectedSlot) return;
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/teacher/lessons/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonSlotId: selectedSlot.id,
          date,
          attendanceMap: attendance,
          teacherNote: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hata");
      setNotice({ type: "success", message: "Ders teslim ve yoklama kaydedildi." });
      router.refresh();
    } catch (e) {
      setNotice({
        type: "error",
        message: e instanceof Error ? e.message : "Hata",
      });
    } finally {
      setSaving(false);
    }
  }

  if (lessonSlots.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Henüz tanımlı dersin yok.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notice && (
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm",
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
              : "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
          )}
        >
          {notice.message}
          <button
            onClick={() => setNotice(null)}
            className="ml-2 shrink-0 rounded p-0.5 hover:bg-black/5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium">Tarih</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSelectedSlotId(null);
                setAttendance({});
              }}
              className="w-40"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDate(date)} • {slotsForDay.length} ders
          </p>
        </CardContent>
      </Card>

      {slotsForDay.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            <AlertTriangle className="mx-auto mb-2 h-6 w-6 opacity-50" />
            Bu tarihte ders programında ders yok.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-2">
          {slotsForDay.map((slot) => (
            <button
              key={slot.id}
              onClick={() => selectSlot(slot)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                slot.id === selectedSlotId
                  ? "border-primary bg-primary/5 text-primary"
                  : "hover:bg-muted/40"
              )}
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: slot.courseColor }}
              />
              <span className="font-medium">{slot.courseName}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {slot.startTime}
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedSlot && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{selectedSlot.courseName}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedSlot.startTime} - {selectedSlot.endTime}
                  {selectedSlot.room && ` • ${selectedSlot.room}`}
                </p>
              </div>
              <Badge variant="outline">
                {Object.values(attendance).filter(Boolean).length}/{selectedSlot.students.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {selectedSlot.students.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Bu derste kayıtlı öğrenci yok.
              </p>
            ) : (
              <>
                <div className="mb-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => toggleAll(true)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Hepsini İşaretle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => toggleAll(false)}
                  >
                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                    Hepsini Kaldır
                  </Button>
                </div>

                <div className="divide-y mb-4">
                  {selectedSlot.students.map((student) => {
                    const isPresent = attendance[student.id] ?? true;
                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() =>
                          setAttendance((a) => ({
                            ...a,
                            [student.id]: !a[student.id],
                          }))
                        }
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                          isPresent ? "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20" : "bg-red-50/30 dark:bg-red-950/20"
                        )}
                      >
                        <Avatar
                          firstName={student.firstName}
                          lastName={student.lastName}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {student.email}
                          </p>
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

                <div className="space-y-2">
                  <label className="text-xs font-medium">
                    Ders Notu (bu derste ne işlendi?)
                  </label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="Bugün hangi konuyu işlediniz, öğrencinin durumu, vb."
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <Button className="gap-1.5" onClick={save} isLoading={saving}>
                    <Save className="h-4 w-4" />
                    Dersi Teslim Et
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
