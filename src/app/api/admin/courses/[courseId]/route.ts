import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  adminUnauthorizedResponse,
  requireAdminApiSession,
  validationErrorResponse,
} from "@/lib/admin-api";
import { adminCourseSchema } from "@/lib/validations";

interface RouteContext {
  params: {
    courseId: string;
  };
}

export async function PATCH(req: Request, { params }: RouteContext) {
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

    const [course, conflictingCourse, teacher, students] = await Promise.all([
      db.course.findUnique({
        where: { id: params.courseId },
        include: {
          enrollments: {
            select: {
              studentId: true,
            },
          },
        },
      }),
      db.course.findFirst({
        where: {
          code,
          NOT: { id: params.courseId },
        },
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

    if (!course) {
      return validationErrorResponse("Ders bulunamadı", 404);
    }

    if (conflictingCourse) {
      return validationErrorResponse("Bu ders kodu zaten kullanılıyor");
    }

    if (!teacher) {
      return validationErrorResponse("Seçilen öğretmen bulunamadı");
    }

    if (students.length !== new Set(studentIds).size) {
      return validationErrorResponse("Geçersiz öğrenci seçimi yapıldı");
    }

    const currentStudentIds = new Set(
      course.enrollments.map((enrollment) => enrollment.studentId)
    );
    const nextStudentIds = new Set(studentIds);

    const studentIdsToRemove = Array.from(currentStudentIds).filter(
      (studentId) => !nextStudentIds.has(studentId)
    );
    const studentIdsToAdd = Array.from(nextStudentIds).filter(
      (studentId) => !currentStudentIds.has(studentId)
    );

    await db.$transaction(async (tx) => {
      await tx.course.update({
        where: { id: params.courseId },
        data: {
          name,
          code,
          description: description ?? null,
          color,
          teacherId,
          isActive,
        },
      });

      if (studentIdsToRemove.length > 0) {
        await tx.enrollment.deleteMany({
          where: {
            courseId: params.courseId,
            studentId: { in: studentIdsToRemove },
          },
        });
      }

      if (studentIdsToAdd.length > 0) {
        await tx.enrollment.createMany({
          data: studentIdsToAdd.map((studentId) => ({
            studentId,
            courseId: params.courseId,
          })),
          skipDuplicates: true,
        });
      }
    });

    return NextResponse.json({ message: "Ders güncellendi" });
  } catch (error) {
    console.error("Admin course update error:", error);
    return validationErrorResponse("Ders güncellenirken bir hata oluştu", 500);
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const session = await requireAdminApiSession();

    if (!session) {
      return adminUnauthorizedResponse();
    }

    const course = await db.course.findUnique({
      where: { id: params.courseId },
      select: { id: true },
    });

    if (!course) {
      return validationErrorResponse("Ders bulunamadı", 404);
    }

    await db.course.delete({
      where: { id: params.courseId },
    });

    return NextResponse.json({ message: "Ders silindi" });
  } catch (error) {
    console.error("Admin course delete error:", error);
    return validationErrorResponse("Ders silinirken bir hata oluştu", 500);
  }
}
