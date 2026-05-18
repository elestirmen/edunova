import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getBalancesForStudent } from "@/lib/services/ledger";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const balances = await getBalancesForStudent(session.user.id);
  const enriched = await Promise.all(
    balances.map(async (b) => {
      const course = await db.course.findUnique({
        where: { id: b.courseId },
        select: { name: true, code: true, color: true },
      });
      return { ...b, course };
    })
  );
  return NextResponse.json({ items: enriched });
}
