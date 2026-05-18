"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ClipboardList, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Submission {
  id: string;
  status: "ASSIGNED" | "SUBMITTED" | "GRADED" | "LATE";
  grade: number | null;
  feedback: string | null;
  textAnswer: string | null;
  fileUrl: string | null;
  submittedAt: string | null;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  courseName: string;
  dueDate: string | null;
  maxGrade: number;
  submission: Submission | null;
}

const statusLabel = {
  ASSIGNED: { label: "Bekliyor", variant: "outline" as const },
  SUBMITTED: { label: "Teslim Edildi", variant: "secondary" as const },
  GRADED: { label: "Notlandırıldı", variant: "success" as const },
  LATE: { label: "Geç Teslim", variant: "warning" as const },
};

export function StudentAssignmentsView({
  assignments,
}: {
  assignments: Assignment[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<Assignment | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [busy, setBusy] = useState(false);

  function startSubmit(a: Assignment) {
    setSubmitting(a);
    setTextAnswer(a.submission?.textAnswer ?? "");
    setFileUrl(a.submission?.fileUrl ?? "");
  }

  async function send() {
    if (!submitting) return;
    setBusy(true);
    try {
      await fetch("/api/student/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: submitting.id,
          textAnswer: textAnswer || undefined,
          fileUrl: fileUrl || undefined,
        }),
      });
      setSubmitting(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          <ClipboardList className="mx-auto mb-2 h-8 w-8 opacity-50" />
          Henüz ödevin yok.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((a) => {
        const status = a.submission?.status ?? "ASSIGNED";
        const meta = statusLabel[status];
        return (
          <Card key={a.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <p className="text-[11px] text-muted-foreground">
                    {a.courseName}
                    {a.dueDate && ` • Son: ${formatDate(a.dueDate)}`}
                  </p>
                </div>
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {a.description && (
                <p className="mb-3 text-sm text-muted-foreground">
                  {a.description}
                </p>
              )}
              {a.submission?.status === "GRADED" ? (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Not: {a.submission.grade}/{a.maxGrade}
                  </p>
                  {a.submission.feedback && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Geri bildirim: {a.submission.feedback}
                    </p>
                  )}
                </div>
              ) : (
                <Button
                  size="sm"
                  variant={a.submission?.submittedAt ? "outline" : "default"}
                  onClick={() => startSubmit(a)}
                  className="gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  {a.submission?.submittedAt ? "Düzenle" : "Teslim Et"}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}

      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{submitting.title}</CardTitle>
                <button
                  onClick={() => setSubmitting(null)}
                  className="rounded p-1 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Cevabın</label>
                <Textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  rows={6}
                  placeholder="Yazılı cevap..."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Dosya bağlantısı (opsiyonel)
                </label>
                <Input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="Drive / Dropbox / Imgur URL"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSubmitting(null)}>
                  Vazgeç
                </Button>
                <Button onClick={send} isLoading={busy}>
                  Teslim Et
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
