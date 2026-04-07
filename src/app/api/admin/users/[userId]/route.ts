import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  adminUnauthorizedResponse,
  requireAdminApiSession,
  validationErrorResponse,
} from "@/lib/admin-api";
import { adminUserUpdateSchema } from "@/lib/validations";

interface RouteContext {
  params: {
    userId: string;
  };
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const session = await requireAdminApiSession();

    if (!session) {
      return adminUnauthorizedResponse();
    }

    const body = await req.json();
    const parsed = adminUserUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors[0].message);
    }

    const user = await db.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        role: true,
        _count: {
          select: {
            teacherCourses: true,
          },
        },
        streaks: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      return validationErrorResponse("Kullanıcı bulunamadı", 404);
    }

    const { firstName, lastName, email, role, phone, bio, isActive, password } =
      parsed.data;

    const conflictingUser = await db.user.findFirst({
      where: {
        email,
        NOT: { id: params.userId },
      },
      select: { id: true },
    });

    if (conflictingUser) {
      return validationErrorResponse("Bu e-posta adresi başka bir kullanıcıda kayıtlı");
    }

    if (
      session.user.id === params.userId &&
      (!isActive || role !== "ADMIN")
    ) {
      return validationErrorResponse(
        "Kendi yönetici hesabınızı pasife alamaz veya rolünü değiştiremezsiniz"
      );
    }

    if (
      user.role === "TEACHER" &&
      role !== "TEACHER" &&
      user._count.teacherCourses > 0
    ) {
      return validationErrorResponse(
        "Üzerinde aktif ders bulunan öğretmenin rolü değiştirilemez"
      );
    }

    const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: params.userId },
        data: {
          firstName,
          lastName,
          email,
          role,
          phone: phone ?? null,
          bio: bio ?? null,
          isActive,
          ...(passwordHash ? { passwordHash } : {}),
        },
      });

      if (role === "STUDENT" && !user.streaks) {
        await tx.streak.create({
          data: {
            userId: params.userId,
            currentStreak: 0,
            longestStreak: 0,
            totalLessons: 0,
          },
        });
      }
    });

    return NextResponse.json({ message: "Kullanıcı güncellendi" });
  } catch (error) {
    console.error("Admin user update error:", error);
    return validationErrorResponse(
      "Kullanıcı güncellenirken bir hata oluştu",
      500
    );
  }
}
