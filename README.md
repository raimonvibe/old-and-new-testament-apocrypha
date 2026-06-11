**🌐 Live:** [https://old-and-new-testament-apocrypha.vercel.app/](https://old-and-new-testament-apocrypha.vercel.app/)

![Apocrypha Reader](public/social-share.jpeg)

# 📜 Old & New Testament Apocrypha Reader

A beautiful, modern web reader for **deuterocanonical books**, **Old Testament pseudepigrapha**, and **New Testament apocrypha** — built by [raimonvibe](https://github.com/raimonvibe).

Inspired by the [Holy Bible Reader](https://github.com/raimonvibe/bible-old-and-new-testament) · Texts from [sacred-texts.com](https://www.sacred-texts.com/chr/apo/index.htm)

---

## ✨ Features

| | |
|---|---|
| 📚 **73 books** | Deuterocanonical · OT pseudepigrapha · NT apocrypha |
| 📖 **1,215 chapters** | Verse markers, cross-book navigation, chapter picker |
| 🌓 **Dark / light mode** | System preference + saved theme |
| 🔊 **Read aloud** | Web Speech API — full page or selection (Alt+R / Alt+S) |
| 📱 **PWA-ready** | Installable with manifest + favicons |
| 🎨 **Refined UI** | Playfair Display · Merriweather · beige/brown gradients |

---

## 🗂️ Library contents

### Deuterocanonical (16 books)
Tobit, Judith, Wisdom, Sirach, 1–2 Maccabees, Baruch, and more — from [/bib/apo/](https://www.sacred-texts.com/bib/apo/index.htm).

### OT Pseudepigrapha (30 books)
- **Forgotten Books of Eden** — Adam & Eve, 2 Enoch, Psalms/Odes of Solomon, Testaments of the Patriarchs
- **1 Enoch** (Charles) · **Enoch the Prophet** (Laurence) · **Jubilees** · **Philo's Antiquities**
- **Book of Jasher** · **Sibylline Oracles** · **Chronicles of Jerahmeel**
- **Vita Adae** · **Slavonic Life of Adam and Eve**

### NT Apocrypha (28 books)
- **Lost Books of the Bible** — Birth of Mary, Protevangelion, Nicodemus, Clement, Barnabas, Ignatius, Hermas, and more
- **Gospel of Thomas** (114 sayings) · **Gospel of Mary** · **Didache**

---

## 🚀 Quick start

**Requirements:** Node.js 20+ (see `.nvmrc`)

```bash
nvm use
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # serve production
```

---

## 🕸️ Scrape / refresh content

Content is scraped from [sacred-texts.com](https://www.sacred-texts.com) via the Internet Archive mirror:

```bash
npm run scrape:deuterocanonical
npm run scrape:ot-pseudepigrapha
npm run scrape:nt-apocrypha
node scripts/scrape-sacred-texts.js --category supplementary
```

---

## ☁️ Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/raimonvibe/old-and-new-testament-apocrypha)

1. Push to GitHub (already at [raimonvibe/old-and-new-testament-apocrypha](https://github.com/raimonvibe/old-and-new-testament-apocrypha))
2. Import the repo in [Vercel](https://vercel.com)
3. Framework preset: **Next.js** — no env vars needed
4. Live at [old-and-new-testament-apocrypha.vercel.app](https://old-and-new-testament-apocrypha.vercel.app/) (override with `NEXT_PUBLIC_SITE_URL` if you use a custom domain)

---

## 📁 Project structure

```
app/           Next.js App Router (page, layout, API)
components/    Reader UI (BookSelector, BibleReader, theme, read-aloud)
data/          apocrypha-data.json — all book/chapter content
docs/          Content inventory & feature spec
public/        favicon, PWA manifest, social-share image
scripts/       sacred-texts scraper
```

---

## 📚 Docs

| File | Contents |
|------|----------|
| [docs/content-inventory.md](docs/content-inventory.md) | Books, URLs, chapter counts |
| [docs/feature-spec.md](docs/feature-spec.md) | UI/features spec |

---

## ⚖️ License

**MIT License** — Copyright (c) 2026 [raimonvibe](https://github.com/raimonvibe)

See [LICENSE](LICENSE) for full terms.

Biblical and apocryphal **text content** is public domain (pre-1928 translations from [sacred-texts.com](https://www.sacred-texts.com)). The **application code** is MIT-licensed.

---

<p align="center">
  Made with 📖 for readers of sacred texts · <a href="https://github.com/raimonvibe">raimonvibe</a>
</p>
