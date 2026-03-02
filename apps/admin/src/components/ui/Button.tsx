/**
 * Button component with variant support.
 * Follows shadcn/ui patterns with Tailwind CSS.
 *
 * @module @buzzy/admin/components/ui/Button
 */

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90',
        destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90',
        success: 'bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/90',
        outline: 'border border-[var(--border)] bg-transparent hover:bg-[var(--muted)]',
        ghost: 'hover:bg-[var(--muted)]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/**
 * Styled button with variant and size props.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
