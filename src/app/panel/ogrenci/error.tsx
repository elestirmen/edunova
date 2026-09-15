"use client";

import { PanelError } from "@/components/layout/panel-error";

export default function PanelErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  return <PanelError reset={reset} />;
}
