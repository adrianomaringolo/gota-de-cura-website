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
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { toAmount } from '@/lib/format'
import { optimizeImage } from '@/lib/optimize-image'
import type { ProductItem } from '@/lib/types'

const productsRef = collection(db, 'products')

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
   * Stores a product photo and returns its public URL. The name is prefixed with
   * a timestamp so two photos called `IMG_0001.jpg` never overwrite each other.
   */
  /** `productName` names the file (`oleo-de-lavanda-<id>.webp`) instead of the camera's `IMG_1234`. */
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

  async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(productsRef, id))
  },
}
