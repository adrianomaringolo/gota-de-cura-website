'use client'

import { useEffect, useId, useState, type KeyboardEvent } from 'react'
import { Controller, useForm, type FieldErrors } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ProductImagesField } from '@/components/admin/ProductImagesField'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Feedback'
import { cn } from '@/lib/cn'
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
  detailedDescription: string
  images: string[]
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
  images: [],
  categories: [],
  available: true,
  hidden: false,
}

const tabs = [
  { id: 'geral', label: 'Título e valores' },
  { id: 'descricoes', label: 'Descrições' },
  { id: 'imagens', label: 'Imagens' },
] as const

type TabId = (typeof tabs)[number]['id']

/** Which tab holds each validated field, so a failed submit can open it. */
const fieldTab: Partial<Record<keyof ProductForm, TabId>> = {
  id: 'geral',
  type: 'geral',
  name: 'geral',
  price: 'geral',
  description: 'descricoes',
  images: 'imagens',
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
  const tabsId = useId()
  const [tab, setTab] = useState<TabId>('geral')
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({ defaultValues: empty })

  useEffect(() => {
    if (!open) return
    setTab('geral')
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
            images: product.images?.length
              ? product.images
              : product.image
                ? [product.image]
                : [],
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
      const { oldPrice, categories, images, ...fields } = data
      await ProductsService.saveProduct({
        ...existing,
        ...fields,
        // `image` stays the main photo so the catalogue, the cart and older
        // screens keep working without knowing about `images`.
        image: images[0],
        images,
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

  const onInvalid = (formErrors: FieldErrors<ProductForm>) => {
    console.error('[ProductFormDialog] Formulário inválido', formErrors)
    // An error on a hidden tab would otherwise look like a button that does nothing.
    const first = tabs.find((candidate) =>
      Object.keys(formErrors).some(
        (field) => fieldTab[field as keyof ProductForm] === candidate.id,
      ),
    )
    if (first) setTab(first.id)
  }

  const tabHasError = (id: TabId) =>
    Object.keys(errors).some((field) => fieldTab[field as keyof ProductForm] === id)

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    const index = tabs.findIndex((candidate) => candidate.id === tab)
    const step = event.key === 'ArrowRight' ? 1 : -1
    const next = tabs[(index + step + tabs.length) % tabs.length]
    setTab(next.id)
    document.getElementById(`${tabsId}-${next.id}-tab`)?.focus()
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
      <div
        role="tablist"
        aria-label="Seções do produto"
        className="sticky -top-5 z-10 -mx-6 -mt-5 mb-5 flex gap-1 border-b border-line bg-surface px-6 pt-3"
      >
        {tabs.map((candidate) => {
          const selected = candidate.id === tab
          return (
            <button
              key={candidate.id}
              id={`${tabsId}-${candidate.id}-tab`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${tabsId}-${candidate.id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(candidate.id)}
              onKeyDown={onTabKeyDown}
              className={cn(
                '-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                selected
                  ? 'border-brand text-brand'
                  : 'border-transparent text-ink-muted hover:text-ink',
              )}
            >
              {candidate.label}
              {tabHasError(candidate.id) && (
                <span className="h-2 w-2 rounded-full bg-danger" aria-label="(com erro)" />
              )}
            </button>
          )
        })}
      </div>

      {/* Every panel stays mounted (just hidden) so switching tabs keeps what was typed. */}
      <form
        id="product-form"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
      >
        <div
          id={`${tabsId}-geral-panel`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-geral-tab`}
          hidden={tab !== 'geral'}
          className="grid gap-4 sm:grid-cols-2"
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
        </div>

        <div
          id={`${tabsId}-descricoes-panel`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-descricoes-tab`}
          hidden={tab !== 'descricoes'}
          className="grid gap-4"
        >
          <Textarea
            label="Descrição curta"
            rows={3}
            required
            hint="Aparece no card do catálogo."
            error={errors.description && 'Escreva uma descrição curta.'}
            {...register('description', { required: true })}
          />
          <Controller
            control={control}
            name="detailedDescription"
            render={({ field }) => (
              <RichTextEditor
                label="Descrição detalhada"
                hint="Aparece na janela “Saiba mais” e na página do produto."
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div
          id={`${tabsId}-imagens-panel`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-imagens-tab`}
          hidden={tab !== 'imagens'}
        >
          <Controller
            control={control}
            name="images"
            rules={{ validate: (images) => images.length > 0 }}
            render={({ field }) => (
              <ProductImagesField
                value={field.value}
                onChange={field.onChange}
                error={errors.images && 'Adicione ao menos uma imagem.'}
              />
            )}
          />
        </div>
      </form>
    </Dialog>
  )
}
