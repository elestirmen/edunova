"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex-1 lg:ml-64 flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
        <h2 className="text-lg font-bold">Bir hata oluştu</h2>
        <p className="text-sm text-muted-foreground max-w-sm">Sayfa yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.</p>
        <Button onClick={reset} variant="outline">Tekrar Dene</Button>
      </div>
    </div>
  );
}
