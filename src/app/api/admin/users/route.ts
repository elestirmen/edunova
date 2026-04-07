import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  adminUnauthorizedResponse,
  requireAdminApiSession,
  validationErrorResponse,
} from "@/lib/admin-api";
import { adminUserCreateSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await requireAdminApiSession();

    if (!session) {
      return adminUnauthorizedResponse();
    }

    const body = await req.json();
    const parsed = adminUserCreateSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors[0].message);
    }

    const { firstName, lastName, email, password, role, phone, bio, isActive } =
      parsed.data;

    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return validationErrorResponse("Bu e-posta adresi zaten kayıtlı");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role,
        phone: phone ?? null,
        bio: bio ?? null,
        isActive,
        ...(role === "STUDENT"
          ? {
              streaks: {
                create: {
                  currentStreak: 0,
                  longestStreak: 0,
                  totalLessons: 0,
                },
              },
            }
          : {}),
      },
    });

    return NextResponse.json({ message: "Kullanıcı oluşturuldu" }, { status: 201 });
  } catch (error) {
    console.error("Admin user create error:", error);
    return validationErrorResponse(
      "Kullanıcı oluşturulurken bir hata oluştu",
      500
    );
  }
}
