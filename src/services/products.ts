import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  or,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { toAmount } from '@/lib/format'
import { optimizeImage } from '@/lib/optimize-image'
import type { ProductItem } from '@/lib/types'

const productsRef = collection(db, 'products')

const productPhotos = (product: ProductItem) => [
  ...(product.images ?? []),
  ...(product.image ? [product.image] : []),
]

/** Only our own uploads: photos can also be external URLs (Google Photos…). */
const isStoredProductImage = (url: string) => {
  try {
    const { hostname, pathname } = new URL(url)
    return hostname === 'firebasestorage.googleapis.com' && pathname.includes('/o/products%2F')
  } catch {
    return false
  }
}

/** "Óleo de Lavanda 10ml" → "oleo-de-lavanda-10ml" */
const toFileSlug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')

/**
 * `entry.data()` is unvalidated, so the cast alone would keep claiming `price`
 * is a number while a handful of documents hold it as a string. Coercing here
 * means the whole app — display, cart arithmetic, order totals — sees numbers,
 * and re-saving one of those products writes the corrected type back.
 */
const toItems = (snapshot: Awaited<ReturnType<typeof getDocs>>): ProductItem[] =>
  snapshot.docs.map((entry) => {
    const data = entry.data() as ProductItem

    return {
      ...data,
      price: toAmount(data.price),
      // Left absent when absent: `oldPrice` is what drives the struck-through
      // "was" price, so a 0 here would be a value the product never had.
      ...(data.oldPrice === undefined ? {} : { oldPrice: toAmount(data.oldPrice) }),
    }
  })

export const ProductsService = {
  async getProducts(): Promise<ProductItem[]> {
    return toItems(await getDocs(productsRef))
  },

  async getProductsByType(type: string): Promise<ProductItem[]> {
    return toItems(await getDocs(query(productsRef, where('type', '==', type))))
  },

  /**
   * A line gathers products tagged with it in `categories`, plus any whose own
   * `type` is the line — which is what the admin form writes when a product is
   * created straight into it.
   */
  async getProductsByCategory(category: string): Promise<ProductItem[]> {
    return toItems(
      await getDocs(
        query(
          productsRef,
          or(
            where('categories', 'array-contains', category),
            where('type', '==', category),
          ),
        ),
      ),
    )
  },

  async getProductById(id: string): Promise<ProductItem | undefined> {
    return toItems(await getDocs(query(productsRef, where('id', '==', id))))[0]
  },

  async getProductByUrlName(urlName: string): Promise<ProductItem | undefined> {
    return toItems(await getDocs(query(productsRef, where('urlName', '==', urlName))))[0]
  },

  async saveProduct(product: ProductItem): Promise<void> {
    await setDoc(doc(productsRef, product.id), { ...product })
  },

  /**
   * Stores a product photo and returns its public URL. The file is named after
   * the product (`oleo-de-lavanda-<id>.webp`) instead of the camera's
   * `IMG_1234`, with a unique suffix so two uploads never overwrite each other.
   */
  async uploadProductImage(original: File, productName: string): Promise<string> {
    const file = await optimizeImage(original)
    const extension = file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() ?? 'jpg'
    const unique = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
    const imageRef = ref(
      storage,
      `products/${toFileSlug(productName) || 'produto'}-${unique}.${extension}`,
    )
    // Each upload gets a unique path, so the file never changes and can be cached for good.
    await uploadBytes(imageRef, file, {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000, immutable',
    })
    return getDownloadURL(imageRef)
  },

  /**
   * Deletes product photos from Storage once no product shows them any more —
   * older products were sometimes created by copying another one's photos, so
   * the check runs against the whole catalogue. Only files under `products/`
   * are touched. Never throws: a file left behind costs a few KB, while a
   * failure here must not undo a save that already went through.
   */
  async deleteUnusedImages(urls: string[]): Promise<void> {
    const candidates = [...new Set(urls)].filter(isStoredProductImage)
    if (candidates.length === 0) return

    try {
      const inUse = new Set((await this.getProducts()).flatMap(productPhotos))
      const results = await Promise.allSettled(
        candidates
          .filter((url) => !inUse.has(url))
          .map((url) => deleteObject(ref(storage, url))),
      )
      results.forEach((result) => {
        if (
          result.status === 'rejected' &&
          (result.reason as { code?: string })?.code !== 'storage/object-not-found'
        ) {
          console.error('[ProductsService] Falha ao excluir imagem', result.reason)
        }
      })
    } catch (error) {
      console.error('[ProductsService] Falha ao excluir imagens', error)
    }
  },

  /** Removes the product and then whichever of its photos nothing else uses. */
  async deleteProduct(id: string): Promise<void> {
    const product = await this.getProductById(id)
    await deleteDoc(doc(productsRef, id))
    if (product) await this.deleteUnusedImages(productPhotos(product))
  },
}
