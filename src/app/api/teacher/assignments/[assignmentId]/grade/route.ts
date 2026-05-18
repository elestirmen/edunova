import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { submissionGradeSchema } from "@/lib/validations";
import { notify } from "@/lib/services/notifications";
import { NotificationType, AssignmentStatus } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  submissionId: z.string(),
  grade: submissionGradeSchema.shape.grade,
  feedback: submissionGradeSchema.shape.feedback,
});

export async function POST(
  req: Request,
  { params }: { params: { assignmentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
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
  const sub = await db.submission.findUnique({
    where: { id: parsed.data.submissionId },
    include: {
      assignment: {
        include: { course: { select: { teacherId: true, name: true } } },
      },
    },
  });
  if (!sub || sub.assignmentId !== params.assignmentId) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }
  if (sub.assignment.course.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }
  const updated = await db.submission.update({
    where: { id: parsed.data.submissionId },
    data: {
      grade: parsed.data.grade,
      feedback: parsed.data.feedback,
      status: AssignmentStatus.GRADED,
      gradedAt: new Date(),
    },
  });
  await notify({
    userId: sub.studentId,
    type: NotificationType.ASSIGNMENT_GRADED,
    title: `${sub.assignment.title} değerlendirildi`,
    body: `${parsed.data.grade}/${sub.assignment.maxGrade}`,
  });
  return NextResponse.json({ submission: updated });
}
