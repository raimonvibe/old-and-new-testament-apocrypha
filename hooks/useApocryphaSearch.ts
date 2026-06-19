'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Book } from '@/lib/apocryphaTypes'
import {
  prepareSearch,
  searchApocrypha,
  type SearchResult,
} from '@/lib/search'

export function useApocryphaSearch(books: Book[] | null, debounceMs = 200) {
  const searchData = useMemo(
    () => (books ? prepareSearch(books) : null),
    [books],
  )

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery('')
      return
    }

    setIsSearching(true)
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query)
      setIsSearching(false)
    }, debounceMs)

    return () => window.clearTimeout(timer)
  }, [query, debounceMs])

  useEffect(() => {
    if (!books || !searchData || !debouncedQuery.trim()) {
      setResults([])
      return
    }

    setResults(
      searchApocrypha(
        books,
        searchData.index,
        searchData.aliases,
        debouncedQuery,
      ),
    )
  }, [books, searchData, debouncedQuery])

  const reset = () => {
    setQuery('')
    setDebouncedQuery('')
    setResults([])
    setIsSearching(false)
  }

  return {
    query,
    setQuery,
    results,
    isSearching: isSearching && query.trim().length >= 2,
    hasQuery: query.trim().length >= 2,
    reset,
  }
}
