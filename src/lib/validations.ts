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
      .email("Geçerli bir e-posta adresi girin"),
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
  phone: z.string().optional(),
  bio: z.string().max(500, "Bio en fazla 500 karakter olabilir").optional(),
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
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
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
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
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
  isActive: z.boolean().default(true),
  studentIds: z.array(z.string()).default([]),
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
