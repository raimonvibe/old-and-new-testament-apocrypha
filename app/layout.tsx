import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import ViewportInsetsProvider from '@/components/ViewportInsetsProvider'
import ReadAloudToolbar from '@/components/ReadAloudToolbar'

const themeInitScript = `(function(){try{var t=localStorage.getItem('apocrypha-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`

export const metadata: Metadata = {
  title: 'Apocrypha Reader — Deuterocanonical, Pseudepigrapha & NT Apocrypha',
  description:
    'Read deuterocanonical books, Old Testament pseudepigrapha, and New Testament apocrypha in a beautiful, modern interface. Texts from sacred-texts.com.',
  keywords: [
    'Apocrypha',
    'Deuterocanonical',
    'Pseudepigrapha',
    'Lost Books of the Bible',
    'Forgotten Books of Eden',
    'Sacred Texts',
    'Scripture',
    'Reading',
  ],
  authors: [{ name: 'Apocrypha Reader' }],
  creator: 'Apocrypha Reader',
  publisher: 'Apocrypha Reader',
  metadataBase: new URL('https://apocrypha-reader.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Apocrypha Reader',
    description:
      'Read deuterocanonical books, OT pseudepigrapha, and NT apocrypha in a beautiful, modern interface.',
    url: 'https://apocrypha-reader.vercel.app',
    siteName: 'Apocrypha Reader',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Apocrypha Reader — read apocryphal texts online',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apocrypha Reader',
    description:
      'Read deuterocanonical books, OT pseudepigrapha, and NT apocrypha in a beautiful, modern interface.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Apocrypha',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f1e8' },
    { media: '(prefers-color-scheme: dark)', color: '#2c1f14' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ViewportInsetsProvider />
        <main id="main-content">
          <ThemeProvider>{children}</ThemeProvider>
        </main>
        <ReadAloudToolbar />
      </body>
    </html>
  )
}
