import { cn } from "@/lib/utils";

type ProgressProps = {
  value: number;
  className?: string;
  indicatorClassName?: string;
};

export function Progress({ value, className, indicatorClassName }: ProgressProps) {
  const safe = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-slate-700", className)}>
      <div
        className={cn("h-full rounded-full bg-rose-400 transition-all duration-500", indicatorClassName)}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}
