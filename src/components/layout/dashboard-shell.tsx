interface DashboardShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function DashboardShell({
  title,
  description,
  children,
  action,
}: DashboardShellProps) {
  return (
    <div className="flex-1 lg:ml-64">
      <div className="min-h-screen">
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-lg">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="ml-12 lg:ml-0 min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            {action && <div className="shrink-0 ml-4">{action}</div>}
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
