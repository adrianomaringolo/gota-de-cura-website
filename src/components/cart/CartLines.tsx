'use client'

import { useCart } from '@/lib/cart-context'
import { formatCurrency } from '@/lib/format'

export function CartLines() {
  const { items, setAmount, removeItem } = useCart()
  const lines = items.filter((item) => item.amount > 0)

  return (
    <ul className="divide-y divide-line border-y border-line">
      {lines.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center gap-4 py-4">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">{item.name}</p>
            <p className="text-sm text-ink-muted">{item.type}</p>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-line p-1">
            <button
              type="button"
              onClick={() => setAmount(item.id, item.amount - 1)}
              disabled={item.amount <= 1}
              aria-label={`Diminuir ${item.name}`}
              className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-canvas-sunk hover:text-ink disabled:opacity-35 disabled:hover:bg-transparent"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 12h12" />
              </svg>
            </button>

            <label className="sr-only" htmlFor={`amount-${item.id}`}>
              Quantidade de {item.name}
            </label>
            <input
              id={`amount-${item.id}`}
              type="number"
              min={1}
              inputMode="numeric"
              value={item.amount}
              onChange={(event) => setAmount(item.id, Number(event.target.value))}
              className="w-12 [appearance:textfield] bg-transparent text-center text-base font-semibold tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />

            <button
              type="button"
              onClick={() => setAmount(item.id, item.amount + 1)}
              aria-label={`Aumentar ${item.name}`}
              className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-canvas-sunk hover:text-ink"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M12 6v12M6 12h12" />
              </svg>
            </button>
          </div>

          <p className="w-24 text-right font-display text-lg font-semibold text-ink tabular-nums">
            {formatCurrency(item.price * item.amount)}
          </p>

          <button
            type="button"
            onClick={() => removeItem(item.id)}
            aria-label={`Remover ${item.name} do pedido`}
            className="grid h-9 w-9 place-items-center rounded-full text-ink-muted transition-colors hover:bg-danger-tint hover:text-danger"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4.5 w-4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  )
}
