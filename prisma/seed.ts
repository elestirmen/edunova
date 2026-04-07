import { PrismaClient, DayOfWeek } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("123456", 12);

  // Admin
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
  console.log("Admin created:", admin.email);

  // Teachers
  const teacher1 = await prisma.user.upsert({
    where: { email: "ogretmen@edunova.com" },
    update: {},
    create: {
      email: "ogretmen@edunova.com",
      firstName: "Mehmet",
      lastName: "Kaya",
      passwordHash,
      role: "TEACHER",
      bio: "10 yıllık matematik öğretmeni",
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: "zeynep@edunova.com" },
    update: {},
    create: {
      email: "zeynep@edunova.com",
      firstName: "Zeynep",
      lastName: "Demir",
      passwordHash,
      role: "TEACHER",
      bio: "Fizik ve fen bilimleri öğretmeni",
    },
  });

  const teacher3 = await prisma.user.upsert({
    where: { email: "ali@edunova.com" },
    update: {},
    create: {
      email: "ali@edunova.com",
      firstName: "Ali",
      lastName: "Çelik",
      passwordHash,
      role: "TEACHER",
      bio: "İngilizce öğretmeni, Cambridge sertifikalı",
    },
  });
  console.log("Teachers created");

  // Students
  const student1 = await prisma.user.upsert({
    where: { email: "ogrenci@edunova.com" },
    update: {},
    create: {
      email: "ogrenci@edunova.com",
      firstName: "Cem",
      lastName: "Arslan",
      passwordHash,
      role: "STUDENT",
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "elif@edunova.com" },
    update: {},
    create: {
      email: "elif@edunova.com",
      firstName: "Elif",
      lastName: "Şahin",
      passwordHash,
      role: "STUDENT",
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: "burak@edunova.com" },
    update: {},
    create: {
      email: "burak@edunova.com",
      firstName: "Burak",
      lastName: "Öztürk",
      passwordHash,
      role: "STUDENT",
    },
  });

  const student4 = await prisma.user.upsert({
    where: { email: "selin@edunova.com" },
    update: {},
    create: {
      email: "selin@edunova.com",
      firstName: "Selin",
      lastName: "Aydın",
      passwordHash,
      role: "STUDENT",
    },
  });

  const student5 = await prisma.user.upsert({
    where: { email: "emre@edunova.com" },
    update: {},
    create: {
      email: "emre@edunova.com",
      firstName: "Emre",
      lastName: "Koç",
      passwordHash,
      role: "STUDENT",
    },
  });
  console.log("Students created");

  const students = [student1, student2, student3, student4, student5];

  // Courses
  const mathCourse = await prisma.course.upsert({
    where: { code: "MAT101" },
    update: {},
    create: {
      name: "Matematik",
      code: "MAT101",
      description: "Temel matematik ve problem çözme becerileri",
      color: "#6366f1",
      teacherId: teacher1.id,
    },
  });

  const physicsCourse = await prisma.course.upsert({
    where: { code: "FIZ101" },
    update: {},
    create: {
      name: "Fizik",
      code: "FIZ101",
      description: "Temel fizik kanunları ve uygulamaları",
      color: "#f59e0b",
      teacherId: teacher2.id,
    },
  });

  const englishCourse = await prisma.course.upsert({
    where: { code: "ING101" },
    update: {},
    create: {
      name: "İngilizce",
      code: "ING101",
      description: "İngilizce dil bilgisi ve konuşma pratiği",
      color: "#10b981",
      teacherId: teacher3.id,
    },
  });

  const chemistryCourse = await prisma.course.upsert({
    where: { code: "KIM101" },
    update: {},
    create: {
      name: "Kimya",
      code: "KIM101",
      description: "Genel kimya ve laboratuvar uygulamaları",
      color: "#ef4444",
      teacherId: teacher2.id,
    },
  });

  const geometryCourse = await prisma.course.upsert({
    where: { code: "GEO101" },
    update: {},
    create: {
      name: "Geometri",
      code: "GEO101",
      description: "Düzlem ve uzay geometri",
      color: "#8b5cf6",
      teacherId: teacher1.id,
    },
  });
  console.log("Courses created");

  const courses = [mathCourse, physicsCourse, englishCourse, chemistryCourse, geometryCourse];

  // Lesson Slots
  const lessonSlots = [
    { courseId: mathCourse.id, dayOfWeek: "MONDAY" as DayOfWeek, startTime: "09:00", endTime: "10:30", room: "A-101" },
    { courseId: mathCourse.id, dayOfWeek: "WEDNESDAY" as DayOfWeek, startTime: "09:00", endTime: "10:30", room: "A-101" },
    { courseId: mathCourse.id, dayOfWeek: "FRIDAY" as DayOfWeek, startTime: "09:00", endTime: "10:30", room: "A-101" },
    { courseId: physicsCourse.id, dayOfWeek: "MONDAY" as DayOfWeek, startTime: "11:00", endTime: "12:30", room: "B-202" },
    { courseId: physicsCourse.id, dayOfWeek: "THURSDAY" as DayOfWeek, startTime: "11:00", endTime: "12:30", room: "B-202" },
    { courseId: englishCourse.id, dayOfWeek: "TUESDAY" as DayOfWeek, startTime: "09:00", endTime: "10:30", room: "C-303" },
    { courseId: englishCourse.id, dayOfWeek: "THURSDAY" as DayOfWeek, startTime: "09:00", endTime: "10:30", room: "C-303" },
    { courseId: chemistryCourse.id, dayOfWeek: "TUESDAY" as DayOfWeek, startTime: "13:00", endTime: "14:30", room: "Lab-1" },
    { courseId: chemistryCourse.id, dayOfWeek: "FRIDAY" as DayOfWeek, startTime: "13:00", endTime: "14:30", room: "Lab-1" },
    { courseId: geometryCourse.id, dayOfWeek: "WEDNESDAY" as DayOfWeek, startTime: "11:00", endTime: "12:30", room: "A-102" },
    { courseId: geometryCourse.id, dayOfWeek: "FRIDAY" as DayOfWeek, startTime: "11:00", endTime: "12:30", room: "A-102" },
  ];

  for (const slot of lessonSlots) {
    await prisma.lessonSlot.create({ data: slot });
  }
  console.log("Lesson slots created");

  // Enrollments — enroll all students in math, physics, english. Some in chemistry and geometry.
  for (const student of students) {
    for (const course of [mathCourse, physicsCourse, englishCourse]) {
      await prisma.enrollment.upsert({
        where: {
          studentId_courseId: { studentId: student.id, courseId: course.id },
        },
        update: {},
        create: { studentId: student.id, courseId: course.id },
      });
    }
  }

  for (const student of [student1, student2, student3]) {
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: { studentId: student.id, courseId: chemistryCourse.id },
      },
      update: {},
      create: { studentId: student.id, courseId: chemistryCourse.id },
    });
  }

  for (const student of [student1, student4, student5]) {
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: { studentId: student.id, courseId: geometryCourse.id },
      },
      update: {},
      create: { studentId: student.id, courseId: geometryCourse.id },
    });
  }
  console.log("Enrollments created");

  // Streaks
  for (const student of students) {
    const streakData = {
      [student1.id]: { currentStreak: 12, longestStreak: 15, totalLessons: 47 },
      [student2.id]: { currentStreak: 5, longestStreak: 8, totalLessons: 32 },
      [student3.id]: { currentStreak: 0, longestStreak: 3, totalLessons: 18 },
      [student4.id]: { currentStreak: 7, longestStreak: 7, totalLessons: 25 },
      [student5.id]: { currentStreak: 3, longestStreak: 10, totalLessons: 38 },
    };

    const data = streakData[student.id] || {
      currentStreak: 0,
      longestStreak: 0,
      totalLessons: 0,
    };

    await prisma.streak.upsert({
      where: { userId: student.id },
      update: data,
      create: {
        userId: student.id,
        ...data,
        lastActiveDate: new Date(),
      },
    });
  }
  console.log("Streaks created");

  // Goals
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  await prisma.goal.create({
    data: {
      userId: student1.id,
      title: "Bu hafta 5 derse katıl",
      targetPerWeek: 5,
      currentProgress: 4,
      weekStart,
    },
  });

  await prisma.goal.create({
    data: {
      userId: student2.id,
      title: "Haftada 4 ders hedefi",
      targetPerWeek: 4,
      currentProgress: 2,
      weekStart,
    },
  });
  console.log("Goals created");

  // Announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: "Edunova'ya Hoş Geldiniz!",
        content:
          "Yeni eğitim platformumuz Edunova artık aktif! Ders programlarınızı takip edebilir, ilerlemelerinizi görebilir ve hedefler belirleyebilirsiniz. Hepinize başarılı bir dönem diliyoruz.",
        isGlobal: true,
        authorId: admin.id,
      },
      {
        title: "Matematik Sınav Tarihi Açıklandı",
        content:
          "Değerli öğrenciler, matematik ara sınavı 15 Mayıs Perşembe günü saat 10:00'da A-101 salonunda yapılacaktır. Konu kapsamı: Türev ve integral. Çalışmalarınıza şimdiden başlamanızı öneririm.",
        isGlobal: false,
        courseId: mathCourse.id,
        authorId: teacher1.id,
      },
      {
        title: "Fizik Laboratuvar Kuralları",
        content:
          "Laboratuvar derslerine önlük ve koruyucu gözlük ile gelinmesi zorunludur. Güvenlik kurallarına uymayanlar derse alınmayacaktır. Lütfen laboratuvar kılavuzunu okuyunuz.",
        isGlobal: false,
        courseId: physicsCourse.id,
        authorId: teacher2.id,
      },
      {
        title: "İngilizce Konuşma Kulübü",
        content:
          "Her Cuma saat 15:00-16:00 arasında İngilizce konuşma kulübümüz toplanacaktır. Katılım isteğe bağlıdır ancak konuşma pratiği için harika bir fırsat. Herkesi bekliyoruz!",
        isGlobal: false,
        courseId: englishCourse.id,
        authorId: teacher3.id,
      },
      {
        title: "Dönem Sonu Değerlendirmesi",
        content:
          "Dönem sonu değerlendirmeleri Haziran ayının ilk haftasında yapılacaktır. Detaylı program yakında paylaşılacaktır. Tüm öğrencilerimize başarılar diliyoruz.",
        isGlobal: true,
        authorId: admin.id,
      },
    ],
  });
  console.log("Announcements created");

  // Attendance records (sample)
  const allSlots = await prisma.lessonSlot.findMany();
  const dates = [
    new Date("2025-04-01"),
    new Date("2025-04-02"),
    new Date("2025-04-03"),
    new Date("2025-04-04"),
  ];

  for (const student of [student1, student2]) {
    for (const date of dates) {
      const slotsForDay = allSlots.filter(
        (s) =>
          s.dayOfWeek ===
          ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][date.getDay()]
      );
      for (const slot of slotsForDay) {
        const enrolled = await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: { studentId: student.id, courseId: slot.courseId },
          },
        });
        if (enrolled) {
          await prisma.attendance.upsert({
            where: {
              studentId_lessonSlotId_date: {
                studentId: student.id,
                lessonSlotId: slot.id,
                date,
              },
            },
            update: {},
            create: {
              studentId: student.id,
              lessonSlotId: slot.id,
              date,
              isPresent: Math.random() > 0.15,
            },
          });
        }
      }
    }
  }
  console.log("Attendance records created");

  console.log("\n✅ Seed complete!");
  console.log("\nDemo Accounts:");
  console.log("  Öğrenci: ogrenci@edunova.com / 123456");
  console.log("  Öğretmen: ogretmen@edunova.com / 123456");
  console.log("  Yönetici: admin@edunova.com / 123456");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
