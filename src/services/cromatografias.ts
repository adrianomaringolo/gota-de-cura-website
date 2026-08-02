import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Cromatografia } from '@/lib/types'

const cromatografiasRef = collection(db, 'cromatografias')

export const CromatografiasService = {
  async getAll(): Promise<Cromatografia[]> {
    const snapshot = await getDocs(query(cromatografiasRef, orderBy('name')))
    return snapshot.docs.map(
      (entry) => ({ id: entry.id, ...entry.data() }) as Cromatografia,
    )
  },

  async save(cromatografia: Omit<Cromatografia, 'id'>): Promise<void> {
    await addDoc(cromatografiasRef, {
      ...cromatografia,
      createdAt: new Date().toISOString(),
    })
  },

  async update(id: string, cromatografia: Omit<Cromatografia, 'id'>): Promise<void> {
    await updateDoc(doc(cromatografiasRef, id), { ...cromatografia })
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(cromatografiasRef, id))
  },

  async incrementViewCount(id: string): Promise<void> {
    await updateDoc(doc(cromatografiasRef, id), { viewCount: increment(1) })
  },
}
