import { Prisma, HourLedgerReason } from "@prisma/client";
import { db } from "@/lib/db";

type Tx = Prisma.TransactionClient | typeof db;

export async function getBalance(
  studentId: string,
  courseId: string,
  tx: Tx = db
): Promise<number> {
  const result = await tx.hourLedgerEntry.aggregate({
    where: { studentId, courseId },
    _sum: { hours: true },
  });
  return Number(result._sum.hours ?? 0);
}

export async function getBalancesForStudent(studentId: string) {
  const groups = await db.hourLedgerEntry.groupBy({
    by: ["courseId"],
    where: { studentId },
    _sum: { hours: true },
  });
  return groups.map((g) => ({
    courseId: g.courseId,
    balance: Number(g._sum.hours ?? 0),
  }));
}

export async function purchasePackage(
  input: {
    studentId: string;
    courseId: string;
    hoursPurchased: number;
    pricePaid: number;
    paymentMethod?: string;
    note?: string;
    createdById?: string;
  },
  tx?: Prisma.TransactionClient
) {
  const run = async (client: Prisma.TransactionClient) => {
    const pkg = await client.hourPackage.create({
      data: {
        studentId: input.studentId,
        courseId: input.courseId,
        hoursPurchased: input.hoursPurchased,
        pricePaid: input.pricePaid,
        paymentMethod: input.paymentMethod,
        note: input.note,
        createdById: input.createdById,
      },
    });
    await client.hourLedgerEntry.create({
      data: {
        studentId: input.studentId,
        courseId: input.courseId,
        hours: input.hoursPurchased,
        reason: HourLedgerReason.PURCHASE,
        packageId: pkg.id,
      },
    });
    return pkg;
  };
  return tx ? run(tx) : db.$transaction(run);
}

export async function deductForLesson(
  tx: Prisma.TransactionClient,
  input: {
    studentId: string;
    courseId: string;
    occurrenceId: string;
    hourCost: number;
    note?: string;
  }
) {
  return tx.hourLedgerEntry.create({
    data: {
      studentId: input.studentId,
      courseId: input.courseId,
      hours: -input.hourCost,
      reason: HourLedgerReason.LESSON_USED,
      occurrenceId: input.occurrenceId,
      note: input.note,
    },
  });
}

export async function refundOccurrence(
  tx: Prisma.TransactionClient,
  occurrenceId: string,
  note?: string
) {
  const entries = await tx.hourLedgerEntry.findMany({
    where: {
      occurrenceId,
      reason: { in: [HourLedgerReason.LESSON_USED] },
    },
  });
  for (const e of entries) {
    await tx.hourLedgerEntry.create({
      data: {
        studentId: e.studentId,
        courseId: e.courseId,
        hours: Number(e.hours) * -1,
        reason: HourLedgerReason.REFUND,
        occurrenceId,
        note: note ?? "Ders iade",
      },
    });
  }
}

export async function adjustBalance(
  input: {
    studentId: string;
    courseId: string;
    hours: number;
    note: string;
  },
  tx?: Prisma.TransactionClient
) {
  const client = tx ?? db;
  return client.hourLedgerEntry.create({
    data: {
      studentId: input.studentId,
      courseId: input.courseId,
      hours: input.hours,
      reason: HourLedgerReason.ADJUSTMENT,
      note: input.note,
    },
  });
}
