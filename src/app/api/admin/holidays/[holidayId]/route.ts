import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/services/audit";

export async function DELETE(
  _req: Request,
  { params }: { params: { holidayId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  await db.holiday.delete({ where: { id: params.holidayId } });
  await logAudit({
    actorId: session.user.id,
    action: "holiday.delete",
    targetType: "Holiday",
    targetId: params.holidayId,
  });
  return NextResponse.json({ ok: true });
}
