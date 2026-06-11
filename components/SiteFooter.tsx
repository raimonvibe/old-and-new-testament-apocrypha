interface SiteFooterProps {
  bibleName: string
  bookCount: number
  chapterCount: number
}

const SOCIAL_LINKS = [
  {
    href: 'https://www.raimonvibe.com/',
    label: 'Website',
    icon: 'fas fa-globe',
    className:
      'bg-brown-800 hover:bg-amber-700 dark:bg-amber-900/90 dark:hover:bg-amber-600',
  },
  {
    href: 'https://x.com/raimonvibe/',
    label: 'X',
    icon: 'fa-brands fa-x-twitter',
    className:
      'bg-brown-800 hover:bg-neutral-900 dark:bg-stone-600 dark:hover:bg-neutral-900',
  },
  {
    href: 'https://zaap.bio/raimonvibe',
    label: 'Zaap',
    icon: 'fas fa-link',
    className:
      'bg-brown-800 hover:bg-violet-600 dark:bg-violet-900/90 dark:hover:bg-violet-500',
  },
  {
    href: 'https://www.instagram.com/raimonvibe/',
    label: 'Instagram',
    icon: 'fab fa-instagram',
    className:
      'bg-brown-800 hover:bg-pink-600 dark:bg-pink-900/90 dark:hover:bg-pink-500',
  },
  {
    href: 'https://www.youtube.com/channel/UCDGDNuYb2b2Ets9CYCNVbuA/videos/',
    label: 'YouTube',
    icon: 'fab fa-youtube',
    className:
      'bg-brown-800 hover:bg-red-600 dark:bg-red-900/90 dark:hover:bg-red-500',
  },
  {
    href: 'https://github.com/raimonvibe/',
    label: 'GitHub',
    icon: 'fab fa-github',
    className:
      'bg-brown-800 hover:bg-neutral-700 dark:bg-neutral-600 dark:hover:bg-neutral-300',
  },
] as const

export default function SiteFooter({
  bibleName,
  bookCount,
  chapterCount,
}: SiteFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer
      data-read-aloud-ignore
      className="mt-10 border-t border-beige-300/80 dark:border-brown-700/80 bg-gradient-to-b from-transparent to-beige-200/40 dark:to-brown-950/60"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="text-center md:text-left">
            <h5 className="font-display font-semibold text-lg text-beige-900 dark:text-brown-50 mb-3">
              Apocrypha Reader
            </h5>
            <p className="font-sans text-sm text-beige-700 dark:text-brown-300 mb-4">
              {bibleName} · {bookCount} books · {chapterCount} chapters
            </p>
            <p className="font-sans text-sm text-beige-700 dark:text-brown-300 leading-relaxed">
              Made with care for readers of sacred texts. Texts from{' '}
              <a
                href="https://www.sacred-texts.com/chr/apo/index.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-beige-900 dark:text-brown-100 underline underline-offset-2 hover:text-beige-950 dark:hover:text-brown-50 transition-colors"
              >
                sacred-texts.com
              </a>
            </p>
          </div>

          <div className="text-center md:text-left">
            <h5 className="font-display font-semibold text-lg text-beige-900 dark:text-brown-50 mb-4">
              Connect with Raimon
            </h5>
            <ul className="grid grid-cols-3 sm:grid-cols-6 gap-3 list-none p-0 m-0 max-w-sm mx-auto md:mx-0 md:max-w-none">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 text-white shadow-md ring-1 ring-black/10 dark:ring-white/10 [&_i]:text-white ${link.className}`}
                  >
                    <i className={link.icon} aria-hidden="true" />
                    <span className="sr-only">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-beige-300/80 dark:border-brown-700/80 mt-8 pt-8 text-center">
          <p className="font-sans text-sm text-beige-700 dark:text-brown-300">
            &copy; {year}{' '}
            <a
              href="https://github.com/raimonvibe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-beige-900 dark:text-brown-100 underline underline-offset-2 hover:text-beige-950 dark:hover:text-brown-50 transition-colors"
            >
              raimonvibe
            </a>
            . MIT License.
          </p>
        </div>
      </div>
    </footer>
  )
}
