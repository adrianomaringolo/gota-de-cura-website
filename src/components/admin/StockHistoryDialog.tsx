'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Badge, LoadingRows } from '@/components/ui/Feedback'
import { formatDateAndTime } from '@/lib/format'
import type { ProductItem, StockMovement } from '@/lib/types'
import { StockService } from '@/services/stock'
import { Td, Th, TableWrap } from './AdminUI'

export function StockHistoryDialog({
  product,
  onClose,
}: {
  product: ProductItem | null
  onClose: () => void
}) {
  const [history, setHistory] = useState<StockMovement[] | null | 'error'>(null)

  useEffect(() => {
    if (!product) return
    setHistory(null)
    StockService.getHistory(product.id)
      .then(setHistory)
      .catch(() => setHistory('error'))
  }, [product])

  return (
    <Dialog
      open={Boolean(product)}
      onClose={onClose}
      size="lg"
      title={`Histórico de estoque${product ? ` — ${product.name}` : ''}`}
      description="Retiradas e devoluções avisadas pelos pedidos, da mais recente para a mais antiga."
      footer={
        <Button variant="ghost" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      {history === null ? (
        <LoadingRows rows={3} />
      ) : history === 'error' ? (
        <p className="text-sm text-ink-soft">Não foi possível carregar o histórico.</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-ink-soft">Nenhuma retirada ou devolução registrada.</p>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Data e hora</Th>
              <Th>Movimento</Th>
              <Th className="text-right">Qtd.</Th>
              <Th>Quem</Th>
              <Th>Pedido</Th>
              <Th className="text-right">Saldo</Th>
            </tr>
          </thead>
          <tbody>
            {history.map((movement) => (
              <tr key={movement.id}>
                <Td className="whitespace-nowrap tabular-nums">
                  {formatDateAndTime(new Date(movement.createdAt))}
                </Td>
                <Td>
                  <Badge tone={movement.type === 'withdrawal' ? 'warning' : 'positive'}>
                    {movement.type === 'withdrawal' ? 'Retirada' : 'Devolução'}
                  </Badge>
                </Td>
                <Td className="text-right font-medium tabular-nums">
                  {movement.type === 'withdrawal' ? '−' : '+'}
                  {movement.quantity}
                </Td>
                <Td>{movement.userName}</Td>
                <Td>
                  <Link
                    href={`/admin/pedidos/${movement.orderRef}`}
                    className="font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
                  >
                    #{movement.orderNumber}
                  </Link>
                </Td>
                <Td className="text-right tabular-nums">{movement.balanceAfter}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </Dialog>
  )
}
