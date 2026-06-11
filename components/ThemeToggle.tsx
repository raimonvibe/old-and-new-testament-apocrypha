'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="p-2.5 rounded-xl transition-all duration-200 hover:scale-105 shadow-md
        bg-white/70 hover:bg-white text-beige-800
        dark:bg-brown-800/80 dark:hover:bg-brown-700 dark:text-brown-100"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" aria-hidden="true" />
      ) : (
        <Sun className="w-5 h-5" aria-hidden="true" />
      )}
    </button>
  )
}
