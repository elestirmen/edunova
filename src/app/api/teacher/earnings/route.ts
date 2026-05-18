import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPendingEarnings } from "@/lib/services/earnings";
import { startOfMonth, endOfMonth } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const start = startOfMonth();
  const end = endOfMonth();

  const [pending, monthEarnings, allPayouts] = await Promise.all([
    getPendingEarnings(session.user.id),
    db.teacherEarning.aggregate({
      where: {
        teacherId: session.user.id,
        createdAt: { gte: start, lt: end },
      },
      _sum: { amount: true, hours: true },
      _count: { id: true },
    }),
    db.teacherPayout.findMany({
      where: { teacherId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return NextResponse.json({
    pending,
    pendingTotal: pending.reduce((s, e) => s + Number(e.amount), 0),
    monthAmount: Number(monthEarnings._sum.amount ?? 0),
    monthHours: Number(monthEarnings._sum.hours ?? 0),
    monthLessonCount: monthEarnings._count.id,
    payouts: allPayouts,
  });
}
