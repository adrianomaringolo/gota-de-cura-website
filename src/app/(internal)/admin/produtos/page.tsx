'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { AdminHeading, Td, Th, TableWrap } from '@/components/admin/AdminUI'
import { StockHistoryDialog } from '@/components/admin/StockHistoryDialog'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Field'
import { Badge, EmptyState, LoadingRows } from '@/components/ui/Feedback'
import { formatCurrency } from '@/lib/format'
import { productTypes } from '@/lib/product-types'
import type { ProductItem } from '@/lib/types'
import { ProductsService } from '@/services/products'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[] | null>(null)
  const [type, setType] = useState('all')
  const [exporting, setExporting] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [historyOf, setHistoryOf] = useState<ProductItem | null>(null)

  const load = async () => setProducts(await ProductsService.getProducts())

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(
    () =>
      (products ?? [])
        .filter((product) => type === 'all' || product.type === type)
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [products, type],
  )

  const exportToExcel = async () => {
    setExporting(true)
    try {
      // Loaded on demand: the library only matters when someone exports.
      const { default: writeExcelFile } = await import('write-excel-file/browser')
      // "Todas as categorias" keeps the plain name; otherwise the category is
      // appended as a lowercase, accent-free slug.
      const slug = type
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      const fileName = type === 'all' || !slug ? 'produtos' : `produtos-${slug}`
      const header = (value: string) => ({ value, fontWeight: 'bold' as const })

      await writeExcelFile(filtered, {
        columns: [
          {
            header: header('Código'),
            cell: (product: ProductItem) => ({ value: product.id }),
            width: 14,
          },
          {
            header: header('Produto'),
            cell: (product: ProductItem) => ({ value: product.name }),
            width: 44,
          },
          {
            header: header('Categoria'),
            cell: (product: ProductItem) => ({ value: product.type ?? '' }),
            width: 26,
          },
          {
            header: header('Preço (R$)'),
            cell: (product: ProductItem) => ({
              value: product.price,
              type: Number,
              format: '#,##0.00',
            }),
            width: 14,
          },
          {
            header: header('Quantidade'),
            cell: (product: ProductItem) => ({
              value: product.amount ?? 0,
              type: Number,
            }),
            width: 13,
          },
          {
            header: header('Disponibilidade'),
            cell: (product: ProductItem) => ({
              value: product.available ? 'Disponível' : 'Esgotado',
            }),
            width: 16,
          },
        ],
      }).toFile(`${fileName}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
    } catch (error) {
      console.error('Falha ao exportar os produtos', error)
      toast.error('Não foi possível exportar a planilha')
    } finally {
      setExporting(false)
    }
  }

  const patch = (id: string, changes: Partial<ProductItem>) =>
    setProducts((current) =>
      (current ?? []).map((product) =>
        product.id === id ? { ...product, ...changes } : product,
      ),
    )

  const save = async (product: ProductItem) => {
    setSavingId(product.id)
    try {
      await ProductsService.saveProduct(product)
      toast.success(`${product.name} atualizado`)
    } catch {
      toast.error('Não foi possível salvar')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <>
      <AdminHeading
        title="Disponibilidade e estoque"
        description="Tirar a disponibilidade impede novos pedidos do produto, mas ele continua visível no site. A quantidade desce sozinha quando um pedido avisa a retirada de produtos (e volta numa devolução); o histórico de cada produto fica em “Histórico”."
        actions={
          <>
            <Button
              variant="outline"
              onClick={exportToExcel}
              disabled={exporting || filtered.length === 0}
            >
              {exporting ? 'Exportando…' : 'Exportar para Excel'}
            </Button>
            <Select
              aria-label="Filtrar por categoria"
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="w-72"
            >
              <option value="all">Todas as categorias</option>
              {productTypes.map((productType) => (
                <option key={productType.id} value={productType.type}>
                  {productType.type}
                </option>
              ))}
            </Select>
          </>
        }
      />

      {products === null ? (
        <LoadingRows rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhum produto nesta categoria" />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Produto</Th>
              <Th className="text-right">Preço</Th>
              <Th>Quantidade</Th>
              <Th>Disponibilidade</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id}>
                <Td>
                  <span className="font-medium">{product.name}</span>
                  <span className="block text-xs text-ink-muted">
                    {product.type} · {product.id}
                  </span>
                </Td>
                <Td className="text-right tabular-nums">
                  {formatCurrency(product.price)}
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`qty-${product.id}`}>
                      Quantidade de {product.name}
                    </label>
                    <input
                      id={`qty-${product.id}`}
                      type="number"
                      min={0}
                      value={product.amount ?? 0}
                      onChange={(event) =>
                        patch(product.id, { amount: Number(event.target.value) })
                      }
                      className="w-20 rounded-lg border border-line bg-surface px-3 py-2 text-sm tabular-nums"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => save(product)}
                      disabled={savingId === product.id}
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setHistoryOf(product)}
                    >
                      Histórico
                    </Button>
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    {product.available ? (
                      <Badge tone="positive">Disponível</Badge>
                    ) : (
                      <Badge tone="warning">Esgotado</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={savingId === product.id}
                      onClick={() => {
                        const next = { ...product, available: !product.available }
                        patch(product.id, { available: next.available })
                        void save(next)
                      }}
                    >
                      {product.available ? 'Indisponibilizar' : 'Disponibilizar'}
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <StockHistoryDialog product={historyOf} onClose={() => setHistoryOf(null)} />
    </>
  )
}
