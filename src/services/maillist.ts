import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface MailLists {
  orders: string[]
  visits: string[]
}

const mailListsRef = () => doc(db, 'settings', 'mailLists')

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const cleanList = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined
  const emails = value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean)
  return [...new Set(emails)]
}

/** Splits free text (one per line, or separated by comma/semicolon) into e-mails. */
export const parseEmails = (text: string): string[] => [
  ...new Set(
    text
      .split(/[\s,;]+/)
      .map((entry) => entry.trim())
      .filter(Boolean),
  ),
]

export const invalidEmails = (emails: string[]): string[] =>
  emails.filter((email) => !EMAIL_PATTERN.test(email))

export const MailListsService = {
  /**
   * Always read from Firestore (`settings/mailLists`), at send time — there are
   * no built-in lists. A list never saved comes back empty; a failed read throws,
   * so the caller can tell "nobody to notify" from "could not find out".
   */
  async get(): Promise<MailLists> {
    const snapshot = await getDoc(mailListsRef())
    const data = snapshot.exists() ? snapshot.data() : {}
    return {
      orders: cleanList(data.orders) ?? [],
      visits: cleanList(data.visits) ?? [],
    }
  },

  async save(lists: MailLists): Promise<void> {
    await setDoc(mailListsRef(), {
      orders: lists.orders,
      visits: lists.visits,
      updatedAt: new Date().toISOString(),
    })
  },
}
