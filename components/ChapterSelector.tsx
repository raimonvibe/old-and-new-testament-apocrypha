'use client'

import { BookOpen, ChevronLeft } from 'lucide-react'

interface Chapter {
  id: string
  number: string
  reference: string
}

interface ChapterSelectorProps {
  bookName: string
  chapters: Chapter[]
  selectedChapterId: string | null
  onSelectChapter: (chapterId: string) => void
  onBack: () => void
}

export default function ChapterSelector({
  bookName,
  chapters,
  selectedChapterId,
  onSelectChapter,
  onBack,
}: ChapterSelectorProps) {
  return (
    <section data-read-aloud-block className="card-surface p-4 md:p-6 lg:p-8">
      <button
        data-read-aloud-ignore
        onClick={onBack}
        className="flex items-center gap-2 text-beige-700 hover:text-beige-900 dark:text-brown-300 dark:hover:text-brown-50 mb-6 transition-colors group"
        aria-label="Go back to book selection"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
        <span className="font-sans text-sm md:text-base">Back to Books</span>
      </button>

      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-beige-700 dark:text-brown-300" aria-hidden="true" />
        <h2 className="text-2xl md:text-3xl font-display font-bold text-beige-800 dark:text-brown-50">
          {bookName}
        </h2>
      </div>

      <nav data-read-aloud-ignore aria-label={`Chapter selection for ${bookName}`}>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-3">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => onSelectChapter(chapter.id)}
              aria-label={`Chapter ${chapter.number}`}
              aria-pressed={selectedChapterId === chapter.id}
              className={`
                aspect-square rounded-xl transition-all duration-200
                flex items-center justify-center font-display font-semibold text-base md:text-lg
                hover:scale-110 hover:shadow-lg
                ${
                  selectedChapterId === chapter.id
                    ? 'bg-selection-gradient text-white shadow-lg scale-110'
                    : 'btn-surface hover:shadow-md'
                }
              `}
            >
              {chapter.number}
            </button>
          ))}
        </div>
      </nav>
    </section>
  )
}
