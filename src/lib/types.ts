export interface ProductType {
  id: string
  type: string
  typeLabel?: string
  description: string
  image: string
  mode: 'type' | 'category'
  seal?: string
  /** Featured categories claim more room in the catalogue grid. */
  featured?: boolean
  areaBackground?: string
  /** English label and description; `type` itself is a data key and never changes. */
  en?: { label: string; description: string }
}

export interface OptionsSetItem {
  name: string
  values: string[] | string
}

/** The visitor-facing text of a product in one extra language. */
export interface ProductTranslation {
  name?: string
  description?: string
  detailedDescription?: string
}

export interface ProductItem {
  id: string
  name: string
  price: number
  priceDiscount?: string
  oldPrice?: number
  description: string
  /** The main photo — always `images[0]` when `images` is set. */
  image: string
  /** Every photo of the product, main one first. Older products only have `image`. */
  images?: string[]
  detailedDescription?: string
  available?: boolean
  seal?: string
  optionsSet?: OptionsSetItem[]
  hidden?: boolean
  type?: string
  /** Special lines (`mode: 'category'`) the product also belongs to. */
  categories?: string[]
  urlName?: string
  amount?: number
  /** ISO date stamped when the product is first created; drives the "Novo" tag. */
  createdAt?: string
  /**
   * Text in languages other than Portuguese. The top-level fields stay the
   * Portuguese source — the team works in it and orders are recorded in it —
   * and any field missing here falls back to them. See `localizeProduct`.
   */
  translations?: { en?: ProductTranslation }
}

export interface CartItem extends ProductItem {
  amount: number
  type: string
  /** Chosen options, already folded into `name` as "Name (a, b)". */
  variants?: string[]
  /**
   * On a saved order: the line's name as the customer read it, when they
   * ordered in a language other than Portuguese. `name` stays Portuguese.
   */
  localizedName?: string
}

export interface Cart {
  items: CartItem[]
}

export interface ContactInfo {
  name: string
  phone: string
  email?: string
  city: string
  zipcode: string
  observations?: string
}

export interface Coupon {
  id?: string
  active: boolean
  code: string
  discount: number
  discountType: 'percentage' | 'fixed'
  startDate?: string
  endDate?: string
  notes?: string
}

export type CromatografiaType = 'oleo-essencial' | 'hidrolato'

export interface Cromatografia {
  id: string
  name: string
  scientificName: string
  url: string
  type: CromatografiaType
  viewCount?: number
  createdAt?: string
}

export interface EnrollmentData {
  name: string
  cellphone: string
  email: string
  companions: string[]
  lastVisit: string
  /** The site language the visitor signed up in; absent means Portuguese. */
  locale?: string
}

export interface Visit {
  id: string
  date: string
  value: number
  enrollments?: EnrollmentData[]
}

export interface Testimony {
  name: string
  message: string
  city?: string
  sentAt: string
}

export interface User {
  /** Firestore document id — absent on sessions stored by the previous login. */
  id?: string
  login: string
  email: string
  name: string
  roles: string[]
}

export interface OrderStatusLog {
  userName: string
  oldStatus: string
  newStatus: string
  updatedAt: string
}

export interface OrderComment {
  userName: string
  comment: string
  createdAt: string
}

export interface Order {
  id: string
  orderId: number
  items: CartItem[]
  contactInfo: ContactInfo
  status: string
  createdAt: string
  coupon?: { number: string; discount: number; discountType: 'percentage' | 'fixed' } | ''
  statusLogs?: OrderStatusLog[]
  comments?: OrderComment[]
  /** The site language the order was placed in; absent means Portuguese. */
  locale?: string
}

/**
 * Blog posts are files on disk, not Firestore documents — see `src/lib/blog.ts`.
 * `PostSummary` is everything a listing needs; `Post` adds the body.
 */
export interface PostSummary {
  slug: string
  title: string
  excerpt: string
  author: string
  publishedAt: string
  readingTime: number
  tags: string[]
  featured: boolean
  image?: string
}

export interface Post extends PostSummary {
  content: string
  tldr: string[]
}

/**
 * A video from the YouTube channel's public RSS feed — see
 * `src/services/youtube.ts`. The feed carries only the last ~15 uploads.
 */
export interface YoutubeVideo {
  /** YouTube video id, e.g. "4g6LPXblvuE". */
  id: string
  title: string
  /** Plain-text description; may be empty. */
  description: string
  /** ISO 8601 publish date. */
  publishedAt: string
  /** Canonical watch URL. */
  url: string
  /** `hqdefault` thumbnail URL. */
  thumbnail: string
  /** View count when the feed reported one, else `null`. */
  views: number | null
}
