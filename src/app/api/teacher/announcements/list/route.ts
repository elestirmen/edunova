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

    const announcements = await db.announcement.findMany({
      where: {
        OR: [
          { authorId: session.user.id },
          { isGlobal: true },
        ],
      },
      include: {
        author: { select: { firstName: true, lastName: true } },
        course: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      announcements: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        isGlobal: a.isGlobal,
        authorName: `${a.author.firstName} ${a.author.lastName}`,
        courseName: a.course?.name ?? null,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Teacher announcements list error:", error);
    return NextResponse.json({ error: "Duyurular yüklenemedi" }, { status: 500 });
  }
}
