import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const courses = await db.course.findMany({
      where: { teacherId: session.user.id },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Teacher courses list error:", error);
    return NextResponse.json({ error: "Dersler yüklenemedi" }, { status: 500 });
  }
}
