import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const attendanceSchema = z.object({
  lessonSlotId: z.string().min(1),
  date: z.string().min(1),
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      isPresent: z.boolean(),
    })
  ),
});

async function updateStudentStreak(studentId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAttendance = await db.attendance.findFirst({
    where: {
      studentId,
      isPresent: true,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 86400000),
      },
    },
  });

  if (!todayAttendance) return;

  const streak = await db.streak.findUnique({ where: { userId: studentId } });
  if (!streak) return;

  const lastActive = streak.lastActiveDate
    ? new Date(streak.lastActiveDate)
    : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
  }

  const todayStr = today.getTime();
  const lastStr = lastActive ? lastActive.getTime() : 0;

  if (lastStr === todayStr) return;

  const yesterday = new Date(today.getTime() - 86400000);
  const isConsecutive = lastStr === yesterday.getTime();

  const newCurrent = isConsecutive ? streak.currentStreak + 1 : 1;
  const newLongest = Math.max(streak.longestStreak, newCurrent);

  const presentToday = await db.attendance.count({
    where: {
      studentId,
      isPresent: true,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 86400000),
      },
    },
  });

  await db.streak.update({
    where: { userId: studentId },
    data: {
      currentStreak: newCurrent,
      longestStreak: newLongest,
      lastActiveDate: today,
      totalLessons: { increment: presentToday },
    },
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = attendanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { lessonSlotId, date, records } = parsed.data;
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const lessonSlot = await db.lessonSlot.findUnique({
      where: { id: lessonSlotId },
      include: {
        course: { select: { teacherId: true } },
      },
    });

    if (!lessonSlot) {
      return NextResponse.json({ error: "Ders saati bulunamadı" }, { status: 404 });
    }

    if (lessonSlot.course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Bu ders size ait değil" }, { status: 403 });
    }

    const affectedStudentIds = new Set<string>();

    await db.$transaction(async (tx) => {
      for (const record of records) {
        await tx.attendance.upsert({
          where: {
            studentId_lessonSlotId_date: {
              studentId: record.studentId,
              lessonSlotId,
              date: attendanceDate,
            },
          },
          create: {
            studentId: record.studentId,
            lessonSlotId,
            date: attendanceDate,
            isPresent: record.isPresent,
          },
          update: {
            isPresent: record.isPresent,
          },
        });
        if (record.isPresent) {
          affectedStudentIds.add(record.studentId);
        }
      }
    });

    const studentIds = Array.from(affectedStudentIds);
    for (let i = 0; i < studentIds.length; i++) {
      await updateStudentStreak(studentIds[i]);
    }

    return NextResponse.json({ message: "Yoklama kaydedildi" });
  } catch (error) {
    console.error("Attendance error:", error);
    return NextResponse.json(
      { error: "Yoklama kaydedilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
