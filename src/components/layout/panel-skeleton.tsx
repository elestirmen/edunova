import { Skeleton } from "@/components/ui/skeleton";

/** Panel sayfaları için ortak yükleme iskeleti — düzen kaymasını önler. */
export function PanelSkeleton() {
  return (
    <div className="flex-1 lg:ml-64">
      <div className="min-h-screen">
        <header className="sticky top-0 z-30 border-b glass">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="ml-12 space-y-2 lg:ml-0">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-5">
            <Skeleton className="h-72 rounded-2xl lg:col-span-3" />
            <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
          </div>
          <Skeleton className="h-56 rounded-2xl" />
        </main>
      </div>
    </div>
  );
}
