import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    STUDENT: "Öğrenci",
    TEACHER: "Öğretmen",
    ADMIN: "Yönetici",
    PARENT: "Veli",
  };
  return labels[role] || role;
}

export function getRoleDashboardPath(role: string): string {
  const paths: Record<string, string> = {
    STUDENT: "/panel/ogrenci",
    TEACHER: "/panel/ogretmen",
    ADMIN: "/panel/yonetici",
    PARENT: "/panel/veli",
  };
  return paths[role] || "/panel";
}

export function getDayLabel(day: string): string {
  const days: Record<string, string> = {
    MONDAY: "Pazartesi",
    TUESDAY: "Salı",
    WEDNESDAY: "Çarşamba",
    THURSDAY: "Perşembe",
    FRIDAY: "Cuma",
    SATURDAY: "Cumartesi",
    SUNDAY: "Pazar",
  };
  return days[day] || day;
}

export function getDayShortLabel(day: string): string {
  const days: Record<string, string> = {
    MONDAY: "Pzt",
    TUESDAY: "Sal",
    WEDNESDAY: "Çar",
    THURSDAY: "Per",
    FRIDAY: "Cum",
    SATURDAY: "Cmt",
    SUNDAY: "Paz",
  };
  return days[day] || day;
}

export function getDayOrder(day: string): number {
  const order: Record<string, number> = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 7,
  };
  return order[day] || 8;
}

export function getTodayDayOfWeek(): string {
  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return days[new Date().getDay()];
}

export function dayOfWeekFromDate(date: Date): string {
  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return days[date.getDay()];
}

export function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 6) return { text: "İyi geceler", emoji: "🌙" };
  if (hour < 12) return { text: "Günaydın", emoji: "☀️" };
  if (hour < 18) return { text: "İyi günler", emoji: "👋" };
  if (hour < 22) return { text: "İyi akşamlar", emoji: "🌆" };
  return { text: "İyi geceler", emoji: "🌙" };
}

export function getMotivationalMessage(streak: number): string {
  if (streak === 0)
    return "Bugün harika bir gün başlamak için. İlk adımı at.";
  if (streak < 3) return `${streak} günlük seri. Devam et.`;
  if (streak < 7) return `${streak} gün üst üste. Güzel tempo.`;
  if (streak < 14) return `${streak} günlük seri. Disiplin görünüyor.`;
  if (streak < 30) return `${streak} gün. Çok iyi gidiyorsun.`;
  return `${streak} günlük seri. Olağanüstü.`;
}

// Eski sayfalardan kalan referanslar için emoji boş döndürür (sade UI tercihi)
export function getStreakEmoji(): string {
  return "";
}

export function getStreakTitle(streak: number): string {
  if (streak === 0) return "Başla";
  if (streak < 3) return "Ateşli";
  if (streak < 7) return "Süper";
  if (streak < 14) return "Efsane";
  if (streak < 30) return "Durdurulamaz";
  return "Efsane";
}

export function formatTime(time: string): string {
  // "HH:mm" formatına normalize et
  const m = time.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return time;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatHours(hours: number | string | null | undefined): string {
  if (hours === null || hours === undefined) return "0 saat";
  const n = typeof hours === "string" ? parseFloat(hours) : hours;
  if (Number.isNaN(n)) return "0 saat";
  return `${n.toFixed(1)} saat`;
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("tr-TR");
}

export function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function startOfMonth(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
}

export function startOfWeek(d: Date = new Date()): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday as start
  const r = new Date(d);
  r.setDate(d.getDate() + diff);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function endOfWeek(d: Date = new Date()): Date {
  const s = startOfWeek(d);
  const r = new Date(s);
  r.setDate(s.getDate() + 7);
  return r;
}

export function startOfDay(d: Date = new Date()): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function endOfDay(d: Date = new Date()): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}
