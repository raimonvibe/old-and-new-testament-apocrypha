#!/usr/bin/env node

/**
 * Scrape apocryphal texts from sacred-texts.com (via archive.org mirror).
 *
 * Usage:
 *   node scripts/scrape-sacred-texts.js --category deuterocanonical
 *   node scripts/scrape-sacred-texts.js --category ot-pseudepigrapha
 *   node scripts/scrape-sacred-texts.js --category nt-apocrypha
 *   node scripts/scrape-sacred-texts.js --book tob
 *   node scripts/scrape-sacred-texts.js --category deuterocanonical --dry-run
 */

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const { promisify } = require('util')
const gunzip = promisify(zlib.gunzip)

const ARCHIVE_YEARS = ['2024', '2023', '2022']
const DELAY_MS = 400
const LBOB_DELAY_MS = 2500
const RETRY_ATTEMPTS = 5

const DEUTEROCANONICAL_BOOKS = [
  { slug: 'es1', id: 'ES1', name: '1 Esdras', abbreviation: '1 Esdras', chapters: 9 },
  { slug: 'es2', id: 'ES2', name: '2 Esdras', abbreviation: '2 Esdras', chapters: 16 },
  { slug: 'tob', id: 'TOB', name: 'Tobit', abbreviation: 'Tobit', chapters: 14 },
  { slug: 'jdt', id: 'JDT', name: 'Judith', abbreviation: 'Judith', chapters: 16 },
  { slug: 'aes', id: 'AES', name: 'Additions to Esther', abbreviation: 'Add. Esther', chapters: 6 },
  { slug: 'wis', id: 'WIS', name: 'Wisdom of Solomon', abbreviation: 'Wisdom', chapters: 19 },
  { slug: 'sir', id: 'SIR', name: 'Sirach', abbreviation: 'Sirach', chapters: 51 },
  { slug: 'bar', id: 'BAR', name: 'Baruch', abbreviation: 'Baruch', chapters: 6 },
  { slug: 'epj', id: 'EPJ', name: 'Epistle of Jeremiah', abbreviation: 'Ep. Jeremiah', chapters: 1 },
  { slug: 'aza', id: 'AZA', name: 'Prayer of Azariah', abbreviation: 'Azariah', chapters: 1 },
  { slug: 'sus', id: 'SUS', name: 'Susanna', abbreviation: 'Susanna', chapters: 1 },
  { slug: 'bel', id: 'BEL', name: 'Bel and the Dragon', abbreviation: 'Bel', chapters: 1 },
  { slug: 'man', id: 'MAN', name: 'Prayer of Manasseh', abbreviation: 'Manasseh', chapters: 1 },
  { slug: 'ma1', id: 'MA1', name: '1 Maccabees', abbreviation: '1 Maccabees', chapters: 16 },
  { slug: 'ma2', id: 'MA2', name: '2 Maccabees', abbreviation: '2 Maccabees', chapters: 15 },
  { slug: 'lao', id: 'LAO', name: 'Epistle to the Laodiceans', abbreviation: 'Laodiceans', chapters: 1 },
]

const LBOB_WORKS = [
  { file: 'lbob05.htm', id: 'LBOB01', name: 'Gospel of the Birth of Mary', abbreviation: 'Birth of Mary' },
  { file: 'lbob06.htm', id: 'LBOB02', name: 'The Protevangelion', abbreviation: 'Protevangelion' },
  { file: 'lbob07.htm', id: 'LBOB03', name: 'First Gospel of the Infancy of Jesus Christ', abbreviation: 'Infancy I' },
  { file: 'lbob08.htm', id: 'LBOB04', name: "Thomas's Gospel of the Infancy of Jesus Christ", abbreviation: 'Infancy II' },
  { file: 'lbob09.htm', id: 'LBOB05', name: 'Epistles of Jesus Christ and Abgarus', abbreviation: 'Abgarus' },
  { file: 'lbob10.htm', id: 'LBOB06', name: 'Gospel of Nicodemus', abbreviation: 'Nicodemus' },
  { file: 'lbob11.htm', id: 'LBOB07', name: "The Apostles' Creed", abbreviation: 'Apostles Creed' },
  // lbob12 Laodiceans — skipped (duplicate of deuterocanonical LAO)
  { file: 'lbob13.htm', id: 'LBOB08', name: 'Epistles of Paul and Seneca', abbreviation: 'Paul & Seneca' },
  { file: 'lbob14.htm', id: 'LBOB09', name: 'Acts of Paul and Thecla', abbreviation: 'Paul & Thecla' },
  { file: 'lbob15.htm', id: 'LBOB10', name: 'First Epistle of Clement', abbreviation: '1 Clement' },
  { file: 'lbob16.htm', id: 'LBOB11', name: 'Second Epistle of Clement', abbreviation: '2 Clement' },
  { file: 'lbob17.htm', id: 'LBOB12', name: 'Epistle of Barnabas', abbreviation: 'Barnabas' },
  { file: 'lbob18.htm', id: 'LBOB13', name: 'Epistle of Ignatius to the Ephesians', abbreviation: 'Ign. Ephesians' },
  { file: 'lbob19.htm', id: 'LBOB14', name: 'Epistle of Ignatius to the Magnesians', abbreviation: 'Ign. Magnesians' },
  { file: 'lbob20.htm', id: 'LBOB15', name: 'Epistle of Ignatius to the Trallians', abbreviation: 'Ign. Trallians' },
  { file: 'lbob21.htm', id: 'LBOB16', name: 'Epistle of Ignatius to the Romans', abbreviation: 'Ign. Romans' },
  { file: 'lbob22.htm', id: 'LBOB17', name: 'Epistle of Ignatius to the Philadelphians', abbreviation: 'Ign. Philadelphians' },
  { file: 'lbob23.htm', id: 'LBOB18', name: 'Epistle of Ignatius to the Smyrnæans', abbreviation: 'Ign. Smyrnæans' },
  { file: 'lbob24.htm', id: 'LBOB19', name: 'Epistle of Ignatius to Polycarp', abbreviation: 'Ign. Polycarp' },
  { file: 'lbob25.htm', id: 'LBOB20', name: 'Epistle of Polycarp to the Philippians', abbreviation: 'Polycarp' },
  { file: 'lbob26.htm', id: 'LBOB21', name: 'Shepherd of Hermas (Visions)', abbreviation: 'Hermas I' },
  { file: 'lbob27.htm', id: 'LBOB22', name: 'Shepherd of Hermas (Commands)', abbreviation: 'Hermas II' },
  { file: 'lbob28.htm', id: 'LBOB23', name: 'Shepherd of Hermas (Similitudes)', abbreviation: 'Hermas III' },
  { file: 'lbob29.htm', id: 'LBOB24', name: 'Letters of Herod and Pilate', abbreviation: 'Herod & Pilate' },
  { file: 'lbob30.htm', id: 'LBOB25', name: 'Lost Gospel According to Peter', abbreviation: 'Gospel of Peter' },
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function decodeHtml(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripTags(html) {
  return decodeHtml(html.replace(/<[^>]+>/g, ' '))
}

function archiveUrl(sitePath, year = ARCHIVE_YEARS[0]) {
  return `https://web.archive.org/web/${year}/https://www.sacred-texts.com/${sitePath}`
}

async function fetchPage(sitePath, { delayMs = DELAY_MS } = {}) {
  let lastError

  for (const year of ARCHIVE_YEARS) {
    const url = archiveUrl(sitePath, year)

    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; ApocryphaReaderScraper/1.0; educational)',
          },
        })
        if (res.ok) return res.text()

        if ([402, 429, 503].includes(res.status) && attempt < RETRY_ATTEMPTS) {
          const wait = delayMs * attempt * 5
          console.warn(
            `\n   ⏳ HTTP ${res.status} (${year}), retry ${attempt}/${RETRY_ATTEMPTS} in ${wait}ms...`,
          )
          await sleep(wait)
          continue
        }
        lastError = new Error(`HTTP ${res.status} for ${url}`)
        break
      } catch (err) {
        lastError = err
        if (attempt < RETRY_ATTEMPTS) {
          await sleep(delayMs * attempt * 3)
        }
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${sitePath}`)
}

function formatContent(verses) {
  return verses.map((v) => `     [${v.num}] ${v.text}`).join('\n')
}

function parseApoVerses(html) {
  const verses = []
  const pattern = /<p>\s*<a\s+name="(\d+)"[^>]*>(\d+)<\/a>\s*(?:&nbsp;|\s)([\s\S]*?)<\/p>/gi
  let match
  while ((match = pattern.exec(html)) !== null) {
    const num = parseInt(match[2], 10)
    const text = stripTags(match[3])
    if (text) verses.push({ num, text })
  }
  return verses
}

function isBoilerplateParagraph(text) {
  return (
    !text ||
    text.length < 3 ||
    /sacred-texts\.com|tease\.jpg|at sacred-texts/i.test(text) ||
    /^p\. \d+$/i.test(text)
  )
}

function parseJasherVerses(html) {
  const verses = []
  const pattern = /<p>\s*(\d+)\s+([\s\S]*?)(?=<p>|$)/gi
  let match
  while ((match = pattern.exec(html)) !== null) {
    const text = stripTags(match[2])
    if (text.length > 5) verses.push({ num: parseInt(match[1], 10), text })
  }
  return verses
}

function parseParagraphContent(html) {
  const apo = parseApoVerses(html)
  if (apo.length > 0) return apo

  const jasher = parseJasherVerses(html)
  if (jasher.length > 0) return jasher

  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html
  const verses = []
  const seen = new Set()

  const numberedPattern =
    /<p[^>]*>\s*(?:<small>[\s\S]*?<\/small>\s*)?(\d+)\s*(?:&para;)?\s*([\s\S]*?)<\/p>/gi
  let match
  while ((match = numberedPattern.exec(body)) !== null) {
    const text = stripTags(match[2])
    if (isBoilerplateParagraph(text)) continue
    const num = parseInt(match[1], 10)
    if (!seen.has(num)) {
      seen.add(num)
      verses.push({ num, text })
    }
  }
  if (verses.length > 0) {
    return verses.sort((a, b) => a.num - b.num)
  }

  const loosePattern = /<p>\s*([\s\S]*?)(?=<p>|<\/body>|$)/gi
  let looseN = 1
  while ((match = loosePattern.exec(body)) !== null) {
    const text = stripTags(match[1])
    if (isBoilerplateParagraph(text) || text.length < 40) continue
    verses.push({ num: looseN++, text })
  }
  if (verses.length > 0) return verses

  const plainPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi
  let n = 1
  while ((match = plainPattern.exec(body)) !== null) {
    const raw = match[1]
    if (/tease\.jpg|filenav|footnote|page_\d|img_|color="green"/i.test(raw)) continue
    if (/^<a name="page_/i.test(raw.trim())) continue
    const text = stripTags(raw)
    if (isBoilerplateParagraph(text)) continue
    verses.push({ num: n++, text })
  }
  return verses
}

function parseChapterTitle(html) {
  const h3 = html.match(/<h3[^>]*>([^<]+)<\/h3>/i)?.[1]
  if (h3) return decodeHtml(h3)
  const h4 = html.match(/<h4[^>]*>\s*CHAP\.\s*([IVXLC]+)\.\s*<\/h4>/i)?.[1]
  if (h4) return `Chapter ${h4}`
  return null
}

function referenceFromTitle(title, bookName, chapterNum) {
  if (!title) return `${bookName} ${chapterNum}`
  const cleaned = title
    .replace(/^Apocrypha:\s*/i, '')
    .replace(/^CHAP\.\s*/i, 'Chapter ')
    .replace(/\s+Chapter\s+[\dIVXLC]+$/i, '')
    .trim()
  return `${cleaned} ${chapterNum}`
}

function discoverChapterFiles(html, slug) {
  const pattern = new RegExp(`href="(${slug}\\d{3}\\.htm)"`, 'gi')
  const files = new Set()
  let match
  while ((match = pattern.exec(html)) !== null) {
    files.add(match[1].toLowerCase())
  }
  return [...files].sort()
}

function discoverChapterLinks(html, prefix) {
  const pattern = new RegExp(`href="(${prefix}\\d+\\.htm)">\\s*Chapter\\s+([^<]+)`, 'gi')
  const links = []
  let match
  while ((match = pattern.exec(html)) !== null) {
    links.push({ file: match[1].toLowerCase(), label: match[2].trim() })
  }
  return links
}

function chapterNumberFromFile(filename, slug) {
  const num = filename.replace(slug, '').replace('.htm', '')
  return String(parseInt(num, 10))
}

function makeBook({ id, name, abbreviation, category, collection, chapters }) {
  return { id, name, abbreviation, category, collection, chapters }
}

function makeChapter(bookId, number, reference, content) {
  return {
    id: `${bookId}.${number}`,
    number: String(number),
    reference,
    content: formatContent(content),
  }
}

async function scrapeDeuterocanonicalBook(book, { dryRun = false } = {}) {
  console.log(`\n📖 ${book.name} (${book.slug})`)
  const basePath = `bib/apo`

  const indexHtml = await fetchPage(`${basePath}/${book.slug}.htm`)
  await sleep(DELAY_MS)

  let chapterFiles = discoverChapterFiles(indexHtml, book.slug)
  if (chapterFiles.length === 0 && book.chapters === 1) {
    chapterFiles = [`${book.slug}001.htm`]
  }
  if (chapterFiles.length === 0) {
    chapterFiles = Array.from({ length: book.chapters }, (_, i) =>
      `${book.slug}${String(i + 1).padStart(3, '0')}.htm`,
    )
  }

  console.log(`   ${chapterFiles.length} chapter(s)`)
  const chapters = []

  for (const file of chapterFiles) {
    const chapterNum = chapterNumberFromFile(file, book.slug)
    process.stdout.write(`   ch ${chapterNum}...`)

    if (dryRun) {
      console.log(' (dry-run)')
      continue
    }

    const html = await fetchPage(`${basePath}/${file}`)
    await sleep(DELAY_MS)
    const verses = parseApoVerses(html)
    if (verses.length === 0) {
      console.log(' ⚠ no verses')
      continue
    }

    const title = parseChapterTitle(html)
    chapters.push(
      makeChapter(
        book.id,
        chapterNum,
        referenceFromTitle(title, book.name, chapterNum),
        verses,
      ),
    )
    console.log(` ✓ ${verses.length} verses`)
  }

  return makeBook({
    id: book.id,
    name: book.name,
    abbreviation: book.abbreviation,
    category: 'deuterocanonical',
    collection: 'apocrypha',
    chapters,
  })
}

function parseFbeIndex(html) {
  const books = []
  const chunks = html.split(/<h3[^>]*align="CENTER"[^>]*>/i).slice(1)

  for (const chunk of chunks) {
    const title = decodeHtml(chunk.slice(0, chunk.indexOf('</h3>')).trim())
    if (
      /^(Title|Contents|Illustrations|Preface|Introduction|Order|The Testaments of the Twelve)/i.test(
        title,
      )
    ) {
      continue
    }

    const links = [
      ...chunk.matchAll(/href="(fbe\d+\.htm)">\s*(Chapter|Ode)\s+([^.<]+)/gi),
    ]
    if (links.length === 0) continue

    books.push({
      title,
      files: links.map((m) => m[1].toLowerCase()),
    })
  }
  return books
}

function fbeBookMeta(title, index) {
  const id = `FBE${String(index + 1).padStart(2, '0')}`
  const abbrev = title
    .replace(/^The\s+/i, '')
    .replace(/^Testament of\s+/i, 'T. ')
    .slice(0, 20)
  return { id, name: title, abbreviation: abbrev }
}

async function scrapeFbeCollection({ dryRun = false } = {}) {
  console.log('\n═══ Forgotten Books of Eden ═══')
  const indexHtml = await fetchPage('bib/fbe/index.htm')
  await sleep(DELAY_MS)

  const bookDefs = parseFbeIndex(indexHtml)
  const books = []

  for (let i = 0; i < bookDefs.length; i++) {
    const def = bookDefs[i]
    const meta = fbeBookMeta(def.title, i)
    console.log(`\n📖 ${meta.name} (${def.files.length} chapters)`)

    const chapters = []
    for (let c = 0; c < def.files.length; c++) {
      const file = def.files[c]
      const chapterNum = String(c + 1)
      process.stdout.write(`   ch ${chapterNum}...`)

      if (dryRun) {
        console.log(' (dry-run)')
        continue
      }

      const html = await fetchPage(`bib/fbe/${file}`)
      await sleep(DELAY_MS)
      const verses = parseParagraphContent(html)
      if (verses.length === 0) {
        console.log(' ⚠ empty')
        continue
      }

      const title = parseChapterTitle(html)
      chapters.push(
        makeChapter(
          meta.id,
          chapterNum,
          referenceFromTitle(title, meta.name, chapterNum),
          verses,
        ),
      )
      console.log(` ✓ ${verses.length} paragraphs`)
    }

    if (!dryRun && chapters.length > 0) {
      books.push(
        makeBook({
          ...meta,
          category: 'ot-pseudepigrapha',
          collection: 'fbe',
          chapters,
        }),
      )
    }
  }

  return books
}

async function scrapeSlugChapters({
  collectionPath,
  prefix,
  id,
  name,
  abbreviation,
  category,
  collection,
  dryRun = false,
}) {
  console.log(`\n📖 ${name}`)
  const indexHtml = await fetchPage(`${collectionPath}/index.htm`)
  await sleep(DELAY_MS)

  const links = discoverChapterLinks(indexHtml, prefix)
  console.log(`   ${links.length} chapter(s)`)

  const chapters = []
  for (let i = 0; i < links.length; i++) {
    const { file, label } = links[i]
    const chapterNum = String(i + 1)
    process.stdout.write(`   ch ${chapterNum}...`)

    if (dryRun) {
      console.log(' (dry-run)')
      continue
    }

    const html = await fetchPage(`${collectionPath}/${file}`)
    await sleep(DELAY_MS)
    const verses = parseParagraphContent(html)
    if (verses.length === 0) {
      console.log(' ⚠ empty')
      continue
    }

    chapters.push(
      makeChapter(
        id,
        chapterNum,
        `${name} ${label.replace(/\.$/, '')}`,
        verses,
      ),
    )
    console.log(` ✓ ${verses.length} paragraphs`)
  }

  if (dryRun || chapters.length === 0) return null
  return makeBook({ id, name, abbreviation, category, collection, chapters })
}

async function scrapeJubilees({ dryRun = false } = {}) {
  console.log(`\n📖 Book of Jubilees`)
  const indexHtml = await fetchPage('bib/jub/index.htm')
  await sleep(DELAY_MS)

  const allFiles = [...indexHtml.matchAll(/href="(jub\d+\.htm)"/gi)].map((m) =>
    m[1].toLowerCase(),
  )
  const unique = [...new Set(allFiles)].sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ''), 10)
    const nb = parseInt(b.replace(/\D/g, ''), 10)
    return na - nb
  })
  // Skip front matter (title through prologue)
  const contentFiles = unique.filter((f) => {
    const n = parseInt(f.replace(/\D/g, ''), 10)
    return n >= 12
  })

  console.log(`   ${contentFiles.length} section(s)`)
  const chapters = []

  for (let i = 0; i < contentFiles.length; i++) {
    const file = contentFiles[i]
    const chapterNum = String(i + 1)
    process.stdout.write(`   ch ${chapterNum}...`)

    if (dryRun) {
      console.log(' (dry-run)')
      continue
    }

    const html = await fetchPage(`bib/jub/${file}`)
    await sleep(DELAY_MS)
    const verses = parseParagraphContent(html)
    if (verses.length === 0) {
      console.log(' ⚠ empty')
      continue
    }

    const title = parseChapterTitle(html) ?? `Section ${chapterNum}`
    chapters.push(
      makeChapter('JUB', chapterNum, `Jubilees — ${title}`, verses),
    )
    console.log(` ✓ ${verses.length} paragraphs`)
  }

  if (dryRun || chapters.length === 0) return null
  return makeBook({
    id: 'JUB',
    name: 'Book of Jubilees',
    abbreviation: 'Jubilees',
    category: 'ot-pseudepigrapha',
    collection: 'jub',
    chapters,
  })
}

function splitLbobChapters(html, bookName) {
  const parts = html.split(/<h4[^>]*>\s*CHAP\.\s*([IVXLC]+)\.\s*<\/h4>/i)
  if (parts.length <= 1) {
    const verses = parseParagraphContent(html)
    if (verses.length === 0) return []
    return [{ number: '1', reference: bookName, verses }]
  }

  const chapters = []
  const romanToNum = (r) => {
    const map = { I: 1, V: 5, X: 10, L: 50, C: 100 }
    let total = 0
    let prev = 0
    for (const ch of r) {
      const v = map[ch] ?? 0
      total += v < prev ? -v : v
      prev = v
    }
    return total
  }

  for (let i = 1; i < parts.length; i += 2) {
    const roman = parts[i]
    const body = parts[i + 1] ?? ''
    const verses = parseParagraphContent(body)
    if (verses.length === 0) continue
    const num = romanToNum(roman) || chapters.length + 1
    chapters.push({
      number: String(num),
      reference: `${bookName} ${num}`,
      verses,
    })
  }
  return chapters
}

async function scrapeLbobCollection({ dryRun = false } = {}) {
  console.log('\n═══ Lost Books of the Bible ═══')
  const books = []

  for (const work of LBOB_WORKS) {
    console.log(`\n📖 ${work.name}`)
    process.stdout.write(`   fetching...`)

    if (dryRun) {
      console.log(' (dry-run)')
      continue
    }

    let html
    try {
      html = await fetchPage(`bib/lbob/${work.file}`, { delayMs: LBOB_DELAY_MS })
    } catch (err) {
      console.log(` ✗ ${err.message}`)
      continue
    }
    await sleep(LBOB_DELAY_MS)

    const chapterDefs = splitLbobChapters(html, work.name)
    if (chapterDefs.length === 0) {
      const verses = parseParagraphContent(html)
      if (verses.length > 0) {
        chapterDefs.push({ number: '1', reference: work.name, verses })
      }
    }

    console.log(` ${chapterDefs.length} chapter(s)`)

    const chapters = chapterDefs.map((ch) =>
      makeChapter(work.id, ch.number, ch.reference, ch.verses),
    )

    if (chapters.length > 0) {
      books.push(
        makeBook({
          id: work.id,
          name: work.name,
          abbreviation: work.abbreviation,
          category: 'nt-apocrypha',
          collection: 'lbob',
          chapters,
        }),
      )
    }
  }

  return books
}

async function scrapeGospelOfThomas({ dryRun = false } = {}) {
  console.log(`\n📖 Gospel of Thomas`)
  const html = await fetchPage('chr/thomas.htm')
  await sleep(DELAY_MS)

  const pre = html.match(/<pre>([\s\S]*?)<\/pre>/i)?.[1] ?? ''
  const section = pre.split(/II:\s*Coptic Gospel of Thomas/i)[1]?.split(/III:/i)[0] ?? pre

  const sayings = []
  const pattern = /(?:^|\n)\s*(\d+)\)\s+([\s\S]*?)(?=\n\s*\d+\)|$)/g
  let match
  while ((match = pattern.exec(section)) !== null) {
    const text = match[2].replace(/\s+/g, ' ').trim()
    if (text.length > 10) {
      sayings.push({ num: parseInt(match[1], 10), text })
    }
  }

  console.log(`   ${sayings.length} saying(s)`)
  if (dryRun) return null

  const chapters = sayings.map((s) =>
    makeChapter('THO', String(s.num), `Gospel of Thomas ${s.num}`, [s]),
  )

  return makeBook({
    id: 'THO',
    name: 'Gospel of Thomas',
    abbreviation: 'Thomas',
    category: 'nt-apocrypha',
    collection: 'standalone',
    chapters,
  })
}

async function scrapeGospelOfMary({ dryRun = false } = {}) {
  console.log(`\n📖 Gospel of Mary`)
  const html = await fetchPage('chr/apo/marym.htm')
  await sleep(DELAY_MS)

  const verses = parseParagraphContent(html)
  console.log(`   ${verses.length} paragraph(s)`)
  if (dryRun || verses.length === 0) return null

  return makeBook({
    id: 'MARY',
    name: 'Gospel of Mary',
    abbreviation: 'Mary',
    category: 'nt-apocrypha',
    collection: 'standalone',
    chapters: [makeChapter('MARY', '1', 'Gospel of Mary', verses)],
  })
}

async function scrapeOtPseudepigrapha({ dryRun = false } = {}) {
  const books = []
  books.push(...(await scrapeFbeCollection({ dryRun })))

  const boe = await scrapeSlugChapters({
    collectionPath: 'bib/boe',
    prefix: 'boe',
    id: 'ENO',
    name: 'Book of Enoch (1 Enoch)',
    abbreviation: '1 Enoch',
    category: 'ot-pseudepigrapha',
    collection: 'boe',
    dryRun,
  })
  if (boe) books.push(boe)

  const jub = await scrapeJubilees({ dryRun })
  if (jub) books.push(jub)

  const bap = await scrapeSlugChapters({
    collectionPath: 'bib/bap',
    prefix: 'bap',
    id: 'BAP',
    name: 'Biblical Antiquities of Philo',
    abbreviation: 'Antiquities',
    category: 'ot-pseudepigrapha',
    collection: 'bap',
    dryRun,
  })
  if (bap) books.push(bap)

  return books
}

async function scrapeNtApocrypha({ dryRun = false } = {}) {
  const books = []
  books.push(...(await scrapeLbobCollection({ dryRun })))

  const thomas = await scrapeGospelOfThomas({ dryRun })
  if (thomas) books.push(thomas)

  const mary = await scrapeGospelOfMary({ dryRun })
  if (mary) books.push(mary)

  return books
}

async function fetchGzipText(sitePath) {
  const url = archiveUrl(sitePath)
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ApocryphaReaderScraper/1.0 (educational)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const text = (await gunzip(buf)).toString('utf8')
  return text
}

async function scrapeDidache({ dryRun = false } = {}) {
  console.log('\n📖 Didache (from sacred-texts did.txt.gz)')
  const text = await fetchGzipText('chr/did/did.txt.gz')
  await sleep(DELAY_MS)

  const start = text.indexOf('THE TEACHING OF THE TWELVE APOSTLES.')
  const end = text.indexOf('Footnotes', start)
  const body = text.slice(start, end > start ? end : undefined)
  const parts = body.split(/\n\s*([IVXLC]+)\.\s+/)

  const chapters = []
  for (let i = 1; i < parts.length; i += 2) {
    const roman = parts[i]
    const content = parts[i + 1] ?? ''
    const cleaned = content
      .replace(/\[p\. \d+\]/g, '')
      .replace(/\[\*\d+\]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (!cleaned || cleaned.length < 30) continue

    const num = chapters.length + 1
    chapters.push({
      number: String(num),
      reference: `Didache ${roman}`,
      verses: [{ num: 1, text: cleaned }],
    })
  }

  console.log(`   ${chapters.length} chapter(s)`)
  if (dryRun) return null

  return makeBook({
    id: 'DID',
    name: 'Didache',
    abbreviation: 'Didache',
    category: 'nt-apocrypha',
    collection: 'did',
    chapters: chapters.map((ch) =>
      makeChapter('DID', ch.number, ch.reference, ch.verses),
    ),
  })
}

async function scrapeLaurenceEnoch({ dryRun = false } = {}) {
  console.log('\n📖 Book of Enoch the Prophet (Laurence)')
  const files = ['bep02.htm', 'bep03.htm', 'bep04.htm', 'bep05.htm', 'bep06.htm', 'bep07.htm']
  const labels = ['I–XX', 'XXI–XL', 'XLI–LX', 'LXI–LXXX', 'LXXXI–C', 'C–CV']
  const chapters = []

  for (let i = 0; i < files.length; i++) {
    process.stdout.write(`   section ${i + 1}...`)
    if (dryRun) {
      console.log(' (dry-run)')
      continue
    }
    const html = await fetchPage(`bib/bep/${files[i]}`)
    await sleep(DELAY_MS)
    const verses = parseParagraphContent(html)
    if (verses.length === 0) {
      console.log(' ⚠ empty')
      continue
    }
    chapters.push(
      makeChapter('BEP', String(i + 1), `Enoch (Laurence) ${labels[i]}`, verses),
    )
    console.log(` ✓ ${verses.length} paragraphs`)
  }

  if (dryRun || chapters.length === 0) return null
  return makeBook({
    id: 'BEP',
    name: 'Book of Enoch the Prophet',
    abbreviation: 'Enoch (Laurence)',
    category: 'ot-pseudepigrapha',
    collection: 'bep',
    chapters,
  })
}

async function scrapeSinglePageBook({
  sitePath,
  id,
  name,
  abbreviation,
  category,
  collection,
  dryRun,
}) {
  console.log(`\n📖 ${name}`)
  if (dryRun) return null

  const html = await fetchPage(sitePath)
  await sleep(DELAY_MS)
  const verses = parseParagraphContent(html)
  console.log(`   ${verses.length} paragraph(s)`)
  if (verses.length === 0) return null

  return makeBook({
    id,
    name,
    abbreviation,
    category,
    collection,
    chapters: [makeChapter(id, '1', name, verses)],
  })
}

async function scrapeJasher({ dryRun = false } = {}) {
  console.log('\n📖 Book of Jasher')
  const indexHtml = await fetchPage('chr/apo/jasher/index.htm')
  await sleep(DELAY_MS)

  const files = [...indexHtml.matchAll(/href="(\d+)\.htm"/gi)]
    .map((m) => `${m[1]}.htm`)
    .filter((f, i, arr) => arr.indexOf(f) === i)
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))

  console.log(`   ${files.length} chapter(s)`)
  const chapters = []

  for (const file of files) {
    const chapterNum = file.replace('.htm', '')
    process.stdout.write(`   ch ${chapterNum}...`)
    if (dryRun) {
      console.log(' (dry-run)')
      continue
    }
    const html = await fetchPage(`chr/apo/jasher/${file}`)
    await sleep(DELAY_MS)
    const verses = parseParagraphContent(html)
    if (verses.length === 0) {
      console.log(' ⚠ empty')
      continue
    }
    chapters.push(makeChapter('JAS', chapterNum, `Jasher ${chapterNum}`, verses))
    console.log(` ✓ ${verses.length} verses`)
  }

  if (dryRun || chapters.length === 0) return null
  return makeBook({
    id: 'JAS',
    name: 'Book of Jasher',
    abbreviation: 'Jasher',
    category: 'ot-pseudepigrapha',
    collection: 'jasher',
    chapters,
  })
}

async function scrapeSibyllineOracles({ dryRun = false } = {}) {
  console.log('\n📖 Sibylline Oracles')
  const files = Array.from({ length: 12 }, (_, i) => `sib${String(i + 3).padStart(2, '0')}.htm`)
  const chapters = []

  for (let i = 0; i < files.length; i++) {
    process.stdout.write(`   book ${i + 1}...`)
    if (dryRun) {
      console.log(' (dry-run)')
      continue
    }
    const html = await fetchPage(`cla/sib/${files[i]}`)
    await sleep(DELAY_MS)
    const verses = parseParagraphContent(html)
    if (verses.length === 0) {
      console.log(' ⚠ empty')
      continue
    }
    chapters.push(makeChapter('SIB', String(i + 1), `Sibylline Oracles ${i + 1}`, verses))
    console.log(` ✓ ${verses.length} paragraphs`)
  }

  if (dryRun || chapters.length === 0) return null
  return makeBook({
    id: 'SIB',
    name: 'Sibylline Oracles',
    abbreviation: 'Sibyllines',
    category: 'ot-pseudepigrapha',
    collection: 'sib',
    chapters,
  })
}

async function scrapeChroniclesOfJerahmeel({ dryRun = false } = {}) {
  console.log('\n📖 Chronicles of Jerahmeel')
  const indexHtml = await fetchPage('bib/coj/index.htm')
  await sleep(DELAY_MS)

  const files = [...indexHtml.matchAll(/href="(coj\d+\.htm)"/gi)]
    .map((m) => m[1].toLowerCase())
    .filter((f, i, arr) => arr.indexOf(f) === i)
    .filter((f) => {
      const n = parseInt(f.replace(/\D/g, ''), 10)
      return n >= 5
    })
    .sort((a, b) => parseInt(a.replace(/\D/g, ''), 10) - parseInt(b.replace(/\D/g, ''), 10))

  console.log(`   ${files.length} section(s)`)
  const chapters = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const chapterNum = String(i + 1)
    process.stdout.write(`   ch ${chapterNum}...`)
    if (dryRun) {
      console.log(' (dry-run)')
      continue
    }
    const html = await fetchPage(`bib/coj/${file}`)
    await sleep(DELAY_MS)
    const verses = parseParagraphContent(html)
    if (verses.length === 0) {
      console.log(' ⚠ empty')
      continue
    }
    const title = parseChapterTitle(html) ?? `Section ${chapterNum}`
    chapters.push(makeChapter('COJ', chapterNum, `Jerahmeel — ${title}`, verses))
    console.log(` ✓ ${verses.length} paragraphs`)
  }

  if (dryRun || chapters.length === 0) return null
  return makeBook({
    id: 'COJ',
    name: 'Chronicles of Jerahmeel',
    abbreviation: 'Jerahmeel',
    category: 'ot-pseudepigrapha',
    collection: 'coj',
    chapters,
  })
}

async function scrapeSupplementary({ dryRun = false } = {}) {
  const books = []

  const did = await scrapeDidache({ dryRun })
  if (did) books.push(did)

  const bep = await scrapeLaurenceEnoch({ dryRun })
  if (bep) books.push(bep)

  const adam = await scrapeSinglePageBook({
    sitePath: 'chr/apo/adamnev.htm',
    id: 'ADNEV',
    name: 'Life of Adam and Eve (Vita Adae)',
    abbreviation: 'Vita Adae',
    category: 'ot-pseudepigrapha',
    collection: 'adamnev',
    dryRun,
  })
  if (adam) books.push(adam)

  const slav = await scrapeSinglePageBook({
    sitePath: 'chr/apo/slanev.htm',
    id: 'SLADV',
    name: 'Slavonic Life of Adam and Eve',
    abbreviation: 'Slavonic Adam',
    category: 'ot-pseudepigrapha',
    collection: 'slanev',
    dryRun,
  })
  if (slav) books.push(slav)

  const jas = await scrapeJasher({ dryRun })
  if (jas) books.push(jas)

  const sib = await scrapeSibyllineOracles({ dryRun })
  if (sib) books.push(sib)

  const coj = await scrapeChroniclesOfJerahmeel({ dryRun })
  if (coj) books.push(coj)

  return books
}

function parseArgs() {
  const args = process.argv.slice(2)
  const opts = { category: null, book: null, dryRun: false }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category') opts.category = args[++i]
    else if (args[i] === '--book') opts.book = args[++i]
    else if (args[i] === '--dry-run') opts.dryRun = true
  }
  return opts
}

function loadExistingData() {
  const dataPath = path.join(__dirname, '../data/apocrypha-data.json')
  if (!fs.existsSync(dataPath)) {
    return {
      bibleName: 'Sacred Texts Apocrypha',
      bibleId: 'sacred-texts-apocrypha',
      books: [],
    }
  }
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'))
}

const CATEGORY_ORDER = ['deuterocanonical', 'ot-pseudepigrapha', 'nt-apocrypha']

function mergeBooks(existing, scraped, { replaceCategories = [], replaceIds = [] } = {}) {
  const idSet = new Set(replaceIds)
  const kept = existing.books.filter(
    (b) =>
      !replaceCategories.includes(b.category) && !idSet.has(b.id),
  )
  return sortBooks([...kept, ...scraped])
}

function mergeBooksById(existing, scraped) {
  const scrapedIds = new Set(scraped.map((b) => b.id))
  const kept = existing.books.filter((b) => !scrapedIds.has(b.id))
  return sortBooks([...kept, ...scraped])
}

function sortBooks(books) {
  return books.sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
  )
}

async function main() {
  const opts = parseArgs()

  if (!opts.category && !opts.book) {
    console.log(`Usage:
  --category deuterocanonical
  --category ot-pseudepigrapha
  --category nt-apocrypha
  --category supplementary
  --book <slug>   (deuterocanonical only)
  --dry-run`)
    process.exit(1)
  }

  let scraped = []
  let mergeOpts = {}

  if (opts.book) {
    const book = DEUTEROCANONICAL_BOOKS.find((b) => b.slug === opts.book)
    if (!book) {
      console.error(`Unknown book slug: ${opts.book}`)
      process.exit(1)
    }
    scraped.push(await scrapeDeuterocanonicalBook(book, { dryRun: opts.dryRun }))
    mergeOpts = { replaceIds: [book.id] }
  } else if (opts.category === 'deuterocanonical') {
    for (const book of DEUTEROCANONICAL_BOOKS) {
      try {
        scraped.push(await scrapeDeuterocanonicalBook(book, { dryRun: opts.dryRun }))
      } catch (err) {
        console.error(`\n   ✗ ${book.name}: ${err.message}`)
        process.exitCode = 1
      }
    }
    mergeOpts = { replaceCategories: ['deuterocanonical'] }
  } else if (opts.category === 'ot-pseudepigrapha') {
    scraped = await scrapeOtPseudepigrapha({ dryRun: opts.dryRun })
    mergeOpts = { replaceCategories: ['ot-pseudepigrapha'] }
  } else if (opts.category === 'nt-apocrypha') {
    scraped = await scrapeNtApocrypha({ dryRun: opts.dryRun })
    mergeOpts = { replaceCategories: ['nt-apocrypha'] }
  } else if (opts.category === 'supplementary') {
    scraped = await scrapeSupplementary({ dryRun: opts.dryRun })
    mergeOpts = { supplementary: true }
  } else {
    console.error(`Unknown category: ${opts.category}`)
    process.exit(1)
  }

  if (opts.dryRun) {
    console.log('\nDry run complete — no files written.')
    return
  }

  const existing = loadExistingData()
  const books = mergeOpts.supplementary
    ? mergeBooksById(existing, scraped)
    : mergeBooks(existing, scraped, mergeOpts)

  const output = {
    bibleName: existing.bibleName,
    bibleId: existing.bibleId,
    books,
  }

  const outPath = path.join(__dirname, '../data/apocrypha-data.json')
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n')

  const totalChapters = books.reduce((n, b) => n + b.chapters.length, 0)
  console.log(`\n✅ Wrote ${scraped.length} book(s) to data/apocrypha-data.json`)
  console.log(`   Total: ${books.length} books, ${totalChapters} chapters`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
