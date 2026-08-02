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

export const isUpcoming = (visit: Visit, now = new Date()): boolean =>
  new Date(visit.date) > now
