'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Feedback'
import { productTypes } from '@/lib/product-types'
import type { ProductItem } from '@/lib/types'
import { ProductsService } from '@/services/products'

type ProductForm = {
  id: string
  type: string
  name: string
  price: number
  oldPrice?: number
  description: string
  detailedDescription?: string
  image: string
  available: boolean
  hidden: boolean
}

const empty: ProductForm = {
  id: '',
  type: '',
  name: '',
  price: 0,
  oldPrice: undefined,
  description: '',
  detailedDescription: '',
  image: '',
  available: true,
  hidden: false,
}

export function ProductFormDialog({
  open,
  product,
  onClose,
  onSaved,
}: {
  open: boolean
  product: ProductItem | null
  onClose: () => void
  onSaved: () => Promise<void> | void
}) {
  const editing = Boolean(product)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({ defaultValues: empty })

  useEffect(() => {
    if (!open) return
    reset(
      product
        ? {
            id: product.id,
            type: product.type ?? '',
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            description: product.description,
            detailedDescription: product.detailedDescription ?? '',
            image: product.image,
            available: product.available ?? true,
            hidden: product.hidden ?? false,
          }
        : empty,
    )
  }, [open, product, reset])

  const onSubmit = async (data: ProductForm) => {
    try {
      // saveProduct replaces the whole document, so an edit has to carry the
      // untouched fields (urlName, categories, optionsSet, createdAt…) forward
      // instead of only what this form knows about.
      await ProductsService.saveProduct({
        ...product,
        ...data,
        id: product?.id ?? data.id,
        oldPrice: data.oldPrice || undefined,
        createdAt: product?.createdAt ?? new Date().toISOString(),
      } as ProductItem)
      toast.success(editing ? 'Produto atualizado' : 'Produto criado')
      await onSaved()
      onClose()
    } catch {
      toast.error('Não foi possível salvar o produto')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? 'Editar produto' : 'Novo produto'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button form="product-form" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Spinner className="h-4 w-4" />
            ) : editing ? (
              'Salvar alterações'
            ) : (
              'Criar produto'
            )}
          </Button>
        </>
      }
    >
      <form
        id="product-form"
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-4 sm:grid-cols-2"
        noValidate
      >
        <Input
          label="Código (ID)"
          required
          readOnly={editing}
          placeholder="lavanda-10ml"
          hint={
            editing
              ? 'O código não muda depois que o produto é criado.'
              : 'Identificador único, sem espaços.'
          }
          error={errors.id && 'Informe um código.'}
          {...register('id', { required: true })}
        />
        <Select
          label="Categoria"
          required
          error={errors.type && 'Escolha a categoria.'}
          {...register('type', { required: true })}
        >
          <option value="">— selecione —</option>
          {productTypes.map((productType) => (
            <option key={productType.id} value={productType.type}>
              {productType.type}
            </option>
          ))}
        </Select>

        <Input
          label="Nome"
          required
          className="sm:col-span-2"
          error={errors.name && 'Informe o nome do produto.'}
          {...register('name', { required: true })}
        />

        <Input
          label="Preço (R$)"
          type="number"
          step="0.01"
          min="0"
          required
          error={errors.price && 'Informe o preço.'}
          {...register('price', { required: true, valueAsNumber: true, min: 0 })}
        />
        <Input
          label="Preço antigo (R$)"
          type="number"
          step="0.01"
          min="0"
          hint="Preenchido só quando o produto está em promoção."
          {...register('oldPrice', { valueAsNumber: true })}
        />

        <Textarea
          label="Descrição curta"
          rows={3}
          required
          className="sm:col-span-2"
          error={errors.description && 'Escreva uma descrição curta.'}
          {...register('description', { required: true })}
        />
        <Textarea
          label="Descrição detalhada"
          rows={5}
          className="sm:col-span-2"
          hint="Aceita HTML — aparece na janela “Saiba mais”."
          {...register('detailedDescription')}
        />

        <Input
          label="Imagem (URL)"
          required
          className="sm:col-span-2"
          error={errors.image && 'Informe a URL da imagem.'}
          {...register('image', { required: true })}
        />

        <Checkbox label="Disponível para venda" {...register('available')} />
        <Checkbox label="Ocultar do catálogo" {...register('hidden')} />
      </form>
    </Dialog>
  )
}
