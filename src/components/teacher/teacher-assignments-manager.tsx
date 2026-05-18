"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ClipboardList, FileText, Plus, X } from "lucide-react";
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

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  status: "ASSIGNED" | "SUBMITTED" | "GRADED" | "LATE";
  grade: number | null;
  feedback: string | null;
  submittedAt: string | null;
  fileUrl: string | null;
  textAnswer: string | null;
}

interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  maxGrade: number;
  submissions: Submission[];
}

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm";

const statusLabel = {
  ASSIGNED: { label: "Atandı", variant: "outline" as const },
  SUBMITTED: { label: "Teslim", variant: "secondary" as const },
  GRADED: { label: "Değerlendirildi", variant: "success" as const },
  LATE: { label: "Geç", variant: "warning" as const },
};

export function TeacherAssignmentsManager({
  courses,
  assignments,
}: {
  courses: Course[];
  assignments: Assignment[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxGrade, setMaxGrade] = useState("100");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<{
    assignmentId: string;
    submission: Submission;
  } | null>(null);
  const [gradeVal, setGradeVal] = useState("");
  const [feedbackVal, setFeedbackVal] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title,
          description: description || undefined,
          dueDate: dueDate || undefined,
          maxGrade: Number(maxGrade),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Eklenemedi");
      }
      setTitle("");
      setDescription("");
      setDueDate("");
      setMaxGrade("100");
      setShowForm(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  async function grade() {
    if (!gradingSubmission) return;
    setBusy(true);
    try {
      await fetch(
        `/api/teacher/assignments/${gradingSubmission.assignmentId}/grade`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId: gradingSubmission.submission.id,
            grade: Number(gradeVal),
            feedback: feedbackVal || undefined,
          }),
        }
      );
      setGradingSubmission(null);
      setGradeVal("");
      setFeedbackVal("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm((s) => !s)} className="gap-1.5">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Vazgeç" : "Yeni Ödev"}
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
                <label className="mb-1 block text-xs font-medium">Tam puan</label>
                <Input
                  type="number"
                  value={maxGrade}
                  onChange={(e) => setMaxGrade(e.target.value)}
                  min="1"
                />
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
                <label className="mb-1 block text-xs font-medium">Açıklama</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Teslim Tarihi</label>
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              {error && (
                <p className="sm:col-span-2 text-sm text-destructive">{error}</p>
              )}
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" isLoading={busy}>
                  Yayınla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              <ClipboardList className="mx-auto mb-2 h-8 w-8 opacity-50" />
              Henüz ödev oluşturmadın.
            </CardContent>
          </Card>
        ) : (
          assignments.map((a) => (
            <Card key={a.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-base">{a.title}</CardTitle>
                    <p className="text-[11px] text-muted-foreground">
                      {a.courseName}
                      {a.dueDate && ` • Son: ${formatDate(a.dueDate)}`} • Tam puan:{" "}
                      {a.maxGrade}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {a.description && (
                  <p className="mb-3 text-sm text-muted-foreground">
                    {a.description}
                  </p>
                )}
                {a.submissions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Henüz teslim yok.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {a.submissions.map((sub) => (
                      <li
                        key={sub.id}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{sub.studentName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {sub.submittedAt
                              ? `Teslim: ${formatDate(sub.submittedAt)}`
                              : "Teslim bekleniyor"}
                            {sub.grade !== null && ` • Not: ${sub.grade}/${a.maxGrade}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusLabel[sub.status].variant}>
                            {statusLabel[sub.status].label}
                          </Badge>
                          {(sub.status === "SUBMITTED" || sub.status === "LATE") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setGradingSubmission({ assignmentId: a.id, submission: sub });
                                setGradeVal(String(sub.grade ?? ""));
                                setFeedbackVal(sub.feedback ?? "");
                              }}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              Değerlendir
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {gradingSubmission.submission.studentName} • Değerlendirme
                </CardTitle>
                <button
                  onClick={() => setGradingSubmission(null)}
                  className="rounded p-1 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {gradingSubmission.submission.textAnswer && (
                <div>
                  <p className="text-xs font-medium mb-1">Cevap:</p>
                  <p className="rounded bg-muted/40 p-2 text-sm">
                    {gradingSubmission.submission.textAnswer}
                  </p>
                </div>
              )}
              {gradingSubmission.submission.fileUrl && (
                <a
                  href={gradingSubmission.submission.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" /> Dosya
                </a>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Not (0 - {assignments.find((a) => a.id === gradingSubmission.assignmentId)?.maxGrade ?? 100})
                </label>
                <Input
                  type="number"
                  value={gradeVal}
                  onChange={(e) => setGradeVal(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Geri bildirim</label>
                <Textarea
                  value={feedbackVal}
                  onChange={(e) => setFeedbackVal(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setGradingSubmission(null)}
                >
                  Vazgeç
                </Button>
                <Button onClick={grade} isLoading={busy}>
                  Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
