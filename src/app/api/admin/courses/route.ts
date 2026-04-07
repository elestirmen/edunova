import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  adminUnauthorizedResponse,
  requireAdminApiSession,
  validationErrorResponse,
} from "@/lib/admin-api";
import { adminCourseSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await requireAdminApiSession();

    if (!session) {
      return adminUnauthorizedResponse();
    }

    const body = await req.json();
    const parsed = adminCourseSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors[0].message);
    }

    const { name, code, description, color, teacherId, isActive, studentIds } =
      parsed.data;

    const [existingCourse, teacher, students] = await Promise.all([
      db.course.findUnique({
        where: { code },
        select: { id: true },
      }),
      db.user.findFirst({
        where: {
          id: teacherId,
          role: "TEACHER",
        },
        select: { id: true },
      }),
      studentIds.length > 0
        ? db.user.findMany({
            where: {
              id: { in: studentIds },
              role: "STUDENT",
            },
            select: { id: true },
          })
        : Promise.resolve([]),
    ]);

    if (existingCourse) {
      return validationErrorResponse("Bu ders kodu zaten kullanılıyor");
    }

    if (!teacher) {
      return validationErrorResponse("Seçilen öğretmen bulunamadı");
    }

    if (students.length !== new Set(studentIds).size) {
      return validationErrorResponse("Geçersiz öğrenci seçimi yapıldı");
    }

    await db.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          name,
          code,
          description: description ?? null,
          color,
          teacherId,
          isActive,
        },
      });

      if (studentIds.length > 0) {
        await tx.enrollment.createMany({
          data: Array.from(new Set(studentIds)).map((studentId) => ({
            studentId,
            courseId: course.id,
          })),
        });
      }
    });

    return NextResponse.json({ message: "Ders oluşturuldu" }, { status: 201 });
  } catch (error) {
    console.error("Admin course create error:", error);
    return validationErrorResponse("Ders oluşturulurken bir hata oluştu", 500);
  }
}
