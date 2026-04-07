import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { profileSchema } from "@/lib/validations";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, bio } = parsed.data;

    await db.user.update({
      where: { id: session.user.id },
      data: { firstName, lastName, phone, bio },
    });

    return NextResponse.json({ message: "Profil güncellendi" });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Profil güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
