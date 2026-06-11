'use client'

import { Book, ScrollText, Sparkles } from 'lucide-react'

type BookCategory = 'deuterocanonical' | 'ot-pseudepigrapha' | 'nt-apocrypha'

interface BookSelectorProps {
  books: Array<{
    id: string
    name: string
    abbreviation: string
    category: BookCategory
    chapters: Array<{ id: string }>
  }>
  selectedBookId: string | null
  onSelectBook: (bookId: string) => void
}

const SECTIONS: Array<{
  category: BookCategory
  title: string
  icon: typeof ScrollText
  iconClass: string
  ariaLabel: string
}> = [
  {
    category: 'deuterocanonical',
    title: 'Deuterocanonical',
    icon: ScrollText,
    iconClass: 'text-amber-700 dark:text-amber-500',
    ariaLabel: 'Deuterocanonical book selection',
  },
  {
    category: 'ot-pseudepigrapha',
    title: 'OT Pseudepigrapha',
    icon: Book,
    iconClass: 'text-emerald-700 dark:text-emerald-400',
    ariaLabel: 'Old Testament pseudepigrapha book selection',
  },
  {
    category: 'nt-apocrypha',
    title: 'NT Apocrypha',
    icon: Sparkles,
    iconClass: 'text-blue-700 dark:text-blue-400',
    ariaLabel: 'New Testament apocrypha book selection',
  },
]

export default function BookSelector({
  books,
  selectedBookId,
  onSelectBook,
}: BookSelectorProps) {
  const renderBookGrid = (
    booksList: BookSelectorProps['books'],
  ) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
      {booksList.map((book) => (
        <button
          key={book.id}
          onClick={() => onSelectBook(book.id)}
          aria-label={`${book.name}, ${book.chapters.length} chapter${book.chapters.length !== 1 ? 's' : ''}`}
          aria-pressed={selectedBookId === book.id}
          className={`
            p-3 md:p-4 rounded-xl transition-all duration-200
            text-left hover:scale-105 hover:shadow-lg
            ${
              selectedBookId === book.id
                ? 'bg-selection-gradient text-white shadow-lg scale-105'
                : 'btn-surface hover:shadow-md'
            }
          `}
        >
          <div className="font-display font-semibold text-sm md:text-base mb-1">
            {book.name}
          </div>
          <div
            className={`text-xs ${
              selectedBookId === book.id
                ? 'text-beige-100 dark:text-brown-100'
                : 'text-beige-600 dark:text-brown-400'
            }`}
            aria-hidden="true"
          >
            {book.chapters.length} chapter{book.chapters.length !== 1 ? 's' : ''}
          </div>
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-8">
      {SECTIONS.map(({ category, title, icon: Icon, iconClass, ariaLabel }) => {
        const sectionBooks = books.filter((book) => book.category === category)
        if (sectionBooks.length === 0) return null

        const chapterCount = sectionBooks.reduce(
          (sum, book) => sum + book.chapters.length,
          0,
        )

        return (
          <section
            key={category}
            data-read-aloud-block
            className="card-surface p-4 md:p-6 lg:p-8"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-beige-300 dark:border-brown-700">
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-7 h-7 md:w-8 md:h-8 ${iconClass}`}
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-beige-800 dark:text-brown-50">
                    {title}
                  </h2>
                  <p className="text-sm text-beige-600 dark:text-brown-400 font-sans mt-1">
                    {sectionBooks.length} book{sectionBooks.length !== 1 ? 's' : ''}{' '}
                    • {chapterCount} chapter{chapterCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            <nav data-read-aloud-ignore aria-label={ariaLabel}>
              {renderBookGrid(sectionBooks)}
            </nav>
          </section>
        )
      })}
    </div>
  )
}
