import { requireAuth } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { getRoleDashboardPath } from "@/lib/utils";

export default async function PanelFallbackPage() {
  const session = await requireAuth();
  redirect(getRoleDashboardPath(session.user.role));
}
