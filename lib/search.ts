import type { Book, BookCategory } from './apocryphaTypes'

export type SearchResultType = 'reference' | 'book' | 'verse' | 'chapter'

export interface SearchResult {
  type: SearchResultType
  bookId: string
  bookName: string
  chapterId: string
  chapterNumber: string
  reference: string
  verseNumber?: string
  snippet: string
  score: number
  category: BookCategory
}

export interface SearchIndexEntry {
  bookId: string
  bookName: string
  bookAbbrev: string
  category: BookCategory
  chapterId: string
  chapterNumber: string
  reference: string
  verseNumber?: string
  text: string
  normalizedText: string
}

export interface BookAlias {
  bookId: string
  alias: string
  normalized: string
}

const VERSE_SPLIT = /\s*\[(\d+)\]\s*/

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'in', 'to', 'for', 'is', 'it', 'that',
])

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(query: string): string[] {
  return normalize(query)
    .split(' ')
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t))
}

function stripVerseMarkers(content: string): string {
  return content.replace(/\[\d+\]/g, ' ').replace(/\s+/g, ' ').trim()
}

function splitVerses(
  content: string,
): Array<{ verseNumber: string; text: string }> {
  const parts = content.split(VERSE_SPLIT)
  const verses: Array<{ verseNumber: string; text: string }> = []
  let pendingVerse: string | null = null

  for (const part of parts) {
    if (!part) continue
    if (/^\d+$/.test(part)) {
      pendingVerse = part
      continue
    }
    const text = stripVerseMarkers(part).trim()
    if (!text) continue
    verses.push({
      verseNumber: pendingVerse ?? '1',
      text,
    })
    pendingVerse = null
  }

  if (verses.length === 0 && content.trim()) {
    return [{ verseNumber: '1', text: stripVerseMarkers(content) }]
  }

  return verses
}

function buildBookAliases(books: Book[]): BookAlias[] {
  const aliases: BookAlias[] = []

  for (const book of books) {
    const candidates = new Set<string>([
      book.name,
      book.abbreviation,
      book.id,
    ])

    const parenMatch = book.name.match(/\(([^)]+)\)/)
    if (parenMatch) candidates.add(parenMatch[1])

    const withoutArticle = book.name.replace(/^The\s+/i, '')
    if (withoutArticle !== book.name) candidates.add(withoutArticle)

    const firstWord = book.name.split(/\s+/).slice(-2).join(' ')
    if (firstWord.length >= 4) candidates.add(firstWord)

    for (const alias of candidates) {
      aliases.push({
        bookId: book.id,
        alias,
        normalized: normalize(alias),
      })
    }
  }

  return aliases.sort((a, b) => b.normalized.length - a.normalized.length)
}

export function buildSearchIndex(books: Book[]): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = []

  for (const book of books) {
    for (const chapter of book.chapters) {
      const verses = splitVerses(chapter.content)

      if (verses.length <= 1 && !chapter.content.includes('[')) {
        const text = stripVerseMarkers(chapter.content)
        entries.push({
          bookId: book.id,
          bookName: book.name,
          bookAbbrev: book.abbreviation,
          category: book.category,
          chapterId: chapter.id,
          chapterNumber: chapter.number,
          reference: chapter.reference,
          text,
          normalizedText: normalize(text),
        })
        continue
      }

      for (const verse of verses) {
        entries.push({
          bookId: book.id,
          bookName: book.name,
          bookAbbrev: book.abbreviation,
          category: book.category,
          chapterId: chapter.id,
          chapterNumber: chapter.number,
          reference: chapter.reference,
          verseNumber: verse.verseNumber,
          text: verse.text,
          normalizedText: normalize(verse.text),
        })
      }
    }
  }

  return entries
}

interface ParsedReference {
  bookId: string
  chapterNumber?: string
  verseNumber?: string
  score: number
}

function parseReference(
  query: string,
  books: Book[],
  aliases: BookAlias[],
): ParsedReference | null {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return null

  for (const { bookId, normalized } of aliases) {
    if (!normalizedQuery.startsWith(normalized)) continue

    const remainder = normalizedQuery.slice(normalized.length).trim()
    if (!remainder) {
      return { bookId, score: 100 }
    }

    const match = remainder.match(/^(\d+)(?:\s*[:\s]\s*(\d+))?$/)
    if (!match) continue

    return {
      bookId,
      chapterNumber: match[1],
      verseNumber: match[2],
      score: 120,
    }
  }

  const looseMatch = normalizedQuery.match(
    /^(\d+)\s+(.+?)(?:\s+(\d+)(?:\s*[:\s]\s*(\d+))?)?$/,
  )
  if (looseMatch) {
    const [, leadingNum, bookPart, chapterNum, verseNum] = looseMatch
    const target = normalize(`${leadingNum} ${bookPart}`)
    const book = aliases.find(
      (a) => a.normalized === target || a.normalized.startsWith(target),
    )
    if (book) {
      return {
        bookId: book.bookId,
        chapterNumber: chapterNum,
        verseNumber: verseNum,
        score: 110,
      }
    }
  }

  return null
}

function scoreBookNameMatch(book: Book, terms: string[], normalizedQuery: string): number {
  const name = normalize(book.name)
  const abbrev = normalize(book.abbreviation)

  if (name === normalizedQuery || abbrev === normalizedQuery) return 95
  if (name.includes(normalizedQuery) || abbrev.includes(normalizedQuery)) return 85

  let matched = 0
  for (const term of terms) {
    if (name.includes(term) || abbrev.includes(term)) matched++
  }
  if (matched === 0) return 0
  return 50 + (matched / terms.length) * 30
}

export function createSnippet(
  text: string,
  terms: string[],
  maxLength = 140,
): string {
  const normalized = normalize(text)
  let bestIndex = -1

  for (const term of terms) {
    const idx = normalized.indexOf(term)
    if (idx !== -1 && (bestIndex === -1 || idx < bestIndex)) {
      bestIndex = idx
    }
  }

  if (bestIndex === -1) {
    return text.length <= maxLength
      ? text
      : `${text.slice(0, maxLength).trim()}…`
  }

  const start = Math.max(0, bestIndex - 40)
  const excerpt = text.slice(start, start + maxLength).trim()
  const prefix = start > 0 ? '…' : ''
  const suffix = start + maxLength < text.length ? '…' : ''
  return `${prefix}${excerpt}${suffix}`
}

export interface HighlightSegment {
  text: string
  highlight: boolean
}

export function highlightSegments(
  text: string,
  terms: string[],
): HighlightSegment[] {
  if (terms.length === 0) return [{ text, highlight: false }]

  const pattern = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi',
  )
  const parts = text.split(pattern).filter(Boolean)

  return parts.map((part) => ({
    text: part,
    highlight: terms.some((t) => part.toLowerCase() === t.toLowerCase()),
  }))
}

const CATEGORY_LABELS: Record<BookCategory, string> = {
  deuterocanonical: 'Deuterocanonical',
  'ot-pseudepigrapha': 'OT Pseudepigrapha',
  'nt-apocrypha': 'NT Apocrypha',
}

export function categoryLabel(category: BookCategory): string {
  return CATEGORY_LABELS[category]
}

export function searchApocrypha(
  books: Book[],
  index: SearchIndexEntry[],
  aliases: BookAlias[],
  query: string,
  limit = 40,
): SearchResult[] {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const normalizedQuery = normalize(trimmed)
  const terms = tokenize(trimmed)
  const results: SearchResult[] = []
  const seen = new Set<string>()

  const addResult = (result: SearchResult) => {
    const key = `${result.bookId}:${result.chapterId}:${result.verseNumber ?? ''}:${result.type}`
    if (seen.has(key)) return
    seen.add(key)
    results.push(result)
  }

  const ref = parseReference(trimmed, books, aliases)
  if (ref) {
    const book = books.find((b) => b.id === ref.bookId)
    if (book) {
      if (ref.chapterNumber) {
        const chapter = book.chapters.find((c) => c.number === ref.chapterNumber)
        if (chapter) {
          if (ref.verseNumber) {
            const entry = index.find(
              (e) =>
                e.chapterId === chapter.id &&
                e.verseNumber === ref.verseNumber,
            )
            addResult({
              type: 'reference',
              bookId: book.id,
              bookName: book.name,
              chapterId: chapter.id,
              chapterNumber: chapter.number,
              reference: `${chapter.reference}:${ref.verseNumber}`,
              verseNumber: ref.verseNumber,
              snippet: entry
                ? createSnippet(entry.text, terms)
                : `Verse ${ref.verseNumber}`,
              score: ref.score + 20,
              category: book.category,
            })
          } else {
            addResult({
              type: 'reference',
              bookId: book.id,
              bookName: book.name,
              chapterId: chapter.id,
              chapterNumber: chapter.number,
              reference: chapter.reference,
              snippet: createSnippet(
                stripVerseMarkers(chapter.content),
                terms,
                100,
              ),
              score: ref.score,
              category: book.category,
            })
          }
        }
      } else {
        addResult({
          type: 'book',
          bookId: book.id,
          bookName: book.name,
          chapterId: book.chapters[0]?.id ?? '',
          chapterNumber: book.chapters[0]?.number ?? '1',
          reference: book.name,
          snippet: `${book.chapters.length} chapters`,
          score: ref.score,
          category: book.category,
        })
      }
    }
  }

  for (const book of books) {
    const bookScore = scoreBookNameMatch(book, terms, normalizedQuery)
    if (bookScore >= 70) {
      addResult({
        type: 'book',
        bookId: book.id,
        bookName: book.name,
        chapterId: book.chapters[0]?.id ?? '',
        chapterNumber: book.chapters[0]?.number ?? '1',
        reference: book.name,
        snippet: `${book.chapters.length} chapters · ${categoryLabel(book.category)}`,
        score: bookScore,
        category: book.category,
      })
    }
  }

  if (terms.length === 0) {
    return results.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  for (const entry of index) {
    let score = 0
    let matchedTerms = 0

    for (const term of terms) {
      if (entry.normalizedText.includes(term)) {
        matchedTerms++
        const occurrences = entry.normalizedText.split(term).length - 1
        score += 10 + Math.min(occurrences, 3)
      }
    }

    if (matchedTerms === 0) continue

    if (matchedTerms === terms.length) score += 15
    if (entry.normalizedText.includes(normalizedQuery)) score += 25

    const type: SearchResultType = entry.verseNumber ? 'verse' : 'chapter'

    addResult({
      type,
      bookId: entry.bookId,
      bookName: entry.bookName,
      chapterId: entry.chapterId,
      chapterNumber: entry.chapterNumber,
      reference: entry.verseNumber
        ? `${entry.reference}:${entry.verseNumber}`
        : entry.reference,
      verseNumber: entry.verseNumber,
      snippet: createSnippet(entry.text, terms),
      score,
      category: entry.category,
    })
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function prepareSearch(books: Book[]) {
  return {
    index: buildSearchIndex(books),
    aliases: buildBookAliases(books),
  }
}
