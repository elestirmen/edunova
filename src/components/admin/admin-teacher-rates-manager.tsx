"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Row {
  teacherId: string;
  teacherName: string;
  individualRate: number | null;
  groupRate: number | null;
}

export function AdminTeacherRatesManager({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<{
    teacherId: string;
    type: "INDIVIDUAL" | "GROUP";
  } | null>(null);
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!editing) return;
    setBusy(true);
    try {
      await fetch("/api/admin/teacher-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: editing.teacherId,
          courseType: editing.type,
          hourlyRate: Number(val),
        }),
      });
      setEditing(null);
      setVal("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full">
          <thead className="border-b text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Öğretmen</th>
              <th className="px-4 py-3">Birebir (saat)</th>
              <th className="px-4 py-3">Grup (saat)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.teacherId} className="text-sm">
                <td className="px-4 py-3 font-medium">{r.teacherName}</td>
                <RateCell
                  current={r.individualRate}
                  editing={
                    editing?.teacherId === r.teacherId && editing.type === "INDIVIDUAL"
                  }
                  onEdit={() => {
                    setEditing({ teacherId: r.teacherId, type: "INDIVIDUAL" });
                    setVal(String(r.individualRate ?? ""));
                  }}
                  onCancel={() => setEditing(null)}
                  onSave={save}
                  val={val}
                  setVal={setVal}
                  busy={busy}
                />
                <RateCell
                  current={r.groupRate}
                  editing={
                    editing?.teacherId === r.teacherId && editing.type === "GROUP"
                  }
                  onEdit={() => {
                    setEditing({ teacherId: r.teacherId, type: "GROUP" });
                    setVal(String(r.groupRate ?? ""));
                  }}
                  onCancel={() => setEditing(null)}
                  onSave={save}
                  val={val}
                  setVal={setVal}
                  busy={busy}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function RateCell({
  current,
  editing,
  onEdit,
  onCancel,
  onSave,
  val,
  setVal,
  busy,
}: {
  current: number | null;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  val: string;
  setVal: (s: string) => void;
  busy: boolean;
}) {
  return (
    <td className="px-4 py-3">
      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step="1"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="h-8 w-28"
            autoFocus
          />
          <Button size="sm" onClick={onSave} isLoading={busy}>
            <Save className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <button
          onClick={onEdit}
          className="group flex items-center gap-2 rounded-lg px-2 py-1 -mx-2 hover:bg-muted"
        >
          {current === null ? (
            <Badge variant="warning">Atanmadı</Badge>
          ) : (
            <span className="font-medium">{formatCurrency(current)}</span>
          )}
          <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground" />
        </button>
      )}
    </td>
  );
}
