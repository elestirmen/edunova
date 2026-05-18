import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { setTeacherRate } from "@/lib/services/earnings";
import { teacherRateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/services/audit";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const url = new URL(req.url);
  const teacherId = url.searchParams.get("teacherId");
  const rates = await db.teacherRate.findMany({
    where: { ...(teacherId && { teacherId }) },
    include: { teacher: { select: { firstName: true, lastName: true } } },
    orderBy: { effectiveFrom: "desc" },
  });
  return NextResponse.json({ items: rates });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = teacherRateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }
  const rate = await setTeacherRate(parsed.data);
  await logAudit({
    actorId: session.user.id,
    action: "teacher_rate.set",
    targetType: "TeacherRate",
    targetId: rate.id,
    metadata: {
      teacherId: parsed.data.teacherId,
      type: parsed.data.courseType,
      rate: parsed.data.hourlyRate,
    },
  });
  return NextResponse.json({ rate }, { status: 201 });
}
