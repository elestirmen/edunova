import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  adminUnauthorizedResponse,
  requireAdminApiSession,
  validationErrorResponse,
} from "@/lib/admin-api";
import { announcementSchema } from "@/lib/validations";

export async function POST(req: Request) {
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

    const { title, content, isGlobal, courseId } = parsed.data;

    if (!isGlobal && courseId) {
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: { id: true },
      });

      if (!course) {
        return validationErrorResponse("Seçilen ders bulunamadı");
      }
    }

    await db.announcement.create({
      data: {
        title,
        content,
        isGlobal,
        courseId: isGlobal ? null : courseId ?? null,
        authorId: session.user.id,
      },
    });

    return NextResponse.json({ message: "Duyuru oluşturuldu" }, { status: 201 });
  } catch (error) {
    console.error("Admin announcement create error:", error);
    return validationErrorResponse("Duyuru oluşturulurken bir hata oluştu", 500);
  }
}
