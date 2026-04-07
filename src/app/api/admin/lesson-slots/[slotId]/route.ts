import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  adminUnauthorizedResponse,
  requireAdminApiSession,
  validationErrorResponse,
} from "@/lib/admin-api";
import { lessonSlotSchema } from "@/lib/validations";

interface RouteContext {
  params: {
    slotId: string;
  };
}

export async function PATCH(req: Request, { params }: RouteContext) {
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

    const slot = await db.lessonSlot.findUnique({
      where: { id: params.slotId },
      select: { id: true },
    });

    if (!slot) {
      return validationErrorResponse("Ders saati bulunamadı", 404);
    }

    const course = await db.course.findUnique({
      where: { id: parsed.data.courseId },
      select: { id: true },
    });

    if (!course) {
      return validationErrorResponse("Seçilen ders bulunamadı");
    }

    await db.lessonSlot.update({
      where: { id: params.slotId },
      data: {
        courseId: parsed.data.courseId,
        dayOfWeek: parsed.data.dayOfWeek,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        room: parsed.data.room ?? null,
      },
    });

    return NextResponse.json({ message: "Ders saati güncellendi" });
  } catch (error) {
    console.error("Admin lesson slot update error:", error);
    return validationErrorResponse(
      "Ders saati güncellenirken bir hata oluştu",
      500
    );
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const session = await requireAdminApiSession();

    if (!session) {
      return adminUnauthorizedResponse();
    }

    const slot = await db.lessonSlot.findUnique({
      where: { id: params.slotId },
      select: { id: true },
    });

    if (!slot) {
      return validationErrorResponse("Ders saati bulunamadı", 404);
    }

    await db.lessonSlot.delete({
      where: { id: params.slotId },
    });

    return NextResponse.json({ message: "Ders saati silindi" });
  } catch (error) {
    console.error("Admin lesson slot delete error:", error);
    return validationErrorResponse(
      "Ders saati silinirken bir hata oluştu",
      500
    );
  }
}
