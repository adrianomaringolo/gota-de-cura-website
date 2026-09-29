'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Feedback'
import { productTypes } from '@/lib/product-types'
import type { ProductItem } from '@/lib/types'
import { ProductsService } from '@/services/products'

/** Special lines (Amazônia, Gotinha…) group products of any type through `categories`. */
const lines = productTypes.filter((productType) => productType.mode === 'category')
const isLine = (category: string) => lines.some((line) => line.type === category)

type ProductForm = {
  id: string
  type: string
  name: string
  price: number
  oldPrice?: number
  description: string
  detailedDescription?: string
  image: string
  categories: string[]
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
  categories: [],
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
    control,
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
            categories: (product.categories ?? []).filter(isLine),
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
      const { oldPrice: _previousOldPrice, ...existing } = product ?? {}
      const { oldPrice, categories, ...fields } = data
      await ProductsService.saveProduct({
        ...existing,
        ...fields,
        // The form only owns the special lines; any other tag already on the
        // product is carried over untouched.
        categories: [
          ...(product?.categories ?? []).filter((category) => !isLine(category)),
          ...categories,
        ],
        id: product?.id ?? data.id,
        createdAt: product?.createdAt ?? new Date().toISOString(),
        // Firestore rejects `undefined` values, so an empty "old price" (NaN
        // from valueAsNumber) has to leave the key out rather than send it.
        ...(oldPrice ? { oldPrice } : {}),
      } as ProductItem)
      toast.success(editing ? 'Produto atualizado' : 'Produto criado')
      await onSaved()
      onClose()
    } catch (error) {
      console.error('[ProductFormDialog] Falha ao salvar o produto', error)
      toast.error('Não foi possível salvar o produto')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      closeOnBackdrop={false}
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
        onSubmit={handleSubmit(onSubmit, (formErrors) =>
          console.error('[ProductFormDialog] Formulário inválido', formErrors),
        )}
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

        <fieldset className="flex flex-col gap-2 sm:col-span-2">
          <legend className="mb-1.5 text-sm font-medium text-ink">Linhas especiais</legend>
          <Controller
            control={control}
            name="categories"
            render={({ field }) => (
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {lines.map((line) => (
                  <Checkbox
                    key={line.id}
                    label={line.typeLabel ?? line.type}
                    checked={field.value.includes(line.type)}
                    onChange={(event) =>
                      field.onChange(
                        event.target.checked
                          ? [...field.value, line.type]
                          : field.value.filter((category) => category !== line.type),
                      )
                    }
                    onBlur={field.onBlur}
                  />
                ))}
              </div>
            )}
          />
          <p className="text-xs text-ink-muted">
            Além da categoria, o produto também aparece nas linhas marcadas.
          </p>
        </fieldset>

        <Checkbox label="Disponível para venda" {...register('available')} />
        <Checkbox label="Ocultar do catálogo" {...register('hidden')} />
      </form>
    </Dialog>
  )
}
