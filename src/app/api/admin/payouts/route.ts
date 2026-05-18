import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  // Her öğretmen için: ödenmemiş hakediş toplamı + son ödeme
  const teachers = await db.user.findMany({
    where: { role: "TEACHER", isActive: true },
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  const summary = [];
  for (const t of teachers) {
    const pending = await db.teacherEarning.aggregate({
      where: { teacherId: t.id, payoutId: null },
      _sum: { amount: true, hours: true },
      _count: { id: true },
    });
    const lastPayout = await db.teacherPayout.findFirst({
      where: { teacherId: t.id },
      orderBy: { createdAt: "desc" },
    });
    summary.push({
      teacher: t,
      pendingAmount: Number(pending._sum.amount ?? 0),
      pendingHours: Number(pending._sum.hours ?? 0),
      pendingCount: pending._count.id,
      lastPayout,
    });
  }

  const payouts = await db.teacherPayout.findMany({
    include: { teacher: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ summary, payouts });
}
