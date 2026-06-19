export type BookCategory =
  | 'deuterocanonical'
  | 'ot-pseudepigrapha'
  | 'nt-apocrypha'

export interface Chapter {
  id: string
  number: string
  reference: string
  content: string
}

export interface Book {
  id: string
  name: string
  abbreviation: string
  category: BookCategory
  collection?: string
  chapters: Chapter[]
}

export interface ApocryphaData {
  bibleName: string
  bibleId: string
  books: Book[]
}
