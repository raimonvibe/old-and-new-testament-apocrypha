# Feature Spec — Apocrypha Reader

Match the UX and stack of [raimonvibe/bible-old-and-new-testament](https://github.com/raimonvibe/bible-old-and-new-testament)  
Live reference: [bible-new-testament.vercel.app](https://bible-new-testament.vercel.app/)

Reference clone on disk: `/home/stefan/Documenten/web-development/bible-reference-temp`

---

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 3
- Lucide React icons
- Local JSON data (no runtime external API)

---

## Core features (copy from reference)

| Feature | Implementation |
|---------|----------------|
| 3-step navigation | Books → chapters → reader (`view` state) |
| Cross-book prev/next | Jump across chapter/book boundaries |
| Verse display | `[1]` markers in content; toggle show/hide |
| Breadcrumbs | Home / Book / Chapter |
| Dark / light mode | `ThemeProvider` + localStorage + system preference |
| Read aloud | Web Speech API FAB; full page or selection; Alt+R / Alt+S |
| PWA | manifest.json, icons, theme-color |
| SEO | Open Graph, Twitter cards |
| Mobile | ViewportInsetsProvider, safe areas |

---

## Design system

| Element | Value |
|---------|-------|
| Headings | Playfair Display |
| Body | Merriweather |
| UI | Inter |
| Light bg | Beige gradient `#faf8f3` → `#d4c5a9` |
| Dark bg | Brown gradient `#1a120c` → `#3d2b1f` |
| Cards | Frosted `card-surface`, rounded-2xl |
| Selection | `bg-selection-gradient` on active book/chapter |

---

## Site structure (apocrypha-specific)

Replace reference app's **OT / NT** split with **three sections**:

```
1. Deuterocanonical        (17 books — /bib/apo)
2. OT Pseudepigrapha       (FBE + standalone: Enoch, Jubilees, etc.)
3. NT Apocrypha            (LBOB + Thomas, Didache, Gospel of Mary)
```

Same flow after section pick: book grid → chapter grid → reader.

---

## File structure (target)

```
old-and-new-testament-apocrypha/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── api/apocrypha-data/route.ts
├── components/
│   ├── BookSelector.tsx      # 3 sections instead of 2
│   ├── ChapterSelector.tsx
│   ├── BibleReader.tsx       # rename optional: ApocryphaReader
│   ├── ThemeToggle.tsx
│   ├── ThemeProvider.tsx
│   ├── ReadAloudToolbar.tsx
│   └── ViewportInsetsProvider.tsx
├── data/
│   └── apocrypha-data.json
├── docs/
│   ├── content-inventory.md
│   └── feature-spec.md
└── scripts/
    └── scrape-sacred-texts.js   # TBD
```

---

## Adaptations for apocrypha

| Reference | Apocrypha change |
|-----------|------------------|
| 66 WEB books | ~60+ titles across 3 categories |
| Always `[n]` verses | Fallback to paragraphs when no verse markers |
| `bibleName: "World English Bible"` | `"Sacred Texts Apocrypha"` |
| OT/NT in BookSelector | Deuterocanonical / OT Pseudepigrapha / NT Apocrypha |
| `category` field | Add `collection` (e.g. `fbe`, `lbob`, standalone) |

---

## Build phases

### Phase 1 — Scaffold
- Copy reference repo structure into this folder
- Rebrand title, metadata, footer
- Update `BookSelector` for 3 sections
- Wire API to empty/stub `apocrypha-data.json`

### Phase 2 — Content
- Scrape sacred-texts deuterocanonical books first
- Add LBOB and FBE collections
- Add standalone texts

### Phase 3 — Polish
- Read-aloud, PWA, favicons
- Attribution footer linking sacred-texts.com

---

## Data API

```typescript
interface ApocryphaData {
  bibleName: string
  bibleId: string
  books: Book[]
}

interface Book {
  id: string
  name: string
  abbreviation: string
  category: 'deuterocanonical' | 'ot-pseudepigrapha' | 'nt-apocrypha'
  collection?: string
  chapters: Chapter[]
}

interface Chapter {
  id: string
  number: string
  reference: string
  content: string
}
```

---

## Notes

- All sacred-texts translations used are public domain in the US (pre-1928).
- `PrayerChatWidget` exists in reference but is commented out — skip unless requested.
- Start scraping with deuterocanonical books (cleanest chapter structure).
