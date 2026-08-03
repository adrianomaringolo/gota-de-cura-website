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
}

export interface OptionsSetItem {
  name: string
  values: string[] | string
}

export interface ProductItem {
  id: string
  name: string
  price: number
  priceDiscount?: string
  oldPrice?: number
  description: string
  image: string
  detailedDescription?: string
  available?: boolean
  seal?: string
  optionsSet?: OptionsSetItem[]
  hidden?: boolean
  type?: string
  urlName?: string
  amount?: number
  /** ISO date stamped when the product is first created; drives the "Novo" tag. */
  createdAt?: string
}

export interface CartItem extends ProductItem {
  amount: number
  type: string
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
