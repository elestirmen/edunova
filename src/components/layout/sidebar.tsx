"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Settings,
  Target,
  TrendingUp,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import type { LucideIcon } from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarGroup {
  title?: string;
  items: SidebarItem[];
}

interface SidebarProps {
  role: string;
  firstName: string;
  lastName: string;
  email: string;
}

const studentGroups: SidebarGroup[] = [
  {
    items: [
      { label: "Ana Sayfa", href: "/panel/ogrenci", icon: Home },
    ],
  },
  {
    title: "Eğitim",
    items: [
      { label: "Ders Programı", href: "/panel/ogrenci/program", icon: Calendar },
      { label: "Derslerim", href: "/panel/ogrenci/dersler", icon: BookOpen },
      { label: "İlerleme", href: "/panel/ogrenci/ilerleme", icon: TrendingUp },
      { label: "Hedeflerim", href: "/panel/ogrenci/hedefler", icon: Target },
    ],
  },
  {
    title: "Diğer",
    items: [
      { label: "Duyurular", href: "/panel/ogrenci/duyurular", icon: Bell },
      { label: "Profil", href: "/panel/ogrenci/profil", icon: Settings },
    ],
  },
];

const teacherGroups: SidebarGroup[] = [
  {
    items: [
      { label: "Ana Sayfa", href: "/panel/ogretmen", icon: Home },
    ],
  },
  {
    title: "Yönetim",
    items: [
      { label: "Ders Programı", href: "/panel/ogretmen/program", icon: Calendar },
      { label: "Derslerim", href: "/panel/ogretmen/dersler", icon: BookOpen },
      { label: "Öğrencilerim", href: "/panel/ogretmen/ogrenciler", icon: Users },
    ],
  },
  {
    title: "Diğer",
    items: [
      { label: "Duyurular", href: "/panel/ogretmen/duyurular", icon: Bell },
      { label: "Profil", href: "/panel/ogretmen/profil", icon: Settings },
    ],
  },
];

const adminGroups: SidebarGroup[] = [
  {
    items: [
      { label: "Ana Sayfa", href: "/panel/yonetici", icon: Home },
    ],
  },
  {
    title: "Yönetim",
    items: [
      { label: "Kullanıcılar", href: "/panel/yonetici/kullanicilar", icon: Users },
      { label: "Dersler", href: "/panel/yonetici/dersler", icon: BookOpen },
      { label: "Ders Programı", href: "/panel/yonetici/program", icon: Calendar },
      { label: "Duyurular", href: "/panel/yonetici/duyurular", icon: Bell },
    ],
  },
  {
    title: "Analiz",
    items: [
      { label: "İstatistikler", href: "/panel/yonetici/istatistikler", icon: BarChart3 },
      { label: "Ayarlar", href: "/panel/yonetici/ayarlar", icon: Settings },
    ],
  },
];

function getGroups(role: string): SidebarGroup[] {
  switch (role) {
    case "STUDENT":
      return studentGroups;
    case "TEACHER":
      return teacherGroups;
    case "ADMIN":
      return adminGroups;
    default:
      return [];
  }
}

const roleLabels: Record<string, string> = {
  STUDENT: "Öğrenci",
  TEACHER: "Öğretmen",
  ADMIN: "Yönetici",
};

const roleIcons: Record<string, LucideIcon> = {
  STUDENT: GraduationCap,
  TEACHER: BookOpen,
  ADMIN: UserCog,
};

export function Sidebar({ role, firstName, lastName }: SidebarProps) {
  const pathname = usePathname();
  const groups = getGroups(role);
  const [mobileOpen, setMobileOpen] = useState(false);

  const basePath = `/panel/${role === "STUDENT" ? "ogrenci" : role === "TEACHER" ? "ogretmen" : "yonetici"}`;
  const RoleIcon = roleIcons[role] ?? GraduationCap;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Image src="/logo.png" alt="Edunova" width={36} height={36} className="h-9 w-9 object-contain" />
        <span className="text-lg font-extrabold text-gradient">Edunova</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-2">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className={cn(groupIdx > 0 && "mt-5")}>
            {group.title && (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== basePath && pathname.startsWith(link.href));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                    )} />
                    {link.label}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
          <Avatar firstName={firstName} lastName={lastName} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              {firstName} {lastName}
            </p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <RoleIcon className="h-3 w-3" />
              {roleLabels[role]}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/giris" })}
          className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border bg-background p-2 shadow-md lg:hidden"
        aria-label="Menüyü aç"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-background transition-transform duration-300 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-5 rounded-lg p-1 hover:bg-accent"
          aria-label="Menüyü kapat"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-background">
        {sidebarContent}
      </aside>
    </>
  );
}
