"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Panel sayfaları için ortak hata ekranı. */
export function PanelError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-6 lg:ml-64">
      <div className="w-full max-w-sm rounded-3xl border bg-card p-8 text-center shadow-lg">
        <span className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight">Bir hata oluştu</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Sayfa yüklenirken bir sorun çıktı. Tekrar denemek sorunu çözebilir.
        </p>
        <Button onClick={reset} variant="outline" className="mt-6 w-full gap-2">
          <RotateCcw className="h-4 w-4" />
          Tekrar Dene
        </Button>
      </div>
    </div>
  );
}
