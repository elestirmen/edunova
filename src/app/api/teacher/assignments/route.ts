import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { assignmentSchema } from "@/lib/validations";
import { notifyMany } from "@/lib/services/notifications";
import { NotificationType } from "@prisma/client";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId");
  const assignments = await db.assignment.findMany({
    where: {
      course: { teacherId: session.user.id },
      ...(courseId && { courseId }),
    },
    include: {
      course: { select: { name: true } },
      submissions: {
        include: { student: { select: { firstName: true, lastName: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items: assignments });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = assignmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }
  const course = await db.course.findUnique({
    where: { id: parsed.data.courseId },
    include: { enrollments: { select: { studentId: true } } },
  });
  if (!course || course.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Ders size ait değil" }, { status: 403 });
  }
  const assignment = await db.assignment.create({
    data: { ...parsed.data, createdById: session.user.id },
  });
  await notifyMany({
    userIds: course.enrollments.map((e) => e.studentId),
    type: NotificationType.ASSIGNMENT_NEW,
    title: `Yeni ödev: ${assignment.title}`,
    body: course.name,
    link: `/panel/ogrenci/odevler`,
  });
  return NextResponse.json({ assignment }, { status: 201 });
}
