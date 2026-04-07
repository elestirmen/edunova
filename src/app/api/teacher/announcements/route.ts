import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { announcementSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = announcementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, content, isGlobal, courseId } = parsed.data;

    if (isGlobal) {
      return NextResponse.json(
        { error: "Öğretmenler genel duyuru yayınlayamaz" },
        { status: 403 }
      );
    }

    if (!courseId) {
      return NextResponse.json(
        { error: "Ders seçimi gerekli" },
        { status: 400 }
      );
    }

    const course = await db.course.findFirst({
      where: { id: courseId, teacherId: session.user.id },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Bu ders size ait değil veya bulunamadı" },
        { status: 403 }
      );
    }

    await db.announcement.create({
      data: {
        title,
        content,
        isGlobal: false,
        courseId,
        authorId: session.user.id,
      },
    });

    return NextResponse.json({ message: "Duyuru oluşturuldu" }, { status: 201 });
  } catch (error) {
    console.error("Teacher announcement error:", error);
    return NextResponse.json(
      { error: "Duyuru oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
