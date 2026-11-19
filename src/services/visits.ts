import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { EnrollmentData, Visit } from '@/lib/types'

export type VisitInput = { date: string; value: number }

const visitsRef = collection(db, 'visits')

export const VisitsService = {
  async getVisitsList(): Promise<Visit[]> {
    const snapshot = await getDocs(query(visitsRef, orderBy('date')))
    return snapshot.docs.map((entry) => entry.data() as Visit)
  },

  /**
   * The document id is the visit date itself: enrollments are written to
   * `doc(visitsRef, visitDate)`, so the two must never diverge.
   */
  async save(input: VisitInput): Promise<void> {
    const ref = doc(visitsRef, input.date)
    if ((await getDoc(ref)).exists()) throw new Error('visit-exists')
    await setDoc(ref, { date: input.date, value: input.value, enrollments: [] })
  },

  /** Changing the date moves the document (and its enrollments) to the new id. */
  async update(currentDate: string, input: VisitInput): Promise<void> {
    if (input.date === currentDate) {
      await updateDoc(doc(visitsRef, currentDate), { value: input.value })
      return
    }

    const target = doc(visitsRef, input.date)
    if ((await getDoc(target)).exists()) throw new Error('visit-exists')

    const current = await getDoc(doc(visitsRef, currentDate))
    await setDoc(target, {
      ...current.data(),
      date: input.date,
      value: input.value,
    })
    await deleteDoc(doc(visitsRef, currentDate))
  },

  async remove(date: string): Promise<void> {
    await deleteDoc(doc(visitsRef, date))
  },

  async addEnrollmentToVisit(visitId: string, enrollment: EnrollmentData): Promise<void> {
    const visitDoc = await getDoc(doc(visitsRef, visitId))
    const enrollments = (visitDoc.data()?.enrollments ?? []) as EnrollmentData[]

    await updateDoc(doc(visitsRef, visitId), {
      enrollments: [
        ...enrollments,
        { ...enrollment, createdAt: new Date().toISOString() },
      ],
    })
  },
}

/**
 * Same trap as the date formatting: `new Date('2026-08-01')` is midnight UTC,
 * which is 21:00 on 31/07 in São Paulo — so the date used to drop off the list
 * three hours before its own day even started. A visit stays upcoming until its
 * day ends locally. Brazil has had no DST since 2019, so -03:00 is fixed.
 */
export const isUpcoming = (visit: Visit, now = new Date()): boolean => {
  const endOfDay = /^\d{4}-\d{2}-\d{2}$/.test(visit.date)
    ? new Date(`${visit.date}T23:59:59-03:00`)
    : new Date(visit.date)

  return endOfDay > now
}
