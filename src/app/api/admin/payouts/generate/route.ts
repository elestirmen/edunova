import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateMonthlyPayout } from "@/lib/services/earnings";
import { logAudit } from "@/lib/services/audit";
import { notify } from "@/lib/services/notifications";
import { startOfMonth, endOfMonth } from "@/lib/utils";
import { NotificationType } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  teacherId: z.string(),
  month: z.coerce.date().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
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
  const baseDate = parsed.data.month ?? new Date();
  const periodStart = startOfMonth(baseDate);
  const periodEnd = endOfMonth(baseDate);

  const payout = await generateMonthlyPayout({
    teacherId: parsed.data.teacherId,
    periodStart,
    periodEnd,
  });

  if (!payout) {
    return NextResponse.json(
      { error: "Bu ay için ödenmemiş hakediş yok" },
      { status: 400 }
    );
  }

  await Promise.all([
    notify({
      userId: parsed.data.teacherId,
      type: NotificationType.PAYOUT_READY,
      title: "Yeni hakediş kaydı oluşturuldu",
      body: `${Number(payout.amount).toLocaleString("tr-TR")} TL hakedişiniz hazırlandı.`,
    }),
    logAudit({
      actorId: session.user.id,
      action: "payout.generate",
      targetType: "TeacherPayout",
      targetId: payout.id,
      metadata: {
        teacherId: parsed.data.teacherId,
        amount: Number(payout.amount),
      },
    }),
  ]);

  return NextResponse.json({ payout });
}
