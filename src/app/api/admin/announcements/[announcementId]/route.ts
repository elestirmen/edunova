import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  adminUnauthorizedResponse,
  requireAdminApiSession,
  validationErrorResponse,
} from "@/lib/admin-api";
import { announcementSchema } from "@/lib/validations";

interface RouteContext {
  params: {
    announcementId: string;
  };
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const session = await requireAdminApiSession();

    if (!session) {
      return adminUnauthorizedResponse();
    }

    const body = await req.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors[0].message);
    }

    const announcement = await db.announcement.findUnique({
      where: { id: params.announcementId },
      select: { id: true },
    });

    if (!announcement) {
      return validationErrorResponse("Duyuru bulunamadı", 404);
    }

    if (!parsed.data.isGlobal && parsed.data.courseId) {
      const course = await db.course.findUnique({
        where: { id: parsed.data.courseId },
        select: { id: true },
      });

      if (!course) {
        return validationErrorResponse("Seçilen ders bulunamadı");
      }
    }

    await db.announcement.update({
      where: { id: params.announcementId },
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        isGlobal: parsed.data.isGlobal,
        courseId: parsed.data.isGlobal ? null : parsed.data.courseId ?? null,
      },
    });

    return NextResponse.json({ message: "Duyuru güncellendi" });
  } catch (error) {
    console.error("Admin announcement update error:", error);
    return validationErrorResponse("Duyuru güncellenirken bir hata oluştu", 500);
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const session = await requireAdminApiSession();

    if (!session) {
      return adminUnauthorizedResponse();
    }

    const announcement = await db.announcement.findUnique({
      where: { id: params.announcementId },
      select: { id: true },
    });

    if (!announcement) {
      return validationErrorResponse("Duyuru bulunamadı", 404);
    }

    await db.announcement.delete({
      where: { id: params.announcementId },
    });

    return NextResponse.json({ message: "Duyuru silindi" });
  } catch (error) {
    console.error("Admin announcement delete error:", error);
    return validationErrorResponse("Duyuru silinirken bir hata oluştu", 500);
  }
}
