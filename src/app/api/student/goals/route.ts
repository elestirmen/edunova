import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { selfGoalSchema } from "@/lib/validations";
import { startOfWeek } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = selfGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }
  const weekStart = startOfWeek();
  // Aynı haftada zaten aktif hedef varsa güncelle
  const existing = await db.goal.findFirst({
    where: { userId: session.user.id, weekStart, isCompleted: false },
  });
  const goal = existing
    ? await db.goal.update({
        where: { id: existing.id },
        data: {
          title: parsed.data.title,
          targetPerWeek: parsed.data.targetPerWeek,
        },
      })
    : await db.goal.create({
        data: {
          userId: session.user.id,
          title: parsed.data.title,
          targetPerWeek: parsed.data.targetPerWeek,
          weekStart,
          isSelfProposed: true,
        },
      });
  return NextResponse.json({ goal }, { status: existing ? 200 : 201 });
}
