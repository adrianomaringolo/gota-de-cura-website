import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'onDark'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em] ' +
  'transition-[background-color,color,border-color,transform,box-shadow] duration-200 ' +
  'ease-[var(--ease-out-quart)] active:translate-y-px ' +
  'disabled:pointer-events-none disabled:opacity-45'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-deep shadow-lift hover:shadow-raised',
  accent: 'bg-terra text-white hover:bg-[oklch(0.44_0.14_42)] shadow-lift',
  outline:
    'border border-brand/35 text-brand hover:border-brand hover:bg-brand-tint bg-transparent',
  ghost: 'text-brand hover:bg-brand-tint',
  onDark: 'bg-white text-brand-darkest hover:bg-brand-soft',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
}

type CommonProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: CommonProps & ComponentProps<'button'>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Link>
  )
}
