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
import type { ProductItem } from '@/lib/types'

const productsRef = collection(db, 'products')

const toItems = (snapshot: Awaited<ReturnType<typeof getDocs>>): ProductItem[] =>
  snapshot.docs.map((entry) => entry.data() as ProductItem)

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
