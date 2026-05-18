import {
  PrismaClient,
  DayOfWeek,
  CourseType,
  LessonStatus,
  HourLedgerReason,
  NotificationType,
  TopicProgressStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function dateOnly(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function startOfWeekMonday(d: Date = new Date()): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const r = new Date(d);
  r.setDate(d.getDate() + diff);
  r.setHours(0, 0, 0, 0);
  return r;
}

async function main() {
  console.log("Seeding database (Edunova Tutoring Agency)...");
  const passwordHash = await bcrypt.hash("123456", 12);

  // ---------- USERS ----------

  const admin = await prisma.user.upsert({
    where: { email: "admin@edunova.com" },
    update: {},
    create: {
      email: "admin@edunova.com",
      firstName: "Ayşe",
      lastName: "Yılmaz",
      passwordHash,
      role: "ADMIN",
    },
  });

  const teachers = [];
  const teacherData = [
    { email: "ogretmen@edunova.com", firstName: "Mehmet", lastName: "Kaya", bio: "Matematik (Lise ve YKS)" },
    { email: "zeynep@edunova.com", firstName: "Zeynep", lastName: "Demir", bio: "Fizik & Kimya" },
    { email: "ali@edunova.com", firstName: "Ali", lastName: "Çelik", bio: "İngilizce (Cambridge sertifikalı)" },
    { email: "fatma@edunova.com", firstName: "Fatma", lastName: "Şahin", bio: "Türkçe & Edebiyat" },
  ];
  for (const t of teacherData) {
    const teacher = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: { ...t, passwordHash, role: "TEACHER" },
    });
    teachers.push(teacher);
  }

  // TeacherRate — her öğretmen için INDIVIDUAL ve GROUP
  for (const teacher of teachers) {
    await prisma.teacherRate.deleteMany({ where: { teacherId: teacher.id } });
    await prisma.teacherRate.createMany({
      data: [
        { teacherId: teacher.id, courseType: "INDIVIDUAL", hourlyRate: 400 },
        { teacherId: teacher.id, courseType: "GROUP", hourlyRate: 500 },
      ],
    });
  }
  console.log(`${teachers.length} öğretmen + ücret tarifeleri oluşturuldu`);

  // Veliler
  const parent1 = await prisma.user.upsert({
    where: { email: "veli1@edunova.com" },
    update: {},
    create: {
      email: "veli1@edunova.com",
      firstName: "Hatice",
      lastName: "Arslan",
      passwordHash,
      role: "PARENT",
    },
  });
  const parent2 = await prisma.user.upsert({
    where: { email: "veli2@edunova.com" },
    update: {},
    create: {
      email: "veli2@edunova.com",
      firstName: "İbrahim",
      lastName: "Şahin",
      passwordHash,
      role: "PARENT",
    },
  });

  // Öğrenciler
  const students = [];
  const studentData = [
    { email: "ogrenci@edunova.com", firstName: "Cem", lastName: "Arslan", parent: parent1 },
    { email: "elif@edunova.com", firstName: "Elif", lastName: "Şahin", parent: parent2 },
    { email: "burak@edunova.com", firstName: "Burak", lastName: "Öztürk", parent: null },
    { email: "selin@edunova.com", firstName: "Selin", lastName: "Aydın", parent: null },
    { email: "emre@edunova.com", firstName: "Emre", lastName: "Koç", parent: null },
    { email: "deniz@edunova.com", firstName: "Deniz", lastName: "Yıldız", parent: parent1 },
  ];
  for (const s of studentData) {
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        passwordHash,
        role: "STUDENT",
      },
    });
    students.push(student);
    if (s.parent) {
      await prisma.parentStudent.upsert({
        where: { parentId_studentId: { parentId: s.parent.id, studentId: student.id } },
        update: {},
        create: { parentId: s.parent.id, studentId: student.id },
      });
    }
  }
  console.log(`${students.length} öğrenci + veli bağlantıları`);

  // ---------- COURSES ----------
  // Çoğunluk INDIVIDUAL (1-1), 1-2 tane GROUP

  const courses = [
    // Bireysel dersler
    {
      code: "MAT-CEM",
      name: "Matematik (Cem)",
      teacherId: teachers[0].id,
      color: "#6366f1",
      type: CourseType.INDIVIDUAL,
      hourCostPerStudent: 1.0,
      studentIds: [students[0].id],
    },
    {
      code: "MAT-ELI",
      name: "Matematik (Elif)",
      teacherId: teachers[0].id,
      color: "#8b5cf6",
      type: CourseType.INDIVIDUAL,
      hourCostPerStudent: 1.0,
      studentIds: [students[1].id],
    },
    {
      code: "FIZ-DEN",
      name: "Fizik (Deniz)",
      teacherId: teachers[1].id,
      color: "#f59e0b",
      type: CourseType.INDIVIDUAL,
      hourCostPerStudent: 1.0,
      studentIds: [students[5].id],
    },
    {
      code: "ING-BUR",
      name: "İngilizce (Burak)",
      teacherId: teachers[2].id,
      color: "#10b981",
      type: CourseType.INDIVIDUAL,
      hourCostPerStudent: 1.0,
      studentIds: [students[2].id],
    },
    // Grup dersleri
    {
      code: "YKS-MAT",
      name: "YKS Matematik Grubu",
      teacherId: teachers[0].id,
      color: "#ef4444",
      type: CourseType.GROUP,
      hourCostPerStudent: 0.7,
      studentIds: [students[3].id, students[4].id, students[5].id],
    },
    {
      code: "EDB-LIT",
      name: "Edebiyat Grubu",
      teacherId: teachers[3].id,
      color: "#06b6d4",
      type: CourseType.GROUP,
      hourCostPerStudent: 0.7,
      studentIds: [students[0].id, students[1].id, students[2].id],
    },
  ];

  const createdCourses = [];
  for (const c of courses) {
    const course = await prisma.course.upsert({
      where: { code: c.code },
      update: {
        name: c.name,
        teacherId: c.teacherId,
        color: c.color,
        type: c.type,
        hourCostPerStudent: c.hourCostPerStudent,
        maxStudents: c.studentIds.length || 1,
      },
      create: {
        code: c.code,
        name: c.name,
        description: c.name,
        teacherId: c.teacherId,
        color: c.color,
        type: c.type,
        hourCostPerStudent: c.hourCostPerStudent,
        maxStudents: c.studentIds.length || 1,
      },
    });
    createdCourses.push({ course, studentIds: c.studentIds });

    for (const studentId of c.studentIds) {
      await prisma.enrollment.upsert({
        where: { studentId_courseId: { studentId, courseId: course.id } },
        update: {},
        create: { studentId, courseId: course.id },
      });
    }
  }
  console.log(`${createdCourses.length} ders + kayıtlar oluşturuldu`);

  // ---------- LESSON SLOTS ----------
  const slotData = [
    { code: "MAT-CEM", day: DayOfWeek.MONDAY, start: "16:00", end: "17:00" },
    { code: "MAT-CEM", day: DayOfWeek.THURSDAY, start: "16:00", end: "17:00" },
    { code: "MAT-ELI", day: DayOfWeek.TUESDAY, start: "17:00", end: "18:00" },
    { code: "FIZ-DEN", day: DayOfWeek.WEDNESDAY, start: "18:00", end: "19:00" },
    { code: "ING-BUR", day: DayOfWeek.FRIDAY, start: "17:00", end: "18:00" },
    { code: "YKS-MAT", day: DayOfWeek.SATURDAY, start: "10:00", end: "12:00" },
    { code: "EDB-LIT", day: DayOfWeek.SUNDAY, start: "14:00", end: "16:00" },
  ];
  const slots = [];
  for (const s of slotData) {
    const course = createdCourses.find((c) => c.course.code === s.code)?.course;
    if (!course) continue;
    const slot = await prisma.lessonSlot.create({
      data: {
        courseId: course.id,
        dayOfWeek: s.day,
        startTime: s.start,
        endTime: s.end,
        recurringMeetingUrl: `https://meet.example.com/${course.code.toLowerCase()}`,
      },
    });
    slots.push({ slot, course });
  }
  console.log(`${slots.length} ders saati oluşturuldu`);

  // ---------- TOPICS (örnek müfredat) ----------
  const matTopics = ["Türev", "İntegral", "Limit", "Fonksiyonlar", "Logaritma"];
  const matCourses = createdCourses.filter((c) => c.course.code.startsWith("MAT"));
  for (const { course } of matCourses) {
    for (let i = 0; i < matTopics.length; i++) {
      await prisma.topic.create({
        data: { courseId: course.id, name: matTopics[i], order: i },
      });
    }
  }

  // ---------- HOLIDAYS ----------
  await prisma.holiday.createMany({
    data: [
      { date: dateOnly(new Date(new Date().getFullYear(), 9, 29)), name: "Cumhuriyet Bayramı", reason: "Resmi tatil" },
      { date: dateOnly(new Date(new Date().getFullYear(), 4, 19)), name: "19 Mayıs", reason: "Resmi tatil" },
    ],
    skipDuplicates: true,
  });

  // ---------- HOUR PACKAGES (peşin alımlar) ----------
  // Her aktif öğrenci için kendi dersine 10 saatlik paket
  for (const { course, studentIds } of createdCourses) {
    for (const studentId of studentIds) {
      const pkg = await prisma.hourPackage.create({
        data: {
          studentId,
          courseId: course.id,
          hoursPurchased: 10,
          pricePaid: 4000,
          paymentMethod: "Havale",
          createdById: admin.id,
        },
      });
      await prisma.hourLedgerEntry.create({
        data: {
          studentId,
          courseId: course.id,
          hours: 10,
          reason: HourLedgerReason.PURCHASE,
          packageId: pkg.id,
        },
      });
    }
  }
  console.log("Saat paketleri ve defter kayıtları oluşturuldu");

  // ---------- ÖRNEK GERÇEKLEŞEN DERSLER (DELIVERED) ----------
  // Son 3 hafta için, her bir slot için 1-2 ders DELIVERED işaretle.
  // Bu otomatik saat düşmesi + öğretmen hakedişi üretir.
  const now = new Date();
  for (const { slot, course } of slots) {
    const dayIdx = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"].indexOf(
      slot.dayOfWeek
    );

    for (let weeksAgo = 3; weeksAgo >= 1; weeksAgo--) {
      const target = new Date(now);
      target.setDate(now.getDate() - weeksAgo * 7);
      // O haftanın belirli gününü bul
      const offset = (dayIdx - target.getDay() + 7) % 7;
      target.setDate(target.getDate() + offset);
      target.setHours(0, 0, 0, 0);
      if (target > now) continue;

      const occ = await prisma.lessonOccurrence.create({
        data: {
          lessonSlotId: slot.id,
          date: target,
          status: LessonStatus.DELIVERED,
          durationHours: 1,
          deliveredAt: target,
          teacherNote: "Geçmiş ders kaydı",
        },
      });

      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: course.id },
      });
      const hourCost = Number(course.hourCostPerStudent);

      for (const en of enrollments) {
        await prisma.attendance.create({
          data: {
            occurrenceId: occ.id,
            studentId: en.studentId,
            isPresent: true,
          },
        });
        await prisma.hourLedgerEntry.create({
          data: {
            studentId: en.studentId,
            courseId: course.id,
            hours: -hourCost,
            reason: HourLedgerReason.LESSON_USED,
            occurrenceId: occ.id,
          },
        });
      }

      const rate = await prisma.teacherRate.findFirst({
        where: { teacherId: course.teacherId, courseType: course.type },
      });
      const hourlyRate = rate ? Number(rate.hourlyRate) : 400;
      await prisma.teacherEarning.create({
        data: {
          teacherId: course.teacherId,
          occurrenceId: occ.id,
          hours: 1,
          hourlyRate,
          amount: hourlyRate,
        },
      });
    }
  }
  console.log("Geçmiş ders kayıtları + hakediş + bakiye hareketleri oluşturuldu");

  // ---------- STREAKS ----------
  for (const student of students) {
    await prisma.streak.upsert({
      where: { userId: student.id },
      update: {},
      create: {
        userId: student.id,
        currentStreak: Math.floor(Math.random() * 7),
        longestStreak: Math.floor(Math.random() * 15) + 3,
        totalLessons: Math.floor(Math.random() * 30) + 5,
        lastActiveDate: new Date(),
      },
    });
  }

  // ---------- GOALS ----------
  const weekStart = startOfWeekMonday();
  await prisma.goal.create({
    data: {
      userId: students[0].id,
      title: "Bu hafta 3 derse katıl",
      targetPerWeek: 3,
      currentProgress: 2,
      weekStart,
    },
  });

  // ---------- ANNOUNCEMENTS ----------
  await prisma.announcement.createMany({
    data: [
      {
        title: "Yeni döneme hoş geldiniz",
        content: "Edunova üzerinden derslerinizi takip edebilirsiniz. Sorularınız için yöneticiye iletebilirsiniz.",
        isGlobal: true,
        authorId: admin.id,
      },
    ],
  });

  // ---------- NOTIFICATIONS (örnek) ----------
  await prisma.notification.create({
    data: {
      userId: students[0].id,
      type: NotificationType.GENERIC,
      title: "Edunova'ya hoş geldin",
      body: "Profilini güncelleyebilir, paket bakiyeni görebilirsin.",
    },
  });

  // ---------- TOPIC PROGRESS (örnek) ----------
  const cemMath = createdCourses.find((c) => c.course.code === "MAT-CEM")?.course;
  if (cemMath) {
    const topics = await prisma.topic.findMany({ where: { courseId: cemMath.id } });
    for (let i = 0; i < topics.length; i++) {
      await prisma.studentTopicProgress.create({
        data: {
          studentId: students[0].id,
          topicId: topics[i].id,
          status:
            i < 2
              ? TopicProgressStatus.MASTERED
              : i === 2
                ? TopicProgressStatus.IN_PROGRESS
                : TopicProgressStatus.NOT_STARTED,
          masteredAt: i < 2 ? new Date() : null,
        },
      });
    }
  }

  console.log("\n✅ Seed tamamlandı.");
  console.log("\nDemo hesaplar:");
  console.log("  Yönetici: admin@edunova.com / 123456");
  console.log("  Öğretmen: ogretmen@edunova.com / 123456");
  console.log("  Öğrenci:  ogrenci@edunova.com / 123456");
  console.log("  Veli:     veli1@edunova.com / 123456");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
