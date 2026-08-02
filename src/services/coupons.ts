import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Coupon } from '@/lib/types'

const couponsRef = collection(db, 'coupons')

export const CouponsService = {
  async getActiveCoupons(): Promise<Coupon[]> {
    const snapshot = await getDocs(query(couponsRef, where('active', '==', true)))
    return snapshot.docs.map((entry) => entry.data() as Coupon)
  },

  async addCoupon(coupon: Omit<Coupon, 'id'>): Promise<void> {
    await setDoc(doc(couponsRef, coupon.code), {
      ...coupon,
      createdAt: new Date().toISOString(),
    })
  },
}

/** A coupon is only usable inside its window; blank dates mean "no limit". */
export const isCouponValidNow = (coupon: Coupon, now = new Date()): boolean => {
  if (!coupon.active) return false
  if (coupon.startDate && new Date(coupon.startDate) > now) return false
  if (coupon.endDate) {
    const end = new Date(coupon.endDate)
    end.setHours(23, 59, 59, 999)
    if (end < now) return false
  }
  return true
}
