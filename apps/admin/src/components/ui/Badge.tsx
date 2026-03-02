/**
 * Badge component for labels and status indicators.
 *
 * @module @buzzy/admin/components/ui/Badge
 */

import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]',
        secondary: 'border-transparent bg-[var(--muted)] text-[var(--muted-foreground)]',
        success: 'border-transparent bg-[var(--success)] text-[var(--success-foreground)]',
        destructive: 'border-transparent bg-[var(--destructive)] text-[var(--destructive-foreground)]',
        warning: 'border-transparent bg-[var(--warning)] text-[var(--warning-foreground)]',
        outline: 'text-[var(--foreground)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge for displaying status, counts, or labels.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
