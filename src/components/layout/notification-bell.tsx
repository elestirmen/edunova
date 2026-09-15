"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  CalendarX2,
  Check,
  ClipboardCheck,
  ClipboardList,
  Coins,
  Megaphone,
  Sparkles,
  Wallet,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

const typeIcons: Record<string, { icon: LucideIcon; className: string }> = {
  ANNOUNCEMENT: { icon: Megaphone, className: "bg-ocean-500/12 text-ocean-600 dark:text-ocean-300" },
  LESSON_REMINDER: { icon: ClipboardCheck, className: "bg-brand-500/12 text-brand-600 dark:text-brand-300" },
  LESSON_CANCELLED: { icon: CalendarX2, className: "bg-rose-500/12 text-rose-600 dark:text-rose-300" },
  ASSIGNMENT_NEW: { icon: ClipboardList, className: "bg-violet-500/12 text-violet-600 dark:text-violet-300" },
  ASSIGNMENT_GRADED: { icon: Check, className: "bg-leaf-500/12 text-leaf-600 dark:text-leaf-300" },
  BALANCE_LOW: { icon: Wallet, className: "bg-amber-500/14 text-amber-600 dark:text-amber-300" },
  PACKAGE_PURCHASED: { icon: Coins, className: "bg-leaf-500/12 text-leaf-600 dark:text-leaf-300" },
  PAYOUT_READY: { icon: Coins, className: "bg-brand-500/12 text-brand-600 dark:text-brand-300" },
  GENERIC: { icon: Sparkles, className: "bg-muted text-muted-foreground" },
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setUnread(data.unread);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function markAll() {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setItems((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
    );
    setUnread(0);
  }

  async function markOne(id: string) {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setItems((prev) =>
      prev.map((n) =>
        n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n
      )
    );
    setUnread((u) => Math.max(0, u - 1));
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-all duration-200 ease-premium hover:border-border hover:bg-accent hover:text-foreground",
          open && "border-border bg-accent text-foreground"
        )}
        aria-label="Bildirimler"
        aria-expanded={open}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse-ring rounded-full bg-destructive" />
            <span className="tabular absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
              {unread > 9 ? "9+" : unread}
            </span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] origin-top-right animate-slide-down overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-semibold tracking-tight">Bildirimler</p>
              <p className="text-[11px] text-muted-foreground">
                {unread > 0 ? `${unread} okunmamış bildirim` : "Hepsi okundu"}
              </p>
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <Check className="h-3 w-3" /> Tümünü okundu işaretle
              </button>
            )}
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="space-y-3 p-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="skeleton h-9 w-9 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-2/3" />
                      <div className="skeleton h-2.5 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <span className="rounded-xl bg-muted p-2.5 text-muted-foreground">
                  <BellOff className="h-5 w-5" />
                </span>
                <p className="text-xs text-muted-foreground">Henüz bildirim yok.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/70">
                {items.map((n) => (
                  <li key={n.id}>
                    {n.link ? (
                      <Link
                        href={n.link}
                        onClick={() => {
                          if (!n.readAt) markOne(n.id);
                          setOpen(false);
                        }}
                        className={cn(
                          "block px-4 py-3 transition-colors hover:bg-accent/60",
                          !n.readAt && "bg-primary/[0.06]"
                        )}
                      >
                        <NotificationRow item={n} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => !n.readAt && markOne(n.id)}
                        className={cn(
                          "block w-full px-4 py-3 text-left transition-colors hover:bg-accent/60",
                          !n.readAt && "bg-primary/[0.06]"
                        )}
                      >
                        <NotificationRow item={n} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const meta = typeIcons[item.type] ?? typeIcons.GENERIC;
  const Icon = meta.icon;

  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          meta.className
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 truncate text-[13px] font-semibold">{item.title}</p>
          {!item.readAt && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        {item.body && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {item.body}
          </p>
        )}
        <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
          {formatRelativeTime(item.createdAt)}
        </p>
      </div>
    </div>
  );
}
