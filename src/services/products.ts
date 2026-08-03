import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toAmount } from '@/lib/format'
import type { ProductItem } from '@/lib/types'

const productsRef = collection(db, 'products')

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

  async getProductsByCategory(category: string): Promise<ProductItem[]> {
    return toItems(
      await getDocs(query(productsRef, where('categories', 'array-contains', category))),
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

  async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(productsRef, id))
  },
}
