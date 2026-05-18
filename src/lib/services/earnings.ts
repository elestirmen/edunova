import { Prisma, CourseType } from "@prisma/client";
import { db } from "@/lib/db";

type Tx = Prisma.TransactionClient | typeof db;

export async function getTeacherHourlyRate(
  teacherId: string,
  courseType: CourseType,
  at: Date = new Date(),
  tx: Tx = db
): Promise<number> {
  const rate = await tx.teacherRate.findFirst({
    where: {
      teacherId,
      courseType,
      effectiveFrom: { lte: at },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: at } }],
    },
    orderBy: { effectiveFrom: "desc" },
  });
  return rate ? Number(rate.hourlyRate) : 0;
}

export async function setTeacherRate(input: {
  teacherId: string;
  courseType: CourseType;
  hourlyRate: number;
  effectiveFrom?: Date;
}) {
  const effectiveFrom = input.effectiveFrom ?? new Date();
  return db.$transaction(async (tx) => {
    // Close previous rate if exists
    await tx.teacherRate.updateMany({
      where: {
        teacherId: input.teacherId,
        courseType: input.courseType,
        effectiveTo: null,
      },
      data: { effectiveTo: effectiveFrom },
    });
    return tx.teacherRate.create({
      data: {
        teacherId: input.teacherId,
        courseType: input.courseType,
        hourlyRate: input.hourlyRate,
        effectiveFrom,
      },
    });
  });
}

export async function recordEarning(
  tx: Prisma.TransactionClient,
  input: {
    teacherId: string;
    occurrenceId: string;
    hours: number;
    hourlyRate: number;
  }
) {
  return tx.teacherEarning.create({
    data: {
      teacherId: input.teacherId,
      occurrenceId: input.occurrenceId,
      hours: input.hours,
      hourlyRate: input.hourlyRate,
      amount: input.hours * input.hourlyRate,
    },
  });
}

export async function removeEarningsForOccurrence(
  tx: Prisma.TransactionClient,
  occurrenceId: string
) {
  return tx.teacherEarning.deleteMany({
    where: { occurrenceId, payoutId: null },
  });
}

export async function getPendingEarnings(teacherId: string) {
  return db.teacherEarning.findMany({
    where: { teacherId, payoutId: null },
    include: {
      occurrence: {
        include: { lessonSlot: { include: { course: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function generateMonthlyPayout(input: {
  teacherId: string;
  periodStart: Date;
  periodEnd: Date;
}) {
  return db.$transaction(async (tx) => {
    const earnings = await tx.teacherEarning.findMany({
      where: {
        teacherId: input.teacherId,
        payoutId: null,
        createdAt: { gte: input.periodStart, lt: input.periodEnd },
      },
    });
    if (earnings.length === 0) return null;

    const totalAmount = earnings.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );

    const payout = await tx.teacherPayout.create({
      data: {
        teacherId: input.teacherId,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        amount: totalAmount,
      },
    });

    await tx.teacherEarning.updateMany({
      where: { id: { in: earnings.map((e) => e.id) } },
      data: { payoutId: payout.id },
    });

    return payout;
  });
}

export async function markPayoutPaid(payoutId: string, paymentRef?: string) {
  return db.teacherPayout.update({
    where: { id: payoutId },
    data: { paidAt: new Date(), paymentRef },
  });
}
