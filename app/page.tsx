'use client'

import { useState, useEffect } from 'react'
import BookSelector from '@/components/BookSelector'
import ChapterSelector from '@/components/ChapterSelector'
import BibleReader from '@/components/BibleReader'
import ThemeToggle from '@/components/ThemeToggle'
import SiteFooter from '@/components/SiteFooter'
import { BookMarked } from 'lucide-react'

interface Chapter {
  id: string
  number: string
  reference: string
  content: string
}

interface Book {
  id: string
  name: string
  abbreviation: string
  category: 'deuterocanonical' | 'ot-pseudepigrapha' | 'nt-apocrypha'
  collection?: string
  chapters: Chapter[]
}

interface ApocryphaData {
  bibleName: string
  bibleId: string
  books: Book[]
}

export default function Home() {
  const [apocryphaData, setApocryphaData] = useState<ApocryphaData | null>(null)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  const [view, setView] = useState<'books' | 'chapters' | 'reader'>('books')

  useEffect(() => {
    fetch('/api/apocrypha-data')
      .then((res) => res.json())
      .then((data) => setApocryphaData(data))
      .catch((err) => console.error('Failed to load apocrypha data:', err))
  }, [])

  const readAloudStopKey = `${view}-${selectedBookId ?? ''}-${selectedChapterId ?? ''}`

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('read-aloud-stop'))
  }, [readAloudStopKey])

  if (!apocryphaData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookMarked className="w-16 h-16 text-beige-600 dark:text-brown-400 mx-auto mb-4 animate-pulse" />
          <p className="text-beige-700 dark:text-brown-200 font-sans text-lg">
            Loading apocrypha texts...
          </p>
        </div>
      </div>
    )
  }

  const selectedBook = selectedBookId
    ? apocryphaData.books.find((b) => b.id === selectedBookId)
    : null

  const selectedChapter =
    selectedBook && selectedChapterId
      ? selectedBook.chapters.find((c) => c.id === selectedChapterId)
      : null

  const handleSelectBook = (bookId: string) => {
    setSelectedBookId(bookId)
    setSelectedChapterId(null)
    setView('chapters')
  }

  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId)
    setView('reader')
  }

  const handleBackToBooks = () => {
    setSelectedBookId(null)
    setSelectedChapterId(null)
    setView('books')
  }

  const handleBackToChapters = () => {
    setSelectedChapterId(null)
    setView('chapters')
  }

  const handlePrevChapter = () => {
    if (!selectedBook || !selectedChapterId || !apocryphaData) return
    const currentChapterIndex = selectedBook.chapters.findIndex(
      (c) => c.id === selectedChapterId,
    )

    if (currentChapterIndex > 0) {
      setSelectedChapterId(selectedBook.chapters[currentChapterIndex - 1].id)
    } else {
      const currentBookIndex = apocryphaData.books.findIndex(
        (b) => b.id === selectedBook.id,
      )
      if (currentBookIndex > 0) {
        const prevBook = apocryphaData.books[currentBookIndex - 1]
        setSelectedBookId(prevBook.id)
        setSelectedChapterId(prevBook.chapters[prevBook.chapters.length - 1].id)
      }
    }
  }

  const handleNextChapter = () => {
    if (!selectedBook || !selectedChapterId || !apocryphaData) return
    const currentChapterIndex = selectedBook.chapters.findIndex(
      (c) => c.id === selectedChapterId,
    )

    if (currentChapterIndex < selectedBook.chapters.length - 1) {
      setSelectedChapterId(selectedBook.chapters[currentChapterIndex + 1].id)
    } else {
      const currentBookIndex = apocryphaData.books.findIndex(
        (b) => b.id === selectedBook.id,
      )
      if (currentBookIndex < apocryphaData.books.length - 1) {
        const nextBook = apocryphaData.books[currentBookIndex + 1]
        setSelectedBookId(nextBook.id)
        setSelectedChapterId(nextBook.chapters[0].id)
      }
    }
  }

  const getCurrentChapterIndex = () => {
    if (!selectedBook || !selectedChapterId) return -1
    return selectedBook.chapters.findIndex((c) => c.id === selectedChapterId)
  }

  const hasPrev = (() => {
    if (!selectedBook || !apocryphaData) return false
    const currentChapterIndex = getCurrentChapterIndex()
    const currentBookIndex = apocryphaData.books.findIndex(
      (b) => b.id === selectedBook.id,
    )
    return currentChapterIndex > 0 || currentBookIndex > 0
  })()

  const hasNext = (() => {
    if (!selectedBook || !apocryphaData) return false
    const currentChapterIndex = getCurrentChapterIndex()
    const currentBookIndex = apocryphaData.books.findIndex(
      (b) => b.id === selectedBook.id,
    )
    return (
      currentChapterIndex < selectedBook.chapters.length - 1 ||
      currentBookIndex < apocryphaData.books.length - 1
    )
  })()

  const totalChapters = apocryphaData.books.reduce(
    (sum, book) => sum + book.chapters.length,
    0,
  )

  return (
    <div className="min-h-screen py-6 md:py-10 px-4 md:px-6 lg:px-8">
      <div className="fixed top-4 right-4 z-40" data-read-aloud-ignore>
        <ThemeToggle />
      </div>

      <div className="max-w-7xl mx-auto">
        <header data-read-aloud-ignore className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <BookMarked className="w-10 h-10 md:w-12 md:h-12 text-beige-700 dark:text-brown-300" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-beige-800 dark:text-brown-50 mb-3">
            Apocrypha Reader
          </h1>
          <p className="text-beige-600 dark:text-brown-300 font-sans text-base md:text-lg max-w-2xl mx-auto">
            Deuterocanonical books, Old Testament pseudepigrapha, and New
            Testament apocrypha from {apocryphaData.bibleName}
          </p>
        </header>

        <div className="mb-8">
          {view === 'books' && (
            <BookSelector
              books={apocryphaData.books}
              selectedBookId={selectedBookId}
              onSelectBook={handleSelectBook}
            />
          )}

          {view === 'chapters' && selectedBook && (
            <ChapterSelector
              bookName={selectedBook.name}
              chapters={selectedBook.chapters}
              selectedChapterId={selectedChapterId}
              onSelectChapter={handleSelectChapter}
              onBack={handleBackToBooks}
            />
          )}

          {view === 'reader' && selectedBook && selectedChapter && (
            <BibleReader
              bookName={selectedBook.name}
              chapter={selectedChapter}
              onBack={handleBackToChapters}
              onBackToBooks={handleBackToBooks}
              onPrevChapter={handlePrevChapter}
              onNextChapter={handleNextChapter}
              hasPrev={hasPrev}
              hasNext={hasNext}
            />
          )}
        </div>
      </div>

      <SiteFooter
        bibleName={apocryphaData.bibleName}
        bookCount={apocryphaData.books.length}
        chapterCount={totalChapters}
      />
    </div>
  )
}
