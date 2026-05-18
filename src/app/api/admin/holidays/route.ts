import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { holidaySchema } from "@/lib/validations";
import { logAudit } from "@/lib/services/audit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const items = await db.holiday.findMany({ orderBy: { date: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = holidaySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }
  const date = new Date(parsed.data.date);
  date.setHours(0, 0, 0, 0);
  const holiday = await db.holiday.upsert({
    where: { date },
    update: { name: parsed.data.name, reason: parsed.data.reason },
    create: { date, name: parsed.data.name, reason: parsed.data.reason },
  });
  await logAudit({
    actorId: session.user.id,
    action: "holiday.upsert",
    targetType: "Holiday",
    targetId: holiday.id,
  });
  return NextResponse.json({ holiday }, { status: 201 });
}
