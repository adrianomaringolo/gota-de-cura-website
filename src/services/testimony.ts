import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Testimony } from '@/lib/types'

const testimonyRef = collection(db, 'testimony')

export const TestimonyService = {
  async getTestimonyList(): Promise<Testimony[]> {
    const snapshot = await getDocs(query(testimonyRef, orderBy('sentAt', 'desc')))
    return snapshot.docs.map((entry) => entry.data() as Testimony)
  },
}
