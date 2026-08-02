import { collection, getDocs, query, where } from 'firebase/firestore'
import md5 from 'md5'
import { db } from '@/lib/firebase'
import type { User } from '@/lib/types'

const usersRef = collection(db, 'users')

export const LOGGED_USER_KEY = 'loggedUser'

export const UsersService = {
  LOGGED_USER_KEY,

  async getUserAuth(login: string, password: string): Promise<User | undefined> {
    const snapshot = await getDocs(
      query(
        usersRef,
        where('login', '==', login),
        where('password', '==', md5(password)),
      ),
    )
    return snapshot.docs[0]?.data() as User | undefined
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
