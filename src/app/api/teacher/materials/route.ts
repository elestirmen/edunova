import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { materialSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId");
  const materials = await db.material.findMany({
    where: {
      course: { teacherId: session.user.id },
      ...(courseId && { courseId }),
    },
    include: { topic: true, course: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items: materials });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = materialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }
  const course = await db.course.findUnique({
    where: { id: parsed.data.courseId },
    select: { teacherId: true },
  });
  if (!course || course.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Ders size ait değil" }, { status: 403 });
  }
  const material = await db.material.create({
    data: { ...parsed.data, uploadedById: session.user.id },
  });
  return NextResponse.json({ material }, { status: 201 });
}
