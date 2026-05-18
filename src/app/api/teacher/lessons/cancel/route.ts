import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { cancelLesson, ensureOccurrence } from "@/lib/services/occurrence";
import { cancelLessonSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = cancelLessonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }
  let occurrenceId = parsed.data.occurrenceId;
  if (!occurrenceId) {
    if (!parsed.data.lessonSlotId || !parsed.data.date) {
      return NextResponse.json({ error: "Ders kimliği eksik" }, { status: 400 });
    }
    const slot = await db.lessonSlot.findUnique({
      where: { id: parsed.data.lessonSlotId },
      include: { course: { select: { teacherId: true } } },
    });
    if (!slot) {
      return NextResponse.json({ error: "Ders saati bulunamadı" }, { status: 404 });
    }
    if (
      session.user.role === "TEACHER" &&
      slot.course.teacherId !== session.user.id
    ) {
      return NextResponse.json({ error: "Ders size ait değil" }, { status: 403 });
    }
    const occ = await ensureOccurrence({
      lessonSlotId: parsed.data.lessonSlotId,
      date: parsed.data.date,
    });
    occurrenceId = occ.id;
  }
  const result = await cancelLesson({
    occurrenceId,
    cancelledById: session.user.id,
    reason: parsed.data.reason,
  });
  return NextResponse.json({ occurrence: result });
}
