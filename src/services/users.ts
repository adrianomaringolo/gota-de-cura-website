import { collection, getDocs, query, where } from 'firebase/firestore'
import md5 from 'md5'
import { db } from '@/lib/firebase'
import type { User } from '@/lib/types'

const usersRef = collection(db, 'users')

export const LOGGED_USER_KEY = 'loggedUser'

export const UsersService = {
  LOGGED_USER_KEY,

  /**
   * The previous admin login lower-cased every field as it was typed — the
   * password included — so the hashes sitting in Firestore are all
   * `md5(senha em minúsculas)`. Hashing the password as typed locks out anyone
   * whose password has a capital in it, so the legacy form is tried first and
   * the as-typed form only as a fallback, for any hash seeded correctly later.
   *
   * Both attempts keep the original query shape (two equality filters) so the
   * existing security rules and indexes still apply.
   */
  async getUserAuth(login: string, password: string): Promise<User | undefined> {
    const candidates = [...new Set([md5(password.toLowerCase()), md5(password)])]

    for (const hash of candidates) {
      const snapshot = await getDocs(
        query(usersRef, where('login', '==', login), where('password', '==', hash)),
      )
      const user = snapshot.docs[0]?.data() as User | undefined
      if (user) return user
    }

    return undefined
  },

  getStoredUser(): User | undefined {
    if (typeof window === 'undefined') return undefined
    try {
      const raw = localStorage.getItem(LOGGED_USER_KEY)
      return raw ? (JSON.parse(raw) as User) : undefined
    } catch {
      return undefined
    }
  },

  storeUser(user: User) {
    localStorage.setItem(LOGGED_USER_KEY, JSON.stringify(user))
  },

  signOut() {
    localStorage.removeItem(LOGGED_USER_KEY)
  },
}
