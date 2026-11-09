import { formatCurrency } from './format'
import type { CartItem } from './types'

/** One line in the item editor: an existing order line, or a product being added. */
export interface EditableLine {
  key: string
  id: string
  name: string
  type: string
  price: number
  localizedName?: string
  amount: number
  /** Quantity on the saved order; `null` for a line added in this edit. */
  originalAmount: number | null
  removed: boolean
}

export type ItemChange =
  | { kind: 'removed'; name: string; amount: number }
  | { kind: 'added'; name: string; amount: number }
  | { kind: 'changed'; name: string; from: number; to: number }

/** A removed line is gone whatever its quantity; a zero quantity counts as removal too. */
const isGone = (line: EditableLine) => line.removed || line.amount <= 0

export function diffLines(lines: EditableLine[]): ItemChange[] {
  const changes: ItemChange[] = []

  for (const line of lines) {
    if (line.originalAmount === null) {
      if (!isGone(line))
        changes.push({ kind: 'added', name: line.name, amount: line.amount })
    } else if (isGone(line)) {
      changes.push({ kind: 'removed', name: line.name, amount: line.originalAmount })
    } else if (line.amount !== line.originalAmount) {
      changes.push({
        kind: 'changed',
        name: line.name,
        from: line.originalAmount,
        to: line.amount,
      })
    }
  }

  return changes
}

/** The lines that stay on the order, in the shape the order stores. */
export function linesToItems(lines: EditableLine[]): CartItem[] {
  return lines
    .filter((line) => !isGone(line))
    .map(
      (line) =>
        ({
          id: line.id,
          name: line.name,
          price: line.price,
          type: line.type,
          amount: line.amount,
          ...(line.localizedName ? { localizedName: line.localizedName } : {}),
        }) as CartItem,
    )
}

/** The comment that records an edit: what changed, why, and the effect on the total. */
export function describeChanges(
  changes: ItemChange[],
  options: { reason?: string; totalBefore: number; totalAfter: number },
): string {
  const lines = changes.map((change) => {
    if (change.kind === 'removed') return `• Removido: ${change.name} (${change.amount}×)`
    if (change.kind === 'added') return `• Adicionado: ${change.name} (${change.amount}×)`
    return `• Quantidade alterada: ${change.name} — de ${change.from}× para ${change.to}×`
  })

  return [
    '✏️ Itens do pedido editados.',
    ...lines,
    ...(options.reason ? [`Motivo: ${options.reason}`] : []),
    `Total: ${formatCurrency(options.totalBefore)} → ${formatCurrency(options.totalAfter)}`,
  ].join('\n')
}
