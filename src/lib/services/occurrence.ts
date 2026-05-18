import { LessonStatus, NotificationType } from "@prisma/client";
import { db } from "@/lib/db";
import { deductForLesson, refundOccurrence } from "./ledger";
import {
  getTeacherHourlyRate,
  recordEarning,
  removeEarningsForOccurrence,
} from "./earnings";
import { recordLessonForStreak } from "./streak";
import { notify, notifyMany } from "./notifications";
import { logAudit } from "./audit";

const HOURS_FOR_LATE_CANCEL = 24;
// CANCELLED_LATE durumunda öğretmen tam hakediş alır (varsayılan politika).
const TEACHER_EARNS_ON_LATE_CANCEL = true;
const STUDENT_PAYS_ON_NO_SHOW = true;

export function isLateCancel(
  scheduledDate: Date,
  cancelTime: Date = new Date()
): boolean {
  const hoursBefore =
    (scheduledDate.getTime() - cancelTime.getTime()) / (1000 * 60 * 60);
  return hoursBefore < HOURS_FOR_LATE_CANCEL;
}

export async function ensureOccurrence(input: {
  lessonSlotId: string;
  date: Date;
}) {
  const dateOnly = new Date(input.date);
  dateOnly.setHours(0, 0, 0, 0);
  return db.lessonOccurrence.upsert({
    where: {
      lessonSlotId_date: { lessonSlotId: input.lessonSlotId, date: dateOnly },
    },
    create: {
      lessonSlotId: input.lessonSlotId,
      date: dateOnly,
      status: LessonStatus.SCHEDULED,
    },
    update: {},
  });
}

export async function deliverLesson(input: {
  occurrenceId: string;
  teacherNote?: string;
  durationHours?: number;
  topicIds?: string[];
  attendanceMap?: Record<string, boolean>;
}) {
  return db.$transaction(async (tx) => {
    const occurrence = await tx.lessonOccurrence.findUnique({
      where: { id: input.occurrenceId },
      include: {
        lessonSlot: {
          include: { course: { include: { enrollments: true } } },
        },
      },
    });
    if (!occurrence) throw new Error("Ders bulunamadı");
    if (occurrence.status === LessonStatus.DELIVERED) {
      throw new Error("Ders zaten teslim edilmiş");
    }

    const course = occurrence.lessonSlot.course;
    const teacherId = course.teacherId;
    const hourCostPerStudent = Number(course.hourCostPerStudent);
    const duration = input.durationHours ?? Number(occurrence.durationHours);

    await tx.lessonOccurrence.update({
      where: { id: occurrence.id },
      data: {
        status: LessonStatus.DELIVERED,
        teacherNote: input.teacherNote,
        durationHours: duration,
        deliveredAt: new Date(),
        topicLinks: input.topicIds
          ? {
              deleteMany: {},
              create: input.topicIds.map((topicId) => ({ topicId })),
            }
          : undefined,
      },
    });

    // Yoklama + bakiye düşümü her kayıtlı öğrenci için
    for (const enrollment of course.enrollments) {
      const isPresent = input.attendanceMap?.[enrollment.studentId] ?? true;

      await tx.attendance.upsert({
        where: {
          occurrenceId_studentId: {
            occurrenceId: occurrence.id,
            studentId: enrollment.studentId,
          },
        },
        update: { isPresent },
        create: {
          occurrenceId: occurrence.id,
          studentId: enrollment.studentId,
          isPresent,
        },
      });

      // Öğrenci geldi ise saat düşer. Gelmedi (no-show) ise politikaya göre.
      if (isPresent || STUDENT_PAYS_ON_NO_SHOW) {
        await deductForLesson(tx, {
          studentId: enrollment.studentId,
          courseId: course.id,
          occurrenceId: occurrence.id,
          hourCost: hourCostPerStudent,
        });
      }

      if (isPresent) {
        await recordLessonForStreak(tx, enrollment.studentId, occurrence.date);
      }

      // Bakiye düşük uyarısı (3 saatin altına düştüyse)
      const balance = await tx.hourLedgerEntry.aggregate({
        where: { studentId: enrollment.studentId, courseId: course.id },
        _sum: { hours: true },
      });
      const remaining = Number(balance._sum.hours ?? 0);
      if (remaining <= 3 && remaining > 0) {
        await notify(
          {
            userId: enrollment.studentId,
            type: NotificationType.BALANCE_LOW,
            title: `${course.name}: ${remaining.toFixed(1)} saat kaldı`,
            body: "Paket yenilemek için yönetici ile iletişime geçin.",
          },
          tx
        );
        // Velilere de bildirim
        const parents = await tx.parentStudent.findMany({
          where: { studentId: enrollment.studentId },
        });
        await notifyMany(
          {
            userIds: parents.map((p) => p.parentId),
            type: NotificationType.BALANCE_LOW,
            title: `${course.name} dersi için bakiye azaldı`,
            body: `Çocuğunuzun ${course.name} dersi için ${remaining.toFixed(1)} saat kaldı.`,
          },
          tx
        );
      }
    }

    // Öğretmen hakedişi
    const hourlyRate = await getTeacherHourlyRate(
      teacherId,
      course.type,
      new Date(),
      tx
    );
    await recordEarning(tx, {
      teacherId,
      occurrenceId: occurrence.id,
      hours: duration,
      hourlyRate,
    });

    await logAudit(
      {
        actorId: teacherId,
        action: "lesson.deliver",
        targetType: "LessonOccurrence",
        targetId: occurrence.id,
        metadata: { courseId: course.id, duration },
      },
      tx
    );

    return tx.lessonOccurrence.findUnique({
      where: { id: occurrence.id },
      include: { attendances: true, earnings: true },
    });
  });
}

export async function cancelLesson(input: {
  occurrenceId: string;
  cancelledById: string;
  reason: string;
  forceStatus?: LessonStatus;
}) {
  return db.$transaction(async (tx) => {
    const occurrence = await tx.lessonOccurrence.findUnique({
      where: { id: input.occurrenceId },
      include: {
        lessonSlot: {
          include: { course: { include: { enrollments: true } } },
        },
      },
    });
    if (!occurrence) throw new Error("Ders bulunamadı");
    if (occurrence.status === LessonStatus.DELIVERED) {
      throw new Error("Teslim edilmiş ders iptal edilemez (önce geri al)");
    }

    const course = occurrence.lessonSlot.course;
    const status =
      input.forceStatus ??
      (isLateCancel(occurrence.date)
        ? LessonStatus.CANCELLED_LATE
        : LessonStatus.CANCELLED_EARLY);

    await tx.lessonOccurrence.update({
      where: { id: occurrence.id },
      data: {
        status,
        cancelledAt: new Date(),
        cancelledById: input.cancelledById,
        cancelReason: input.reason,
      },
    });

    // Önceki düşüm/kazançları temizle
    await refundOccurrence(tx, occurrence.id, `İptal: ${input.reason}`);
    await removeEarningsForOccurrence(tx, occurrence.id);

    // CANCELLED_LATE → öğrenci cezalı saat düşer, öğretmen alır
    if (status === LessonStatus.CANCELLED_LATE) {
      const hourCost = Number(course.hourCostPerStudent);
      for (const e of course.enrollments) {
        await deductForLesson(tx, {
          studentId: e.studentId,
          courseId: course.id,
          occurrenceId: occurrence.id,
          hourCost,
          note: "Geç iptal cezası",
        });
      }
      if (TEACHER_EARNS_ON_LATE_CANCEL) {
        const rate = await getTeacherHourlyRate(
          course.teacherId,
          course.type,
          new Date(),
          tx
        );
        await recordEarning(tx, {
          teacherId: course.teacherId,
          occurrenceId: occurrence.id,
          hours: Number(occurrence.durationHours),
          hourlyRate: rate,
        });
      }
    }

    // İlgili herkese bildirim
    const enrolledIds = course.enrollments.map((e) => e.studentId);
    await notifyMany(
      {
        userIds: enrolledIds,
        type: NotificationType.LESSON_CANCELLED,
        title: `${course.name} dersi iptal edildi`,
        body: input.reason,
      },
      tx
    );

    const parents = await tx.parentStudent.findMany({
      where: { studentId: { in: enrolledIds } },
    });
    await notifyMany(
      {
        userIds: parents.map((p) => p.parentId),
        type: NotificationType.LESSON_CANCELLED,
        title: `${course.name} dersi iptal edildi`,
        body: input.reason,
      },
      tx
    );

    await logAudit(
      {
        actorId: input.cancelledById,
        action: "lesson.cancel",
        targetType: "LessonOccurrence",
        targetId: occurrence.id,
        metadata: { status, reason: input.reason },
      },
      tx
    );

    return tx.lessonOccurrence.findUnique({ where: { id: occurrence.id } });
  });
}

export async function revertDelivery(input: {
  occurrenceId: string;
  actorId: string;
  reason: string;
}) {
  return db.$transaction(async (tx) => {
    const occurrence = await tx.lessonOccurrence.findUnique({
      where: { id: input.occurrenceId },
    });
    if (!occurrence) throw new Error("Ders bulunamadı");
    if (occurrence.status !== LessonStatus.DELIVERED) {
      throw new Error("Bu ders teslim edilmedi");
    }

    await refundOccurrence(tx, occurrence.id, `Teslim geri alındı: ${input.reason}`);
    await removeEarningsForOccurrence(tx, occurrence.id);

    await tx.lessonOccurrence.update({
      where: { id: occurrence.id },
      data: {
        status: LessonStatus.SCHEDULED,
        deliveredAt: null,
      },
    });

    await logAudit(
      {
        actorId: input.actorId,
        action: "lesson.revert_delivery",
        targetType: "LessonOccurrence",
        targetId: occurrence.id,
        metadata: { reason: input.reason },
      },
      tx
    );

    return tx.lessonOccurrence.findUnique({ where: { id: occurrence.id } });
  });
}
