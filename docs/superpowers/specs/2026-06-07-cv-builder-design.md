# CV Builder — Design Spec
**Date:** 2026-06-07

## Overview

A vanilla JS, no-build CV builder published as static files on GitHub Pages. No personal data hardcoded — all data lives in `localStorage`. Supports multiple job application profiles, each containing a CV and a Cover Letter. JSON import/export for portability.

---

## File Structure

```
index.html              — Dashboard (list of profiles)
builder.html            — CV + Cover Letter editor
js/
  store.js              — localStorage CRUD for profiles
  render-cv.js          — renders CV preview into DOM
  render-cl.js          — renders Cover Letter preview into DOM
  editor.js             — edit panel logic (form ↔ state)
  print.js              — generates print HTML, triggers PDF save
  app.js                — builder entry point (wires everything together)
css/
  base.css              — reset, CSS variables (accent color, fonts)
  layout.css            — toolbar, split-panel, dashboard grid
  cv.css                — CV preview styles (sidebar + main column)
  editor.css            — edit form styles
```

---

## Dashboard (`index.html`)

Lists all saved profiles as cards. Each card shows:
- Company name + Position (from `meta`)
- Status — `<select>` with options: Draft, Sent, Interview, Rejected, Offer
- Created date

Actions per card: **Open** (→ `builder.html?id=<id>`), **Delete**.

Global actions: **New Profile** (creates empty profile, opens builder), **Import JSON** (loads a profile from file).

All profiles stored under `localStorage` key `cv-builder-profiles` as an array.

---

## Builder (`builder.html`)

### Toolbar (sticky top)
- Tab switcher: **CV** / **Cover Letter**
- Language switcher: **EN** / **DE**
- Mode switcher: **Preview** / **Edit**
- **Save PDF** — opens print window with generated HTML
- **Export JSON** — downloads current profile as `.json`
- **Import JSON** — replaces current profile data from file

### Layout
Split view: edit panel (left, hidden in Preview mode) + live preview (right, always visible). Preview updates on every keystroke.

### CV Preview Layout

```
┌────────────────────────────────────────────┐
│ ┌───────────┬──────────────────────────┐   │
│ │  Sidebar  │  Name                    │   │
│ │  [Photo]  │  email | phone           │   │
│ │           │  linkedin | github       │   │
│ │  Skills   │  address                 │   │
│ │  ──────── │  ─────────────────────── │   │
│ │  Languages│  ABOUT ME                │   │
│ │  ──────── │  ...                     │   │
│ │  Hobbies  │  ─────────────────────── │   │
│ │           │  EXPERIENCE              │   │
│ │           │  ...                     │   │
│ │           │  ─────────────────────── │   │
│ │           │  EDUCATION               │   │
│ └───────────┴──────────────────────────┘   │
└────────────────────────────────────────────┘
```

Sidebar: ~30% width, dark/accent background (colour set via CSS variable). Main column: white background.

### Edit Panel — CV

1. **Profile Meta** — Company, Position, Status (select)
2. **Personal Info** — Name, Email, Phone, LinkedIn, GitHub, Address
3. **Photo** — file input, stored as base64 in profile JSON
4. **About Me** — textarea per language (EN / DE tabs)
5. **Sidebar Sections** — dynamic list:
   - Each section has: Title (per language), Type (`tags` | `list` | `text`), Content
   - Add / remove sections, drag to reorder (optional v2)
6. **Experience** — dynamic list of jobs:
   - Fields: Title (per lang), Company, Period, Duration (per lang)
   - Bullets: one per line, `**text**` for bold; per language
   - Add / remove jobs, move up/down
7. **Education** — static section (can be edited as structured fields or textarea)

### Edit Panel — Cover Letter

- Body textarea (per language)
- Header auto-filled from `personal` + `meta` (company, position, date)
- Greeting auto-generated: "Dear {company} Hiring Team," / "Sehr geehrtes {company}-Team,"
- Closing auto-generated per language

---

## Data Model (single profile JSON)

```json
{
  "id": "uuid-v4",
  "createdAt": "2026-06-07T00:00:00Z",
  "meta": {
    "company": "Almex GmbH",
    "position": "Frontend Developer",
    "status": "draft",
    "lang": "en"
  },
  "personal": {
    "name": "",
    "email": "",
    "phone": "",
    "linkedin": "",
    "github": "",
    "address": "",
    "photo": ""
  },
  "about": {
    "en": "",
    "de": ""
  },
  "sidebarSections": [
    {
      "id": "s1",
      "title": { "en": "Skills", "de": "Kenntnisse" },
      "type": "tags",
      "items": ["React", "TypeScript"]
    },
    {
      "id": "s2",
      "title": { "en": "Languages", "de": "Sprachen" },
      "type": "list",
      "items": [{ "en": "English: C1", "de": "Englisch: C1" }]
    },
    {
      "id": "s3",
      "title": { "en": "Hobbies", "de": "Hobbys" },
      "type": "text",
      "content": { "en": "", "de": "" }
    }
  ],
  "experience": [
    {
      "id": "e1",
      "title": { "en": "", "de": "" },
      "company": "",
      "period": "",
      "duration": { "en": "", "de": "" },
      "bullets": { "en": [], "de": [] }
    }
  ],
  "education": [
    {
      "id": "ed1",
      "institution": "",
      "degree": { "en": "", "de": "" },
      "location": { "en": "", "de": "" },
      "period": ""
    }
  ],
  "coverLetter": {
    "date": { "en": "", "de": "" },
    "body": { "en": "", "de": "" }
  }
}
```

All profiles stored in `localStorage` as:
```json
{ "cv-builder-profiles": [ <profile>, <profile>, ... ] }
```

---

## PDF Export

Two separate buttons in the toolbar: **Save CV as PDF** and **Save Cover Letter as PDF**. Each opens its own print window with a self-contained HTML string (inline CSS, base64 photo), then calls `window.print()` automatically. User selects "Save as PDF" in the browser print dialog.

Text in the generated PDF remains real, selectable text — important for ATS parsers and recruiters copying content. No canvas/image-based PDF libraries used.

Cover Letter print uses the same personal data + meta, renders auto-filled header and closing.

---

## localStorage Strategy

- Auto-save on every field change (debounced 300ms)
- `store.js` exposes: `getAll()`, `get(id)`, `save(profile)`, `delete(id)`
- Photo stored as base64 inside profile JSON (no separate key)
- Import JSON merges into existing or creates new profile (preserves `id`)

---

## Out of Scope (v1)

- Drag-to-reorder sidebar sections
- Multiple CV templates / themes
- Cloud sync
- Status history / changelog per profile
