import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: { materialId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const m = await db.material.findUnique({
    where: { id: params.materialId },
    include: { course: { select: { teacherId: true } } },
  });
  if (!m) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (m.course.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }
  await db.material.delete({ where: { id: params.materialId } });
  return NextResponse.json({ ok: true });
}
