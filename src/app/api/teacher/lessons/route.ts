import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const url = new URL(req.url);
  const startStr = url.searchParams.get("start");
  const endStr = url.searchParams.get("end");
  const start = startStr ? new Date(startStr) : new Date();
  const end = endStr ? new Date(endStr) : new Date();

  const occurrences = await db.lessonOccurrence.findMany({
    where: {
      date: { gte: start, lte: end },
      lessonSlot: { course: { teacherId: session.user.id } },
    },
    include: {
      lessonSlot: { include: { course: true } },
      attendances: { include: { student: true } },
    },
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ items: occurrences });
}
