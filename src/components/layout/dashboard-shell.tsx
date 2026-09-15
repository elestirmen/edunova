import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  /** Başlığın üstünde görünen küçük bağlam etiketi (ör. "Finans"). */
  eyebrow?: string;
  /** İçerik genişliği: geniş tablolar için "full". */
  width?: "default" | "full";
}

export function DashboardShell({
  title,
  description,
  children,
  action,
  eyebrow,
  width = "default",
}: DashboardShellProps) {
  return (
    <div className="flex-1 lg:ml-64">
      <div className="relative min-h-screen">
        {/* Sayfa arka planı — çok hafif marka halesi */}
        <div className="pointer-events-none fixed inset-0 -z-10 aurora opacity-40 dark:opacity-30" />

        <header className="sticky top-0 z-30 border-b glass">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="ml-12 min-w-0 lg:ml-0">
              {eyebrow && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/80">
                  {eyebrow}
                </p>
              )}
              <h1 className="truncate text-[17px] font-semibold leading-tight tracking-tight sm:text-lg">
                {title}
              </h1>
              {description && (
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {action}
              <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
        </header>

        <main
          className={cn(
            "animate-fade-up px-4 py-6 sm:px-6 sm:py-8 lg:px-8",
            width === "default" && "mx-auto max-w-[1400px]"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
