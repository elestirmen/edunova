import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { deliverLesson, ensureOccurrence } from "@/lib/services/occurrence";
import { deliverLessonSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = deliverLessonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }
  let occurrenceId = parsed.data.occurrenceId;
  if (!occurrenceId) {
    if (!parsed.data.lessonSlotId) {
      return NextResponse.json({ error: "Ders kimliği eksik" }, { status: 400 });
    }
    const slot = await db.lessonSlot.findUnique({
      where: { id: parsed.data.lessonSlotId },
      include: { course: { select: { teacherId: true } } },
    });
    if (!slot || slot.course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Ders size ait değil" }, { status: 403 });
    }
    const occ = await ensureOccurrence({
      lessonSlotId: parsed.data.lessonSlotId,
      date: parsed.data.date,
    });
    occurrenceId = occ.id;
  } else {
    const occ = await db.lessonOccurrence.findUnique({
      where: { id: occurrenceId },
      include: {
        lessonSlot: { include: { course: { select: { teacherId: true } } } },
      },
    });
    if (!occ || occ.lessonSlot.course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Ders size ait değil" }, { status: 403 });
    }
  }
  const result = await deliverLesson({
    occurrenceId,
    teacherNote: parsed.data.teacherNote,
    durationHours: parsed.data.durationHours,
    topicIds: parsed.data.topicIds,
    attendanceMap: parsed.data.attendanceMap,
  });
  return NextResponse.json({ occurrence: result });
}
