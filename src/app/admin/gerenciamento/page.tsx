'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminHeading, Td, Th, TableWrap } from '@/components/admin/AdminUI'
import { ProductFormDialog } from '@/components/admin/ProductFormDialog'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Field'
import { Badge, EmptyState, LoadingRows } from '@/components/ui/Feedback'
import { useLoggedUser } from '@/lib/hooks'
import { formatCurrency } from '@/lib/format'
import { productTypes } from '@/lib/product-types'
import type { ProductItem } from '@/lib/types'
import { ProductsService } from '@/services/products'

export default function AdminManagementPage() {
  const router = useRouter()
  const { isAdmin, resolved } = useLoggedUser()
  const [products, setProducts] = useState<ProductItem[] | null>(null)
  const [type, setType] = useState('all')
  const [editing, setEditing] = useState<ProductItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    if (resolved && isAdmin === false) router.replace('/admin')
  }, [resolved, isAdmin, router])

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

  const remove = async (id: string) => {
    try {
      await ProductsService.deleteProduct(id)
      toast.success('Produto excluído')
      setConfirmDelete(null)
      await load()
    } catch {
      toast.error('Não foi possível excluir')
    }
  }

  return (
    <>
      <AdminHeading
        title="Gerenciamento de produtos"
        description="Criar, editar e excluir os produtos do catálogo."
        actions={
          <>
            <Select
              aria-label="Filtrar por categoria"
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="w-64"
            >
              <option value="all">Todas as categorias</option>
              {productTypes.map((productType) => (
                <option key={productType.id} value={productType.type}>
                  {productType.type}
                </option>
              ))}
            </Select>
            <Button
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
            >
              Novo produto
            </Button>
          </>
        }
      />

      {products === null ? (
        <LoadingRows rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhum produto encontrado" />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Produto</Th>
              <Th>Categoria</Th>
              <Th className="text-right">Preço</Th>
              <Th>Situação</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id}>
                <Td>
                  <span className="font-medium">{product.name}</span>
                  <span className="block text-xs text-ink-muted">{product.id}</span>
                </Td>
                <Td className="text-ink-soft">{product.type}</Td>
                <Td className="text-right tabular-nums">
                  {formatCurrency(product.price)}
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    {product.available ? (
                      <Badge tone="positive">Disponível</Badge>
                    ) : (
                      <Badge tone="warning">Esgotado</Badge>
                    )}
                    {product.hidden && <Badge tone="neutral">Oculto</Badge>}
                  </div>
                </Td>
                <Td className="text-right">
                  {confirmDelete === product.id ? (
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        className="bg-danger hover:bg-danger/85"
                        onClick={() => remove(product.id)}
                      >
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDelete(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(product)
                          setDialogOpen(true)
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDelete(product.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <ProductFormDialog
        open={dialogOpen}
        product={editing}
        onClose={() => setDialogOpen(false)}
        onSaved={load}
      />
    </>
  )
}
