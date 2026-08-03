import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import md5 from 'md5'
import { db } from '@/lib/firebase'
import type { User } from '@/lib/types'

const usersRef = collection(db, 'users')

export const LOGGED_USER_KEY = 'loggedUser'

/**
 * The hash every account is seeded with. Whoever still carries it is asked for
 * a new password before the session starts — there is no extra flag on the
 * document, the stored hash itself is the state, so it clears itself.
 */
export const DEFAULT_PASSWORD_HASH = '5c273221703c3246e7270a3cf6d03056'

export const MIN_PASSWORD_LENGTH = 8

/** A user read straight from Firestore, so the document id is known. */
export type IdentifiedUser = User & { id: string }

export type AuthResult = {
  user: IdentifiedUser
  /** The password on file is still the seeded one. */
  mustChangePassword: boolean
}

const unique = <T>(values: T[]) => [...new Set(values)]

/**
 * Firestore equality is exact, so the login has to reach the query shaped the
 * way it was seeded. Lower-cased first (that is what the old form wrote), then
 * as typed; both collapse to one candidate whenever the input has no capitals.
 */
const loginCandidates = (login: string) =>
  unique([login.trim().toLowerCase(), login.trim()]).filter(Boolean)

/**
 * The previous admin login lower-cased every field as it was typed — the
 * password included — and never trimmed anything, so the hashes sitting in
 * Firestore are all `md5(senha em minúsculas, com o que veio colado junto)`.
 * Every plausible reading of what was typed is tried, most-legacy first; for a
 * password without capitals or stray spaces they all collapse to a single hash.
 */
const hashCandidates = (password: string) =>
  unique([
    md5(password.trim().toLowerCase()),
    md5(password.trim()),
    md5(password.toLowerCase()),
    md5(password),
  ])

/** True for the seeded password typed in any of the forms above. */
export const isDefaultPassword = (password: string) =>
  hashCandidates(password).includes(DEFAULT_PASSWORD_HASH)

/** The message to show for a rejected new password, or `undefined` if it passes. */
export function validateNewPassword(password: string): string | undefined {
  const value = password.trim()
  if (value.length < MIN_PASSWORD_LENGTH)
    return `Use ao menos ${MIN_PASSWORD_LENGTH} caracteres.`
  if (isDefaultPassword(value)) return 'Escolha uma senha diferente da senha padrão.'
  return undefined
}

/**
 * Keeps only the fields the panel needs. The Firestore document also carries
 * the password hash, and the whole thing used to be persisted verbatim to
 * localStorage — dropping the extras here is what keeps the hash out of the
 * browser store, and it also throws away a session blob too broken to trust.
 */
function toUser(value: unknown, id?: string): User | undefined {
  if (!value || typeof value !== 'object') return undefined
  const raw = value as Record<string, unknown>

  const login = typeof raw.login === 'string' ? raw.login.trim() : ''
  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  // The login is the identity; a document missing its display name is still a
  // usable account, and refusing it here would surface as "senha incorreta".
  if (!login) return undefined

  return {
    id: id ?? (typeof raw.id === 'string' ? raw.id : undefined),
    login,
    name: name || login,
    email: typeof raw.email === 'string' ? raw.email.trim() : '',
    roles: Array.isArray(raw.roles)
      ? raw.roles.filter((role): role is string => typeof role === 'string')
      : [],
  }
}

/**
 * `/admin/login` and `/admin` share `app/admin/layout.tsx`, and the App Router
 * keeps a layout mounted across navigations between its own pages — so the
 * route guard living in that layout reads the session exactly once, before
 * anyone has signed in, and would still be holding that empty read when the
 * login page pushes to `/admin`. Signing in and out is announced instead of
 * sampled: this event for the current tab, `storage` for the others.
 */
const SESSION_EVENT = 'gotadecura:session'

function notifySessionChange() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(SESSION_EVENT))
}

/** Runs `listener` on every sign-in/sign-out. Returns the unsubscribe. */
export function onSessionChange(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  // A cleared store arrives as `key: null`.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === LOGGED_USER_KEY) listener()
  }

  window.addEventListener(SESSION_EVENT, listener)
  window.addEventListener('storage', onStorage)

  return () => {
    window.removeEventListener(SESSION_EVENT, listener)
    window.removeEventListener('storage', onStorage)
  }
}

export const UsersService = {
  LOGGED_USER_KEY,

  async getUserAuth(login: string, password: string): Promise<AuthResult | undefined> {
    for (const candidateLogin of loginCandidates(login)) {
      for (const hash of hashCandidates(password)) {
        const snapshot = await getDocs(
          query(
            usersRef,
            where('login', '==', candidateLogin),
            where('password', '==', hash),
          ),
        )

        const match = snapshot.docs[0]
        const user = match && toUser(match.data(), match.id)
        if (match && user) {
          // The query filtered on `hash`, so it is the hash on the document.
          return {
            user: { ...user, id: match.id },
            mustChangePassword: hash === DEFAULT_PASSWORD_HASH,
          }
        }
      }
    }

    return undefined
  },

  /**
   * Writes the new hash onto the user document. `md5(senha exata)` — the legacy
   * lower-casing stops here, while `hashCandidates` keeps recognising both
   * forms on the way in.
   */
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const invalid = validateNewPassword(newPassword)
    if (invalid) throw new Error(invalid)

    await updateDoc(doc(usersRef, userId), {
      password: md5(newPassword.trim()),
      passwordUpdatedAt: new Date().toISOString(),
    })
  },

  getStoredUser(): User | undefined {
    if (typeof window === 'undefined') return undefined

    let raw: string | null = null
    try {
      raw = localStorage.getItem(LOGGED_USER_KEY)
    } catch {
      return undefined
    }
    if (!raw) return undefined

    try {
      const user = toUser(JSON.parse(raw))
      if (!user) {
        localStorage.removeItem(LOGGED_USER_KEY)
        return undefined
      }
      // Sessions opened by the old login carry the whole document, password
      // hash included. Rewrite them clean on first read instead of waiting for
      // the next sign-in.
      const clean = JSON.stringify(user)
      if (clean !== raw) localStorage.setItem(LOGGED_USER_KEY, clean)
      return user
    } catch {
      localStorage.removeItem(LOGGED_USER_KEY)
      return undefined
    }
  },

  storeUser(user: User) {
    const clean = toUser(user, user.id)
    if (!clean) throw new Error('Usuário inválido.')
    localStorage.setItem(LOGGED_USER_KEY, JSON.stringify(clean))
    notifySessionChange()
  },

  signOut() {
    try {
      localStorage.removeItem(LOGGED_USER_KEY)
    } catch {
      // A blocked store means there was no session to drop either.
    }
    notifySessionChange()
  },
}
