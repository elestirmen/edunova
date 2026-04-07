import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  adminUnauthorizedResponse,
  requireAdminApiSession,
  validationErrorResponse,
} from "@/lib/admin-api";
import { lessonSlotSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await requireAdminApiSession();

    if (!session) {
      return adminUnauthorizedResponse();
    }

    const body = await req.json();
    const parsed = lessonSlotSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors[0].message);
    }

    const { courseId, dayOfWeek, startTime, endTime, room } = parsed.data;

    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      return validationErrorResponse("Seçilen ders bulunamadı");
    }

    await db.lessonSlot.create({
      data: {
        courseId,
        dayOfWeek,
        startTime,
        endTime,
        room: room ?? null,
      },
    });

    return NextResponse.json({ message: "Ders saati oluşturuldu" }, { status: 201 });
  } catch (error) {
    console.error("Admin lesson slot create error:", error);
    return validationErrorResponse(
      "Ders saati oluşturulurken bir hata oluştu",
      500
    );
  }
}
