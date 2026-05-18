import { Prisma } from "@prisma/client";

function dayKey(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export async function recordLessonForStreak(
  tx: Prisma.TransactionClient,
  studentId: string,
  occurrenceDate: Date
) {
  const today = dayKey(occurrenceDate);
  const existing = await tx.streak.findUnique({ where: { userId: studentId } });

  if (!existing) {
    return tx.streak.create({
      data: {
        userId: studentId,
        currentStreak: 1,
        longestStreak: 1,
        totalLessons: 1,
        lastActiveDate: occurrenceDate,
      },
    });
  }

  const last = existing.lastActiveDate ? dayKey(existing.lastActiveDate) : null;
  const oneDay = 24 * 60 * 60 * 1000;

  let newStreak: number;
  if (last === today) {
    newStreak = existing.currentStreak;
  } else if (last !== null && today - last === oneDay) {
    newStreak = existing.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  return tx.streak.update({
    where: { userId: studentId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(existing.longestStreak, newStreak),
      totalLessons: existing.totalLessons + 1,
      lastActiveDate: occurrenceDate,
    },
  });
}
