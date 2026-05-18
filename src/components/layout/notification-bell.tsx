"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

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
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
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
        n.id === id && !n.readAt
          ? { ...n, readAt: new Date().toISOString() }
          : n
      )
    );
    setUnread((u) => Math.max(0, u - 1));
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 hover:bg-accent transition-colors"
        aria-label="Bildirimler"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border bg-popover text-popover-foreground shadow-lg z-50">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <p className="text-sm font-semibold">Bildirimler</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Check className="h-3 w-3" /> Tümünü okundu işaretle
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Yükleniyor…
              </div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Henüz bildirim yok.
              </div>
            ) : (
              <ul className="divide-y">
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
                          "block px-3 py-2.5 hover:bg-accent",
                          !n.readAt && "bg-primary/5"
                        )}
                      >
                        <NotificationRow item={n} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => !n.readAt && markOne(n.id)}
                        className={cn(
                          "block w-full text-left px-3 py-2.5 hover:bg-accent",
                          !n.readAt && "bg-primary/5"
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
  return (
    <div className="flex items-start gap-2">
      {!item.readAt && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
      <div className={cn("min-w-0 flex-1", item.readAt && "pl-4")}>
        <p className="truncate text-sm font-medium">{item.title}</p>
        {item.body && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {item.body}
          </p>
        )}
        <p className="mt-1 text-[10px] text-muted-foreground">
          {formatDateTime(item.createdAt)}
        </p>
      </div>
    </div>
  );
}
