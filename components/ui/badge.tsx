import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-white/40 bg-white/15 text-white",
        orange: "border-white/30 bg-white/10 text-white/90",
        yellow: "border-white/25 bg-white/10 text-white/85",
        green: "border-white/20 bg-white/5 text-white/80",
        slate: "border-white/20 bg-white/10 text-white/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
