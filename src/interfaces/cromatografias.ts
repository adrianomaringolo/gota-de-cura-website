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
