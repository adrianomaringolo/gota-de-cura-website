import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Testimony, TestimonyStatus } from '@/lib/types'

const testimonyRef = collection(db, 'testimony')

/** Imported testimonies carry no status; they were already published. */
export const testimonyStatus = (testimony: Testimony): TestimonyStatus =>
  testimony.status ?? 'approved'

export type TestimonySubmission = {
  name: string
  city?: string
  message: string
  authorized: boolean
}

const readAll = async (): Promise<Testimony[]> => {
  const snapshot = await getDocs(query(testimonyRef, orderBy('sentAt', 'desc')))
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as Testimony)
}

export const TestimonyService = {
  /**
   * The public list. Filtered here rather than with `where('status', '==', …)`
   * because the imported records have no `status` field and a query would
   * silently drop them.
   */
  async getTestimonyList(): Promise<Testimony[]> {
    const all = await readAll()
    return all.filter(
      (testimony) =>
        testimonyStatus(testimony) === 'approved' && testimony.authorized !== false,
    )
  },

  getAll: readAll,

  /** Always lands as `pending`: nothing reaches the site without the team's approval. */
  async submit(submission: TestimonySubmission): Promise<void> {
    await addDoc(testimonyRef, {
      name: submission.name.trim(),
      city: submission.city?.trim() ?? '',
      message: submission.message.trim(),
      authorized: submission.authorized,
      status: 'pending',
      sentAt: new Date().toISOString(),
    })
  },

  /** A testimony the team received elsewhere; the team vouches for the author's consent. */
  async create(input: {
    name: string
    city?: string
    message: string
    source: string
    sentAt: string
    publish: boolean
  }): Promise<void> {
    await addDoc(testimonyRef, {
      name: input.name.trim(),
      city: input.city?.trim() ?? '',
      message: input.message.trim(),
      source: input.source,
      authorized: true,
      status: input.publish ? 'approved' : 'pending',
      sentAt: input.sentAt,
      moderatedAt: new Date().toISOString(),
    })
  },

  async setStatus(id: string, status: TestimonyStatus): Promise<void> {
    await updateDoc(doc(testimonyRef, id), {
      status,
      moderatedAt: new Date().toISOString(),
    })
  },

  /** Keeps the author's original text the first time the team changes it. */
  async edit(
    testimony: Testimony & { id: string },
    fields: Pick<Testimony, 'name' | 'city' | 'message'>,
  ): Promise<void> {
    const messageChanged = fields.message !== testimony.message
    await updateDoc(doc(testimonyRef, testimony.id), {
      name: fields.name.trim(),
      city: fields.city?.trim() ?? '',
      message: fields.message.trim(),
      ...(messageChanged && !testimony.originalMessage
        ? { originalMessage: testimony.message }
        : {}),
    })
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(testimonyRef, id))
  },
}
