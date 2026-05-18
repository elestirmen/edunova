import { z } from "zod";

const optionalTrimmedString = (max: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    },
    z.string().max(max).optional()
  );

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta gerekli")
    .email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Ad en az 2 karakter olmalı")
      .max(50, "Ad en fazla 50 karakter olabilir"),
    lastName: z
      .string()
      .min(2, "Soyad en az 2 karakter olmalı")
      .max(50, "Soyad en fazla 50 karakter olabilir"),
    email: z
      .string()
      .min(1, "E-posta gerekli")
      .email("Geçerli bir e-posta adresi girin")
      .transform((v) => v.toLowerCase()),
    password: z
      .string()
      .min(6, "Şifre en az 6 karakter olmalı")
      .max(100, "Şifre en fazla 100 karakter olabilir"),
    confirmPassword: z.string().min(1, "Şifre tekrarı gerekli"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Ad en az 2 karakter olmalı")
    .max(50, "Ad en fazla 50 karakter olabilir"),
  lastName: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalı")
    .max(50, "Soyad en fazla 50 karakter olabilir"),
  phone: optionalTrimmedString(30),
  bio: optionalTrimmedString(500),
});

export const courseSchema = z.object({
  name: z
    .string()
    .min(2, "Ders adı en az 2 karakter olmalı")
    .max(100, "Ders adı en fazla 100 karakter olabilir"),
  code: z
    .string()
    .min(2, "Ders kodu en az 2 karakter olmalı")
    .max(20, "Ders kodu en fazla 20 karakter olabilir"),
  description: z
    .string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .optional(),
  color: z.string().optional(),
  teacherId: z.string().min(1, "Öğretmen seçimi gerekli"),
});

export const lessonSlotSchema = z.object({
  courseId: z.string().min(1, "Ders seçimi gerekli"),
  dayOfWeek: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),
  startTime: z.string().min(1, "Başlangıç saati gerekli"),
  endTime: z.string().min(1, "Bitiş saati gerekli"),
  room: optionalTrimmedString(100),
}).refine((data) => data.startTime < data.endTime, {
  message: "Bitiş saati başlangıç saatinden sonra olmalı",
  path: ["endTime"],
});

export const announcementSchema = z.object({
  title: z
    .string()
    .min(2, "Başlık en az 2 karakter olmalı")
    .max(200, "Başlık en fazla 200 karakter olabilir"),
  content: z
    .string()
    .min(10, "İçerik en az 10 karakter olmalı")
    .max(2000, "İçerik en fazla 2000 karakter olabilir"),
  isGlobal: z.boolean().default(false),
  courseId: optionalTrimmedString(255),
}).refine((data) => data.isGlobal || Boolean(data.courseId), {
  message: "Derse özel duyuru için ders seçimi gerekli",
  path: ["courseId"],
});

export const adminUserCreateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Ad en az 2 karakter olmalı")
    .max(50, "Ad en fazla 50 karakter olabilir"),
  lastName: z
    .string()
    .trim()
    .min(2, "Soyad en az 2 karakter olmalı")
    .max(50, "Soyad en fazla 50 karakter olabilir"),
  email: z
    .string()
    .trim()
    .min(1, "E-posta gerekli")
    .email("Geçerli bir e-posta adresi girin")
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(6, "Şifre en az 6 karakter olmalı")
    .max(100, "Şifre en fazla 100 karakter olabilir"),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN", "PARENT"]),
  phone: optionalTrimmedString(30),
  bio: optionalTrimmedString(500),
  isActive: z.boolean().default(true),
});

export const adminUserUpdateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Ad en az 2 karakter olmalı")
    .max(50, "Ad en fazla 50 karakter olabilir"),
  lastName: z
    .string()
    .trim()
    .min(2, "Soyad en az 2 karakter olmalı")
    .max(50, "Soyad en fazla 50 karakter olabilir"),
  email: z
    .string()
    .trim()
    .min(1, "E-posta gerekli")
    .email("Geçerli bir e-posta adresi girin")
    .transform((value) => value.toLowerCase()),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN", "PARENT"]),
  phone: optionalTrimmedString(30),
  bio: optionalTrimmedString(500),
  isActive: z.boolean(),
  password: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    },
    z
      .string()
      .min(6, "Yeni şifre en az 6 karakter olmalı")
      .max(100, "Yeni şifre en fazla 100 karakter olabilir")
      .optional()
  ),
});

export const adminCourseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ders adı en az 2 karakter olmalı")
    .max(100, "Ders adı en fazla 100 karakter olabilir"),
  code: z
    .string()
    .trim()
    .min(2, "Ders kodu en az 2 karakter olmalı")
    .max(20, "Ders kodu en fazla 20 karakter olabilir")
    .transform((value) => value.toUpperCase()),
  description: optionalTrimmedString(500),
  color: z
    .string()
    .trim()
    .regex(/^#([A-Fa-f0-9]{6})$/, "Geçerli bir renk kodu girin")
    .default("#6366F1"),
  teacherId: z.string().min(1, "Öğretmen seçimi gerekli"),
  type: z.enum(["INDIVIDUAL", "GROUP"]).default("INDIVIDUAL"),
  maxStudents: z.coerce.number().int().min(1).max(20).default(1),
  hourCostPerStudent: z.coerce.number().min(0.1).max(2).default(1.0),
  isActive: z.boolean().default(true),
  studentIds: z.array(z.string()).default([]),
});

export const hourPackageSchema = z.object({
  studentId: z.string().min(1, "Öğrenci seçimi gerekli"),
  courseId: z.string().min(1, "Ders seçimi gerekli"),
  hoursPurchased: z.coerce.number().min(0.5, "En az 0.5 saat").max(1000),
  pricePaid: z.coerce.number().min(0).max(1000000),
  paymentMethod: optionalTrimmedString(50),
  note: optionalTrimmedString(500),
});

export const teacherRateSchema = z.object({
  teacherId: z.string().min(1, "Öğretmen gerekli"),
  courseType: z.enum(["INDIVIDUAL", "GROUP"]),
  hourlyRate: z.coerce.number().min(0).max(100000),
  effectiveFrom: z.coerce.date().optional(),
});

export const holidaySchema = z.object({
  date: z.coerce.date(),
  name: z.string().trim().min(2).max(100),
  reason: optionalTrimmedString(500),
});

export const topicSchema = z.object({
  courseId: z.string().min(1),
  name: z.string().trim().min(1).max(200),
  parentId: optionalTrimmedString(255),
  order: z.coerce.number().int().default(0),
});

export const materialSchema = z.object({
  courseId: z.string().min(1),
  topicId: optionalTrimmedString(255),
  title: z.string().trim().min(1).max(200),
  description: optionalTrimmedString(1000),
  type: z.enum(["PDF", "LINK", "VIDEO", "IMAGE", "OTHER"]).default("LINK"),
  url: z.string().trim().url("Geçerli bir URL girin"),
});

export const assignmentSchema = z.object({
  courseId: z.string().min(1),
  topicId: optionalTrimmedString(255),
  title: z.string().trim().min(2).max(200),
  description: optionalTrimmedString(5000),
  dueDate: z.coerce.date().optional(),
  maxGrade: z.coerce.number().int().min(1).max(1000).default(100),
});

export const submissionGradeSchema = z.object({
  grade: z.coerce.number().int().min(0).max(1000),
  feedback: optionalTrimmedString(2000),
});

export const submissionAnswerSchema = z.object({
  textAnswer: optionalTrimmedString(10000),
  fileUrl: optionalTrimmedString(500),
});

export const selfGoalSchema = z.object({
  title: z.string().trim().min(2).max(200),
  targetPerWeek: z.coerce.number().int().min(1).max(50),
});

export const deliverLessonSchema = z.object({
  occurrenceId: z.string().optional(),
  lessonSlotId: z.string().optional(),
  date: z.coerce.date(),
  teacherNote: optionalTrimmedString(5000),
  durationHours: z.coerce.number().min(0.25).max(12).optional(),
  topicIds: z.array(z.string()).optional(),
  attendanceMap: z.record(z.string(), z.boolean()).optional(),
});

export const cancelLessonSchema = z.object({
  occurrenceId: z.string().optional(),
  lessonSlotId: z.string().optional(),
  date: z.coerce.date().optional(),
  reason: z.string().trim().min(2).max(500),
});

export const parentLinkSchema = z.object({
  parentId: z.string().min(1),
  studentId: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type LessonSlotInput = z.infer<typeof lessonSlotSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type AdminUserCreateInput = z.infer<typeof adminUserCreateSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
export type AdminCourseInput = z.infer<typeof adminCourseSchema>;
export type HourPackageInput = z.infer<typeof hourPackageSchema>;
export type TeacherRateInput = z.infer<typeof teacherRateSchema>;
export type HolidayInput = z.infer<typeof holidaySchema>;
export type TopicInput = z.infer<typeof topicSchema>;
export type MaterialInput = z.infer<typeof materialSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type SubmissionGradeInput = z.infer<typeof submissionGradeSchema>;
export type SubmissionAnswerInput = z.infer<typeof submissionAnswerSchema>;
export type SelfGoalInput = z.infer<typeof selfGoalSchema>;
export type DeliverLessonInput = z.infer<typeof deliverLessonSchema>;
export type CancelLessonInput = z.infer<typeof cancelLessonSchema>;
export type ParentLinkInput = z.infer<typeof parentLinkSchema>;
