import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { markPayoutPaid } from "@/lib/services/earnings";
import { logAudit } from "@/lib/services/audit";
import { z } from "zod";

const schema = z.object({
  paymentRef: z.string().trim().max(200).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { payoutId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  const payout = await markPayoutPaid(params.payoutId, parsed.data.paymentRef);
  await logAudit({
    actorId: session.user.id,
    action: "payout.pay",
    targetType: "TeacherPayout",
    targetId: payout.id,
    metadata: { paymentRef: parsed.data.paymentRef },
  });
  return NextResponse.json({ payout });
}
