import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  text?: string;
}

export function Loading({ className, text = "Yükleniyor..." }: LoadingProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center py-14", className)}
    >
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 rounded-full border-2 border-primary/15" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/60" />
        <span className="absolute inset-[7px] rounded-full bg-primary/15 animate-pulse" />
      </div>
      {text && (
        <p className="mt-4 text-sm font-medium text-muted-foreground">{text}</p>
      )}
    </div>
  );
}
