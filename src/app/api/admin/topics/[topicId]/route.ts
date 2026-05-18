import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { topicSchema } from "@/lib/validations";

export async function PUT(
  req: Request,
  { params }: { params: { topicId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = topicSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  const topic = await db.topic.update({
    where: { id: params.topicId },
    data: parsed.data,
  });
  return NextResponse.json({ topic });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { topicId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  await db.topic.delete({ where: { id: params.topicId } });
  return NextResponse.json({ ok: true });
}
