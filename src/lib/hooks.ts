'use client'

import { useCallback, useEffect, useState } from 'react'
import { CouponsService } from '@/services/coupons'
import { CromatografiasService } from '@/services/cromatografias'
import { TestimonyService } from '@/services/testimony'
import { onSessionChange, UsersService } from '@/services/users'
import { VisitsService } from '@/services/visits'
import type { Coupon, Cromatografia, Testimony, User, Visit } from './types'

type AsyncState<T> = { data: T; loading: boolean; reload: () => Promise<void> }

function useAsyncList<T>(
  loader: () => Promise<T[]>,
  deps: unknown[] = [],
): AsyncState<T[]> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setData(await loader())
    } catch (error) {
      console.error(error)
      setData([])
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, loading, reload }
}

export const useVisits = () => useAsyncList<Visit>(() => VisitsService.getVisitsList())

export const useCoupons = () =>
  useAsyncList<Coupon>(() => CouponsService.getActiveCoupons())

export const useTestimonies = () =>
  useAsyncList<Testimony>(() => TestimonyService.getTestimonyList())

export const useCromatografias = () =>
  useAsyncList<Cromatografia>(() => CromatografiasService.getAll())

/**
 * `undefined` means "still reading localStorage" — pages must not redirect on
 * that, only on a resolved `null`.
 */
export function useLoggedUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    const read = () => setUser(UsersService.getStoredUser() ?? null)
    read()
    // Not just on mount: this hook feeds the route guard in a layout that stays
    // mounted from the login screen into the panel.
    return onSessionChange(read)
  }, [])

  return {
    user: user ?? undefined,
    resolved: user !== undefined,
    isAdmin: user ? user.roles?.includes('admin') : undefined,
  }
}

export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial)
  return {
    isOpen,
    open: useCallback(() => setIsOpen(true), []),
    close: useCallback(() => setIsOpen(false), []),
    toggle: useCallback(() => setIsOpen((value) => !value), []),
  }
}
