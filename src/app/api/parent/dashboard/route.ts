import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getBalancesForStudent } from "@/lib/services/ledger";
import { startOfWeek, endOfWeek } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const links = await db.parentStudent.findMany({
    where: { parentId: session.user.id },
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  const wkStart = startOfWeek();
  const wkEnd = endOfWeek();

  const children = await Promise.all(
    links.map(async (link) => {
      const [balances, recent, weekDelivered, weekTotal] = await Promise.all([
        getBalancesForStudent(link.studentId),
        db.attendance.findMany({
          where: { studentId: link.studentId },
          include: {
            occurrence: {
              include: { lessonSlot: { include: { course: true } } },
            },
          },
          orderBy: { occurrence: { date: "desc" } },
          take: 8,
        }),
        db.lessonOccurrence.count({
          where: {
            status: "DELIVERED",
            date: { gte: wkStart, lt: wkEnd },
            attendances: { some: { studentId: link.studentId } },
          },
        }),
        db.lessonOccurrence.count({
          where: {
            date: { gte: wkStart, lt: wkEnd },
            attendances: { some: { studentId: link.studentId } },
          },
        }),
      ]);
      const enrichedBalances = await Promise.all(
        balances.map(async (b) => {
          const c = await db.course.findUnique({
            where: { id: b.courseId },
            select: { name: true, code: true, color: true },
          });
          return { ...b, course: c };
        })
      );
      return {
        student: link.student,
        balances: enrichedBalances,
        recent,
        weekDelivered,
        weekTotal,
      };
    })
  );

  return NextResponse.json({ children });
}
