import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfMonth, endOfMonth } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const start = startOfMonth();
  const end = endOfMonth();

  const [revenue, payoutAggregate, pendingEarnings, deliveredCount] =
    await Promise.all([
      db.hourPackage.aggregate({
        where: { purchasedAt: { gte: start, lt: end } },
        _sum: { pricePaid: true },
        _count: { id: true },
      }),
      db.teacherPayout.aggregate({
        where: { createdAt: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
      db.teacherEarning.aggregate({
        where: {
          payoutId: null,
          createdAt: { gte: start, lt: end },
        },
        _sum: { amount: true },
      }),
      db.lessonOccurrence.count({
        where: {
          status: "DELIVERED",
          date: { gte: start, lt: end },
        },
      }),
    ]);

  // Bakiyesi düşük öğrenciler
  const balances = await db.hourLedgerEntry.groupBy({
    by: ["studentId", "courseId"],
    _sum: { hours: true },
  });
  const lowBalances: Array<{
    studentId: string;
    courseId: string;
    balance: number;
  }> = [];
  for (const b of balances) {
    const balance = Number(b._sum.hours ?? 0);
    if (balance <= 3 && balance > 0) {
      lowBalances.push({
        studentId: b.studentId,
        courseId: b.courseId,
        balance,
      });
    }
  }
  const enriched = await Promise.all(
    lowBalances.slice(0, 20).map(async (b) => {
      const [student, course] = await Promise.all([
        db.user.findUnique({
          where: { id: b.studentId },
          select: { firstName: true, lastName: true, email: true },
        }),
        db.course.findUnique({
          where: { id: b.courseId },
          select: { name: true, code: true },
        }),
      ]);
      return { ...b, student, course };
    })
  );

  const revenueTotal = Number(revenue._sum.pricePaid ?? 0);
  const payoutTotal = Number(payoutAggregate._sum.amount ?? 0);
  const pendingTotal = Number(pendingEarnings._sum.amount ?? 0);
  const netProfit = revenueTotal - payoutTotal - pendingTotal;

  return NextResponse.json({
    month: { start, end },
    revenue: revenueTotal,
    revenueCount: revenue._count.id,
    payouts: payoutTotal,
    pendingEarnings: pendingTotal,
    netProfit,
    deliveredCount,
    lowBalances: enriched,
  });
}
