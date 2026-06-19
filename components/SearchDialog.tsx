'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BookOpen,
  Hash,
  Loader2,
  MapPin,
  Search,
  TextQuote,
  X,
} from 'lucide-react'
import type { Book } from '@/lib/apocryphaTypes'
import {
  categoryLabel,
  highlightSegments,
  type SearchResult,
  type SearchResultType,
} from '@/lib/search'
import { useApocryphaSearch } from '@/hooks/useApocryphaSearch'

interface SearchDialogProps {
  books: Book[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectResult: (result: SearchResult) => void
}

const TYPE_META: Record<
  SearchResultType,
  { label: string; icon: typeof BookOpen }
> = {
  reference: { label: 'Reference', icon: MapPin },
  book: { label: 'Book', icon: BookOpen },
  verse: { label: 'Verse', icon: Hash },
  chapter: { label: 'Passage', icon: TextQuote },
}

function ResultSnippet({ text, query }: { text: string; query: string }) {
  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2)

  const segments = highlightSegments(text, terms)

  return (
    <p className="text-sm text-beige-600 dark:text-brown-400 line-clamp-2 font-serif mt-1">
      {segments.map((segment, i) =>
        segment.highlight ? (
          <mark
            key={i}
            className="search-highlight rounded px-0.5"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </p>
  )
}

export default function SearchDialog({
  books,
  open,
  onOpenChange,
  onSelectResult,
}: SearchDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const { query, setQuery, results, isSearching, hasQuery, reset } =
    useApocryphaSearch(books)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      reset()
      setActiveIndex(0)
    }
  }, [open, reset])

  useEffect(() => {
    setActiveIndex(0)
  }, [results])

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  const selectResult = useCallback(
    (result: SearchResult) => {
      onSelectResult(result)
      close()
    },
    [onSelectResult, close],
  )

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }

      if (results.length === 0) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (event.key === 'Enter') {
        event.preventDefault()
        const result = results[activeIndex]
        if (result) selectResult(result)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, results, activeIndex, close, selectResult])

  useEffect(() => {
    if (!listRef.current) return
    const active = listRef.current.querySelector('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] md:pt-[12vh]"
      role="presentation"
      onClick={close}
    >
      <div className="absolute inset-0 bg-beige-900/40 dark:bg-black/60 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search apocrypha texts"
        className="search-dialog relative w-full max-w-2xl card-surface shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-beige-300 dark:border-brown-700">
          <Search
            className="w-5 h-5 text-beige-500 dark:text-brown-400 shrink-0"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search text, books, or references (e.g. 1 Esdras 4:12, wisdom, Enoch)"
            className="flex-1 bg-transparent outline-none font-sans text-base text-beige-900 dark:text-brown-50 placeholder:text-beige-500 dark:placeholder:text-brown-500"
            aria-label="Search query"
            autoComplete="off"
            spellCheck={false}
          />
          {isSearching && (
            <Loader2
              className="w-4 h-4 animate-spin text-beige-500 dark:text-brown-400"
              aria-hidden="true"
            />
          )}
          <button
            type="button"
            onClick={close}
            className="p-1.5 rounded-lg btn-surface hover:shadow-md"
            aria-label="Close search"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div
          ref={listRef}
          className="search-results max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain"
        >
          {!hasQuery && (
            <div className="px-4 py-8 text-center">
              <p className="font-sans text-sm text-beige-600 dark:text-brown-400 mb-4">
                Search across all apocryphal texts
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['truth', 'wisdom', '1 Esdras 3', 'Gospel of Thomas', 'Enoch'].map(
                  (example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setQuery(example)}
                      className="px-3 py-1.5 rounded-full text-xs font-sans btn-surface hover:shadow-md"
                    >
                      {example}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {hasQuery && results.length === 0 && !isSearching && (
            <p className="px-4 py-8 text-center font-sans text-sm text-beige-600 dark:text-brown-400">
              No results for &ldquo;{query}&rdquo;. Try a book name, chapter
              reference, or different keywords.
            </p>
          )}

          {results.length > 0 && (
            <ul role="listbox" aria-label="Search results">
              {results.map((result, index) => {
                const meta = TYPE_META[result.type]
                const Icon = meta.icon
                const isActive = index === activeIndex

                return (
                  <li key={`${result.bookId}-${result.chapterId}-${result.verseNumber ?? ''}-${index}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      data-active={isActive}
                      onClick={() => selectResult(result)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`w-full text-left px-4 py-3 border-b border-beige-200/80 dark:border-brown-800/80 transition-colors ${
                        isActive
                          ? 'bg-amber-100/70 dark:bg-amber-900/25'
                          : 'hover:bg-beige-100/60 dark:hover:bg-brown-800/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          className="w-4 h-4 mt-1 text-beige-500 dark:text-brown-400 shrink-0"
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display font-semibold text-beige-900 dark:text-brown-50">
                              {result.reference}
                            </span>
                            <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-beige-200/80 dark:bg-brown-800 text-beige-700 dark:text-brown-300">
                              {meta.label}
                            </span>
                          </div>
                          <p className="text-xs font-sans text-beige-500 dark:text-brown-500 mt-0.5">
                            {result.bookName} · {categoryLabel(result.category)}
                          </p>
                          <ResultSnippet text={result.snippet} query={query} />
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-beige-300 dark:border-brown-700 flex items-center justify-between gap-4 text-xs font-sans text-beige-500 dark:text-brown-500">
          <span>
            <kbd className="search-kbd">↑↓</kbd> navigate
            <span className="mx-2">·</span>
            <kbd className="search-kbd">Enter</kbd> open
          </span>
          <span>
            <kbd className="search-kbd">Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  )
}

export function SearchTrigger({
  onClick,
  className = '',
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl btn-surface hover:shadow-md font-sans text-sm transition-all ${className}`}
      aria-label="Open search (Ctrl+K)"
    >
      <Search className="w-4 h-4" aria-hidden="true" />
      <span className="hidden sm:inline text-beige-600 dark:text-brown-400">
        Search
      </span>
      <kbd className="hidden md:inline search-kbd ml-1">Ctrl K</kbd>
    </button>
  )
}
