"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Briefcase,
  Calendar,
  CalendarOff,
  ClipboardCheck,
  ClipboardList,
  Coins,
  FileText,
  FolderOpen,
  GraduationCap,
  Heart,
  History,
  Home,
  LogOut,
  Menu,
  Package,
  Settings,
  Target,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
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
  { items: [{ label: "Ana Sayfa", href: "/panel/ogrenci", icon: Home }] },
  {
    title: "Eğitim",
    items: [
      { label: "Ders Programı", href: "/panel/ogrenci/program", icon: Calendar },
      { label: "Derslerim", href: "/panel/ogrenci/dersler", icon: BookOpen },
      { label: "Ödevlerim", href: "/panel/ogrenci/odevler", icon: ClipboardList },
      { label: "Materyaller", href: "/panel/ogrenci/materyaller", icon: FolderOpen },
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
  { items: [{ label: "Ana Sayfa", href: "/panel/ogretmen", icon: Home }] },
  {
    title: "Yönetim",
    items: [
      { label: "Ders Programı", href: "/panel/ogretmen/program", icon: Calendar },
      { label: "Derslerim", href: "/panel/ogretmen/dersler", icon: BookOpen },
      { label: "Yoklama", href: "/panel/ogretmen/yoklama", icon: ClipboardCheck },
      { label: "Ödevler", href: "/panel/ogretmen/odevler", icon: ClipboardList },
      { label: "Materyaller", href: "/panel/ogretmen/materyaller", icon: FolderOpen },
      { label: "Öğrencilerim", href: "/panel/ogretmen/ogrenciler", icon: Users },
    ],
  },
  {
    title: "Finans",
    items: [
      { label: "Kazançlarım", href: "/panel/ogretmen/kazanclar", icon: Wallet },
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
  { items: [{ label: "Ana Sayfa", href: "/panel/yonetici", icon: Home }] },
  {
    title: "Kişiler",
    items: [
      { label: "Kullanıcılar", href: "/panel/yonetici/kullanicilar", icon: Users },
      { label: "Veliler", href: "/panel/yonetici/veliler", icon: Heart },
    ],
  },
  {
    title: "Eğitim",
    items: [
      { label: "Dersler", href: "/panel/yonetici/dersler", icon: BookOpen },
      { label: "Ders Programı", href: "/panel/yonetici/program", icon: Calendar },
      { label: "Müfredat", href: "/panel/yonetici/mufredat", icon: BookMarked },
      { label: "Tatiller", href: "/panel/yonetici/tatiller", icon: CalendarOff },
      { label: "Duyurular", href: "/panel/yonetici/duyurular", icon: Bell },
    ],
  },
  {
    title: "Finans",
    items: [
      { label: "Saat Paketleri", href: "/panel/yonetici/paketler", icon: Package },
      { label: "Öğretmen Hakediş", href: "/panel/yonetici/hakedis", icon: Coins },
      { label: "Öğretmen Ücretleri", href: "/panel/yonetici/ucretler", icon: Briefcase },
    ],
  },
  {
    title: "Analiz",
    items: [
      { label: "Hedefler", href: "/panel/yonetici/hedefler", icon: Target },
      { label: "İstatistikler", href: "/panel/yonetici/istatistikler", icon: BarChart3 },
      { label: "Denetim Kayıtları", href: "/panel/yonetici/denetim", icon: History },
      { label: "Ayarlar", href: "/panel/yonetici/ayarlar", icon: Settings },
    ],
  },
];

const parentGroups: SidebarGroup[] = [
  { items: [{ label: "Ana Sayfa", href: "/panel/veli", icon: Home }] },
  {
    title: "Çocuğum",
    items: [
      { label: "Bakiye & Paketler", href: "/panel/veli/bakiye", icon: Wallet },
      { label: "Ders Kayıtları", href: "/panel/veli/dersler", icon: BookOpen },
      { label: "Haftalık Özet", href: "/panel/veli/ozet", icon: FileText },
    ],
  },
  {
    title: "Diğer",
    items: [
      { label: "Duyurular", href: "/panel/veli/duyurular", icon: Bell },
      { label: "Profil", href: "/panel/veli/profil", icon: Settings },
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
    case "PARENT":
      return parentGroups;
    default:
      return [];
  }
}

const roleLabels: Record<string, string> = {
  STUDENT: "Öğrenci",
  TEACHER: "Öğretmen",
  ADMIN: "Yönetici",
  PARENT: "Veli",
};

const roleIcons: Record<string, LucideIcon> = {
  STUDENT: GraduationCap,
  TEACHER: BookOpen,
  ADMIN: UserCog,
  PARENT: Heart,
};

function rolePath(role: string): string {
  switch (role) {
    case "STUDENT":
      return "/panel/ogrenci";
    case "TEACHER":
      return "/panel/ogretmen";
    case "ADMIN":
      return "/panel/yonetici";
    case "PARENT":
      return "/panel/veli";
    default:
      return "/panel";
  }
}

export function Sidebar({ role, firstName, lastName, email }: SidebarProps) {
  const pathname = usePathname();
  const groups = getGroups(role);
  const [mobileOpen, setMobileOpen] = useState(false);

  const basePath = rolePath(role);
  const RoleIcon = roleIcons[role] ?? GraduationCap;

  // Mobil çekmece açıkken arka plan kaymasın
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-gradient-to-b from-card via-background to-background">
      {/* Marka */}
      <Link
        href={basePath}
        onClick={() => setMobileOpen(false)}
        className="group flex items-center gap-3 px-5 py-5"
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-primary/15 bg-white shadow-sm transition-transform duration-300 ease-premium group-hover:scale-105 dark:bg-white/95">
          <Image
            src="/logo.png"
            alt="Edunova"
            width={32}
            height={32}
            className="h-7 w-7 object-contain"
            priority
          />
        </span>
        <span className="min-w-0">
          <span className="block text-[17px] font-bold leading-none tracking-tight text-gradient">
            Edunova
          </span>
          <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {roleLabels[role] ?? "Panel"} paneli
          </span>
        </span>
      </Link>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <nav className="scrollbar-none flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className={cn(groupIdx > 0 && "mt-6")}>
            {group.title && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
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
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ease-premium",
                      isActive
                        ? "bg-gradient-to-r from-primary/14 to-primary/[0.04] text-primary shadow-xs"
                        : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                    )}
                  >
                    {/* Aktif göstergesi */}
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-all duration-300 ease-premium",
                        isActive ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Icon
                      className={cn(
                        "h-[17px] w-[17px] shrink-0 transition-all duration-200 ease-premium",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground/60 group-hover:translate-x-0.5 group-hover:text-foreground"
                      )}
                    />
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Kullanıcı */}
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-xl border bg-card p-2.5 shadow-xs">
          <Avatar firstName={firstName} lastName={lastName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-tight">
              {firstName} {lastName}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{email}</p>
          </div>
          <span
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            title={roleLabels[role]}
          >
            <RoleIcon className="h-3.5 w-3.5" />
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/giris" })}
          className="mt-1.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive"
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
        className="fixed left-4 top-3.5 z-40 inline-flex h-9 w-9 items-center justify-center rounded-xl border glass shadow-sm transition-transform duration-200 ease-premium active:scale-95 lg:hidden"
        aria-label="Menüyü aç"
      >
        <Menu className="h-[18px] w-[18px]" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 animate-fade-in bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[270px] transform border-r shadow-xl transition-transform duration-300 ease-premium lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-5 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Menüyü kapat"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
        {sidebarContent}
      </aside>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-r">
        {sidebarContent}
      </aside>
    </>
  );
}
