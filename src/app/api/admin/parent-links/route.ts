import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { parentLinkSchema } from "@/lib/validations";
import { logAudit } from "@/lib/services/audit";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = parentLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }
  const parent = await db.user.findUnique({ where: { id: parsed.data.parentId } });
  const student = await db.user.findUnique({ where: { id: parsed.data.studentId } });
  if (!parent || parent.role !== "PARENT") {
    return NextResponse.json({ error: "Veli bulunamadı" }, { status: 404 });
  }
  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "Öğrenci bulunamadı" }, { status: 404 });
  }
  const link = await db.parentStudent.upsert({
    where: {
      parentId_studentId: {
        parentId: parsed.data.parentId,
        studentId: parsed.data.studentId,
      },
    },
    update: {},
    create: parsed.data,
  });
  await logAudit({
    actorId: session.user.id,
    action: "parent_link.create",
    targetType: "ParentStudent",
    targetId: link.id,
    metadata: parsed.data,
  });
  return NextResponse.json({ link }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const url = new URL(req.url);
  const parentId = url.searchParams.get("parentId");
  const studentId = url.searchParams.get("studentId");
  if (!parentId || !studentId) {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }
  await db.parentStudent.delete({
    where: { parentId_studentId: { parentId, studentId } },
  });
  await logAudit({
    actorId: session.user.id,
    action: "parent_link.delete",
    metadata: { parentId, studentId },
  });
  return NextResponse.json({ ok: true });
}
