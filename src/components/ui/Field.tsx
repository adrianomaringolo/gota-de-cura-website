'use client'

import { forwardRef, useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

const controlStyles =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink ' +
  'transition-colors duration-150 placeholder:text-ink-muted ' +
  'hover:border-line-strong focus:border-brand focus:outline-none ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-lift ' +
  'disabled:bg-canvas-sunk disabled:text-ink-muted ' +
  // read-only keeps the value in the submitted payload, unlike disabled
  'read-only:bg-canvas-sunk read-only:text-ink-soft'

type LabelledProps = {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  className?: string
}

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: LabelledProps & { id: string; required?: boolean; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {required && (
            <span className="ml-1 text-terra" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export const Input = forwardRef<
  HTMLInputElement,
  LabelledProps & Omit<ComponentProps<'input'>, 'className'>
>(function Input({ label, hint, error, className, id, ...rest }, ref) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      className={className}
    >
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
        }
        className={cn(controlStyles, error && 'border-danger')}
        {...rest}
      />
    </FieldShell>
  )
})

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  LabelledProps & Omit<ComponentProps<'textarea'>, 'className'>
>(function Textarea({ label, hint, error, className, id, ...rest }, ref) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      className={className}
    >
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(
          controlStyles,
          'resize-y leading-relaxed',
          error && 'border-danger',
        )}
        {...rest}
      />
    </FieldShell>
  )
})

export const Select = forwardRef<
  HTMLSelectElement,
  LabelledProps & Omit<ComponentProps<'select'>, 'className'>
>(function Select({ label, hint, error, className, id, children, ...rest }, ref) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      className={className}
    >
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          className={cn(controlStyles, 'appearance-none pr-11', error && 'border-danger')}
          {...rest}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-ink-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 8 5 5 5-5" />
        </svg>
      </div>
    </FieldShell>
  )
})

type ToggleProps = Omit<ComponentProps<'input'>, 'type' | 'className'> & {
  label: ReactNode
  hint?: ReactNode
  className?: string
}

export const Checkbox = forwardRef<HTMLInputElement, ToggleProps>(function Checkbox(
  { label, hint, className, id, ...rest },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <input
        ref={ref}
        id={fieldId}
        type="checkbox"
        className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-brand)]"
        {...rest}
      />
      <label htmlFor={fieldId} className="text-sm text-ink-soft">
        <span className="font-medium text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-ink-muted">{hint}</span>}
      </label>
    </div>
  )
})

export const RadioChip = forwardRef<HTMLInputElement, ToggleProps>(function RadioChip(
  { label, className, id, ...rest },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <label
      htmlFor={fieldId}
      className={cn(
        'group relative flex cursor-pointer items-center gap-2.5 rounded-xl border border-line',
        'bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors duration-150',
        'hover:border-brand/50 has-checked:border-brand has-checked:bg-brand-tint',
        'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-lift',
        className,
      )}
    >
      <input
        ref={ref}
        id={fieldId}
        type="radio"
        className="h-4 w-4 accent-[var(--color-brand)]"
        {...rest}
      />
      {label}
    </label>
  )
})
