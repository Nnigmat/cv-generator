# DE Lebenslauf Support Design

**Date:** 2026-06-07

## Overview

Adapt the CV builder to automatically apply German Lebenslauf conventions when `lang === 'de'` and international Resume conventions when `lang === 'en'`. No separate setting — language toggle drives the format.

## Key Differences by Mode

| Feature | DE (Lebenslauf) | EN (International) |
|---|---|---|
| Date of birth, nationality, marital status | Shown | Hidden |
| Signature block | Shown | Hidden |
| Photo placeholder style | Warning tone | Neutral |

## Data Schema Changes (`store.js`)

Add to `personal` in `createEmpty()`:
- `dateOfBirth: ''`
- `nationality: ''`
- `maritalStatus: ''`
- `signatureCity: ''`

No changes to existing fields. New fields default to empty string, so existing profiles are unaffected.

## Editor Changes (`editor-cv.js`)

**`buildPersonal()`** — after the existing 6 fields, when `lang === 'de'`, render a sub-section label "Persönliche Daten" and a `field-grid-2` with:
- Geburtsdatum → `personal.dateOfBirth`
- Staatsangehörigkeit → `personal.nationality`
- Familienstand → `personal.maritalStatus`

**New `buildSignature()`** — called from `build()` only when `lang === 'de'`:
- One field: Stadt (city) → `personal.signatureCity`
- Hint: "Wird in der Unterschrift verwendet"

## Render Changes (`render-cv.js`)

**Sidebar — Persönliche Daten block** (DE only, injected after photo):
- Renders as a `cv-sidebar-section` with title "Persönliche Daten"
- Shows only non-empty fields as `label: value` rows
- Fields: Geburtsdatum, Staatsangehörigkeit, Familienstand

**Signature block** (DE only, appended at bottom of main column):
- Format: `{signatureCity}, {DD.MM.YYYY of today}` on first line
- Blank line, then `_______________`
- Then `{personal.name}`
- Styled with `cv-signature` class (small top margin, 9pt font)

## Approach

Variant A: lang-driven conditionals in existing modules. Consistent with existing patterns (`lang`-conditional rendering is already used throughout). No new files needed.

## Files Changed

- `js/store.js` — add 4 fields to `createEmpty()`
- `js/editor-cv.js` — conditional DE fields in `buildPersonal()`, new `buildSignature()`
- `js/render-cv.js` — conditional Persönliche Daten sidebar block, conditional signature block
- `css/cv.css` — add `.cv-signature` style (if needed)
