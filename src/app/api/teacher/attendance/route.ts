import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureOccurrence, deliverLesson } from "@/lib/services/occurrence";
import { deliverLessonSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await req.json();
    // Backward-compat: eski client `records` gönderiyordu
    if (body.records && !body.attendanceMap) {
      body.attendanceMap = Object.fromEntries(
        body.records.map((r: { studentId: string; isPresent: boolean }) => [
          r.studentId,
          r.isPresent,
        ])
      );
    }
    const parsed = deliverLessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      occurrenceId,
      lessonSlotId,
      date,
      attendanceMap,
      teacherNote,
      durationHours,
      topicIds,
    } = parsed.data;

    // Yetki kontrolü
    let resolvedOccurrenceId = occurrenceId;
    const slotId = lessonSlotId;
    if (!resolvedOccurrenceId) {
      if (!slotId)
        return NextResponse.json(
          { error: "Ders ya da kayıt bilgisi eksik" },
          { status: 400 }
        );
      const lessonSlot = await db.lessonSlot.findUnique({
        where: { id: slotId },
        include: { course: { select: { teacherId: true } } },
      });
      if (!lessonSlot) {
        return NextResponse.json(
          { error: "Ders saati bulunamadı" },
          { status: 404 }
        );
      }
      if (lessonSlot.course.teacherId !== session.user.id) {
        return NextResponse.json(
          { error: "Bu ders size ait değil" },
          { status: 403 }
        );
      }
      const occ = await ensureOccurrence({ lessonSlotId: slotId, date });
      resolvedOccurrenceId = occ.id;
    } else {
      const occ = await db.lessonOccurrence.findUnique({
        where: { id: resolvedOccurrenceId },
        include: {
          lessonSlot: { include: { course: { select: { teacherId: true } } } },
        },
      });
      if (!occ) {
        return NextResponse.json(
          { error: "Ders kaydı bulunamadı" },
          { status: 404 }
        );
      }
      if (occ.lessonSlot.course.teacherId !== session.user.id) {
        return NextResponse.json(
          { error: "Bu ders size ait değil" },
          { status: 403 }
        );
      }
    }

    await deliverLesson({
      occurrenceId: resolvedOccurrenceId!,
      attendanceMap,
      teacherNote,
      durationHours,
      topicIds,
    });

    return NextResponse.json({ message: "Yoklama kaydedildi" });
  } catch (error) {
    console.error("Attendance error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Yoklama kaydedilirken bir hata oluştu",
      },
      { status: 500 }
    );
  }
}
