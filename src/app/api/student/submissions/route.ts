import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { submissionAnswerSchema } from "@/lib/validations";
import { AssignmentStatus } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  assignmentId: z.string(),
  textAnswer: submissionAnswerSchema.shape.textAnswer,
  fileUrl: submissionAnswerSchema.shape.fileUrl,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }
  // Öğrencinin bu ödeve erişimi var mı?
  const assignment = await db.assignment.findUnique({
    where: { id: parsed.data.assignmentId },
    include: { course: { include: { enrollments: true } } },
  });
  if (
    !assignment ||
    !assignment.course.enrollments.some((e) => e.studentId === session.user.id)
  ) {
    return NextResponse.json({ error: "Erişim yok" }, { status: 403 });
  }

  const now = new Date();
  const late = assignment.dueDate ? now > assignment.dueDate : false;
  const submission = await db.submission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId: parsed.data.assignmentId,
        studentId: session.user.id,
      },
    },
    create: {
      assignmentId: parsed.data.assignmentId,
      studentId: session.user.id,
      textAnswer: parsed.data.textAnswer,
      fileUrl: parsed.data.fileUrl,
      submittedAt: now,
      status: late ? AssignmentStatus.LATE : AssignmentStatus.SUBMITTED,
    },
    update: {
      textAnswer: parsed.data.textAnswer,
      fileUrl: parsed.data.fileUrl,
      submittedAt: now,
      status: late ? AssignmentStatus.LATE : AssignmentStatus.SUBMITTED,
    },
  });
  return NextResponse.json({ submission });
}
