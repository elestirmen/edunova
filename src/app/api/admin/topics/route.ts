import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { topicSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId");
  const topics = await db.topic.findMany({
    where: { ...(courseId && { courseId }) },
    orderBy: [{ courseId: "asc" }, { order: "asc" }],
  });
  return NextResponse.json({ items: topics });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = topicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }
  const topic = await db.topic.create({ data: parsed.data });
  return NextResponse.json({ topic }, { status: 201 });
}
