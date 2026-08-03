import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { EnrollmentData, Visit } from '@/lib/types'

const visitsRef = collection(db, 'visits')

export const VisitsService = {
  async getVisitsList(): Promise<Visit[]> {
    const snapshot = await getDocs(query(visitsRef, orderBy('date')))
    return snapshot.docs.map((entry) => entry.data() as Visit)
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
