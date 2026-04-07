import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUnauthorizedResponse, requireAdminApiSession, validationErrorResponse } from "@/lib/admin-api";
import { z } from "zod";

const goalCreateSchema = z.object({
  userId: z.string().min(1, "Öğrenci seçimi gerekli"),
  title: z.string().min(2, "Başlık en az 2 karakter olmalı").max(200),
  targetPerWeek: z.number().int().min(1).max(50).default(5),
});

export async function POST(req: Request) {
  try {
    const session = await requireAdminApiSession();
    if (!session) return adminUnauthorizedResponse();

    const body = await req.json();
    const parsed = goalCreateSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error.errors[0].message);

    const { userId, title, targetPerWeek } = parsed.data;

    const student = await db.user.findFirst({
      where: { id: userId, role: "STUDENT" },
      select: { id: true },
    });
    if (!student) return validationErrorResponse("Öğrenci bulunamadı");

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    await db.goal.create({
      data: { userId, title, targetPerWeek, weekStart, currentProgress: 0 },
    });

    return NextResponse.json({ message: "Hedef oluşturuldu" }, { status: 201 });
  } catch (error) {
    console.error("Goal create error:", error);
    return validationErrorResponse("Hedef oluşturulurken bir hata oluştu", 500);
  }
}
