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
  };
  return labels[role] || role;
}

export function getRoleDashboardPath(role: string): string {
  const paths: Record<string, string> = {
    STUDENT: "/panel/ogrenci",
    TEACHER: "/panel/ogretmen",
    ADMIN: "/panel/yonetici",
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
    return "Bugün harika bir gün başlamak için! İlk adımı at 💪";
  if (streak < 3) return `${streak} günlük seri! Devam et, harika gidiyorsun 🔥`;
  if (streak < 7)
    return `${streak} gün üst üste! Muhteşem bir tempo 🚀`;
  if (streak < 14)
    return `${streak} günlük seri! Şampiyon gibi çalışıyorsun 🏆`;
  if (streak < 30) return `${streak} gün! İnanılmaz disiplin 💎`;
  return `${streak} günlük seri! Sen bir efsanesin! 👑`;
}

export function getStreakEmoji(streak: number): string {
  if (streak === 0) return "😴";
  if (streak < 3) return "🔥";
  if (streak < 7) return "⚡";
  if (streak < 14) return "🚀";
  if (streak < 30) return "💎";
  return "👑";
}

export function getStreakTitle(streak: number): string {
  if (streak === 0) return "Başla!";
  if (streak < 3) return "Ateşli!";
  if (streak < 7) return "Süper!";
  if (streak < 14) return "Efsane!";
  if (streak < 30) return "Durdurulamaz!";
  return "Efsane!";
}

export function formatTime(time: string): string {
  return time;
}
