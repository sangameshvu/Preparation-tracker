import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.98] active:brightness-110',
  {
    variants: {
      variant: {
        default:
          'glass-tint text-white shadow-md hover:brightness-105',
        primary:
          'glass-tint text-white shadow-md hover:brightness-105',
        destructive:
          'glass-destructive focus-visible:ring-rose-500',
        outline:
          'glass-thin text-foreground hover:bg-black/5 dark:hover:bg-white/10',
        secondary:
          'glass-thin text-foreground hover:bg-black/5 dark:hover:bg-white/10',
        ghost:
          'bg-transparent text-foreground hover:glass-thin',
        link:
          'text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline active:scale-100',
        purple:
          'glass-tint text-white shadow-md hover:brightness-105',
        blue:
          'glass-tint text-white shadow-md hover:brightness-105',
        emerald:
          'bg-emerald-600/90 text-white shadow-md hover:bg-emerald-600',
      },
      size: {
        default: 'h-9 px-4 py-2 rounded-xl',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-10 rounded-xl px-6 text-sm sm:text-base',
        icon: 'h-9 w-9 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
