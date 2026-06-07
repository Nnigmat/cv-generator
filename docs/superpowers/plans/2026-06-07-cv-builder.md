# CV Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a vanilla JS CV builder with dashboard, sidebar-layout CV preview, Cover Letter editor, JSON import/export, and PDF export — deployable as static files on GitHub Pages.

**Architecture:** Multi-file static site (no build tooling). `store.js` manages all data in localStorage. `render-cv.js` and `render-cl.js` read from a shared state object and re-render the preview DOM on every change. `editor.js` owns the edit forms and calls store + renderers on input.

**Tech Stack:** Vanilla JS (ES2020, no modules — plain `<script>` tags), CSS custom properties, localStorage, FileReader API, browser print dialog for PDF.

---

## File Map

```
index.html              — Dashboard: profile cards list
builder.html            — Builder: toolbar + split panel (edit | preview)
css/
  base.css              — CSS reset, custom properties (--accent, --sidebar-bg, fonts)
  layout.css            — Toolbar, split panel, dashboard grid, card styles
  cv.css                — CV preview: sidebar + main column, print @media
  editor.css            — Edit form fields, section headers, dynamic list items
js/
  store.js              — getAll / get / save / remove — all localStorage I/O here
  render-cv.js          — renderCV(profile, lang) → writes into #cv-preview
  render-cl.js          — renderCL(profile, lang) → writes into #cl-preview
  editor-cv.js          — buildCVForm(profile) → writes into #editor-panel, wires inputs
  editor-cl.js          — buildCLForm(profile) → writes into #editor-panel, wires inputs
  print.js              — printCV(profile, lang) / printCL(profile, lang) → open + print
  app.js                — entry point for builder.html: reads ?id, wires toolbar, calls all
  dashboard.js          — entry point for index.html: renders cards, wires actions
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `index.html`
- Create: `builder.html`
- Create: `css/base.css`
- Create: `css/layout.css`
- Create: `css/cv.css`
- Create: `css/editor.css`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p css js
```

- [ ] **Step 2: Create `css/base.css`**

```css
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; background: #eff1f5; color: #1a1a1a; }
button, input, textarea, select { font-family: inherit; font-size: inherit; }
textarea:focus, input:focus, select:focus { outline: 2px solid var(--accent); }

:root {
  --accent: #0056b3;
  --sidebar-bg: #1e2d40;
  --sidebar-fg: #e8edf3;
  --accent-light: #e8f0fb;
  --border: #e0e0e0;
  --radius: 8px;
  --shadow: 0 2px 12px rgba(0,0,0,0.09);
}
```

- [ ] **Step 3: Create `css/layout.css`**

```css
/* Toolbar */
.toolbar {
  position: sticky; top: 0; z-index: 100;
  background: white; border-bottom: 1px solid var(--border);
  padding: 9px 16px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.toolbar-group { display: flex; gap: 4px; }
.tab-switcher { display: flex; gap: 2px; background: #eff1f5; border-radius: var(--radius); padding: 3px; }
.tab-btn {
  padding: 5px 13px; border-radius: 6px; border: none; cursor: pointer;
  background: transparent; color: #666; font-weight: 600; font-size: 12.5px;
}
.tab-btn.active { background: white; color: var(--accent); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.btn {
  padding: 5px 13px; border-radius: 6px; cursor: pointer; font-weight: 600;
  font-size: 12.5px; border: 1.5px solid var(--border); background: white; color: #444;
}
.btn.active { background: var(--accent); color: white; border-color: var(--accent); }
.btn.dark { background: #1a1a1a; color: white; border-color: #1a1a1a; }

/* Builder split layout */
.builder-wrap { display: flex; gap: 16px; padding: 16px; max-width: 1200px; margin: 0 auto; }
.editor-panel { width: 380px; flex-shrink: 0; }
.preview-panel { flex: 1; }
.panel-card { background: white; border-radius: 10px; padding: 18px 20px; box-shadow: var(--shadow); margin-bottom: 16px; }
.preview-card { background: white; border-radius: 10px; padding: 44px 50px; box-shadow: var(--shadow); }

/* Dashboard */
.dashboard-wrap { padding: 24px; max-width: 1000px; margin: 0 auto; }
.dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.dashboard-header h1 { margin: 0; font-size: 22px; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.profile-card {
  background: white; border-radius: 10px; padding: 18px; box-shadow: var(--shadow);
  display: flex; flex-direction: column; gap: 10px;
}
.profile-card-title { font-size: 15px; font-weight: 700; }
.profile-card-position { font-size: 12.5px; color: #666; }
.profile-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
.profile-card-date { font-size: 11px; color: #aaa; }
.card-actions { display: flex; gap: 6px; }

/* Status select */
.status-select {
  font-size: 11.5px; padding: 3px 8px; border-radius: 5px; border: 1.5px solid var(--border);
  cursor: pointer; background: white;
}

/* Empty state */
.empty-state { text-align: center; padding: 60px 20px; color: #aaa; font-size: 15px; }
```

- [ ] **Step 4: Create `css/cv.css`**

```css
/* CV preview container */
.cv-wrap { display: flex; font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #1a1a1a; line-height: 1.45; min-height: 500px; }

/* Sidebar */
.cv-sidebar { width: 32%; background: var(--sidebar-bg); color: var(--sidebar-fg); padding: 24px 18px; flex-shrink: 0; }
.cv-sidebar-photo { width: 100%; aspect-ratio: 3/4; object-fit: cover; border-radius: 4px; margin-bottom: 18px; display: block; }
.cv-sidebar-photo-placeholder { width: 100%; aspect-ratio: 3/4; background: #2e3d52; border-radius: 4px; margin-bottom: 18px; display: flex; align-items: center; justify-content: center; color: #6a7f9a; font-size: 12px; }
.cv-sidebar-section { margin-bottom: 18px; }
.cv-sidebar-section-title { font-size: 8pt; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #8aaac8; margin-bottom: 5px; padding-bottom: 3px; border-bottom: 1px solid #2e3d52; }
.cv-sidebar-tag { display: inline-block; background: #2e3d52; color: var(--sidebar-fg); border-radius: 4px; padding: 2px 7px; margin: 2px 2px 2px 0; font-size: 8.5pt; }
.cv-sidebar-list { margin: 0; padding: 0; list-style: none; }
.cv-sidebar-list li { font-size: 9pt; margin-bottom: 3px; }
.cv-sidebar-text { font-size: 9pt; line-height: 1.55; }

/* Main column */
.cv-main { flex: 1; padding: 20px 22px; }
.cv-name { font-size: 20pt; font-weight: 700; margin-bottom: 4px; }
.cv-contact { font-size: 8.5pt; color: #555; line-height: 1.7; }
.cv-contact a { color: #555; text-decoration: none; }
.cv-section { margin-bottom: 10px; }
.cv-section-title { font-size: 11pt; font-weight: 700; color: var(--accent); letter-spacing: .03em; margin-bottom: 1px; }
.cv-divider { border: none; border-top: 0.5px solid #bbb; margin: 1px 0 5px; }
.cv-exp-header { display: flex; justify-content: space-between; }
.cv-exp-period { font-size: 8.5pt; color: #555; text-align: right; white-space: nowrap; flex-shrink: 0; margin-left: 10px; }
.cv-exp-bullets { margin: 4px 0 0; padding-left: 14px; }
.cv-exp-bullets li { font-size: 9.5pt; margin-bottom: 2px; }
.cv-bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* Cover Letter */
.cl-wrap { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #1a1a1a; line-height: 1.55; }
.cl-sender-name { font-size: 16pt; font-weight: 700; margin-bottom: 5px; }
.cl-sender-contact { font-size: 9pt; color: #555; line-height: 1.7; }
.cl-sender-contact a { color: #555; text-decoration: none; }
.cl-addressee { margin: 18px 0; }
.cl-para { font-size: 9.5pt; margin: 0 0 12px; }

/* Print styles */
@media print {
  body { margin: 0; background: white; }
  .toolbar, .editor-panel, .preview-hint { display: none !important; }
  .builder-wrap { padding: 0; }
  .preview-card { box-shadow: none; border-radius: 0; padding: 0; }
  @page { size: A4; margin: 1.5cm; }
}
```

- [ ] **Step 5: Create `css/editor.css`**

```css
.section-label { font-weight: 700; font-size: 12.5px; color: #333; margin: 14px 0 10px; padding-bottom: 5px; border-bottom: 1px solid #f0f0f0; }
.field-wrap { margin-bottom: 11px; }
.field-label { display: block; font-size: 10.5px; font-weight: 600; color: #888; margin-bottom: 3px; text-transform: uppercase; letter-spacing: .06em; }
.field-hint { font-size: 10.5px; color: #bbb; margin-bottom: 3px; }
.field-input { width: 100%; padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; background: #fafafa; color: #1a1a1a; }
textarea.field-input { resize: vertical; min-height: 80px; }
.field-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 12px; }
.field-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0 12px; }

/* Dynamic list items */
.dynamic-item { border: 1px solid #eee; border-radius: var(--radius); padding: 14px 14px 4px; margin-bottom: 12px; background: #fdfcff; position: relative; }
.dynamic-item-actions { display: flex; justify-content: flex-end; gap: 6px; margin-bottom: 8px; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 14px; padding: 2px 6px; border-radius: 4px; color: #888; }
.btn-icon:hover { background: #f0f0f0; color: #333; }
.btn-add { width: 100%; padding: 8px; border: 1.5px dashed var(--border); border-radius: var(--radius); background: none; color: #888; cursor: pointer; font-size: 13px; margin-top: 4px; }
.btn-add:hover { border-color: var(--accent); color: var(--accent); }

/* Photo upload */
.photo-upload-wrap { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 11px; }
.photo-thumb { width: 60px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border); display: block; }
.photo-thumb-placeholder { width: 60px; height: 80px; background: #f0f0f0; border-radius: 4px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 10px; color: #aaa; }
```

- [ ] **Step 6: Create shell `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CV Builder</title>
  <link rel="stylesheet" href="css/base.css" />
  <link rel="stylesheet" href="css/layout.css" />
</head>
<body>
  <div class="dashboard-wrap">
    <div class="dashboard-header">
      <h1>CV Builder</h1>
      <div style="display:flex;gap:8px">
        <label class="btn" style="cursor:pointer">
          Import JSON <input type="file" id="import-json" accept=".json" style="display:none" />
        </label>
        <button class="btn dark" id="btn-new">+ New Profile</button>
      </div>
    </div>
    <div class="cards-grid" id="cards-grid"></div>
  </div>
  <script src="js/store.js"></script>
  <script src="js/dashboard.js"></script>
</body>
</html>
```

- [ ] **Step 7: Create shell `builder.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CV Builder</title>
  <link rel="stylesheet" href="css/base.css" />
  <link rel="stylesheet" href="css/layout.css" />
  <link rel="stylesheet" href="css/cv.css" />
  <link rel="stylesheet" href="css/editor.css" />
</head>
<body>
  <div class="toolbar">
    <div class="tab-switcher">
      <button class="tab-btn active" data-tab="cv">📄 CV</button>
      <button class="tab-btn" data-tab="cover">✉️ Cover Letter</button>
    </div>
    <div class="toolbar-group">
      <button class="btn active" id="btn-lang-en">EN</button>
      <button class="btn" id="btn-lang-de">DE</button>
    </div>
    <div class="toolbar-group">
      <button class="btn active" id="btn-preview">👁 Preview</button>
      <button class="btn" id="btn-edit">✏️ Edit</button>
    </div>
    <div class="toolbar-group">
      <button class="btn dark" id="btn-save-cv">🖨 Save CV as PDF</button>
      <button class="btn dark" id="btn-save-cl">🖨 Save Letter as PDF</button>
    </div>
    <div class="toolbar-group">
      <button class="btn" id="btn-export">⬇ Export JSON</button>
      <label class="btn" style="cursor:pointer">
        ⬆ Import JSON <input type="file" id="import-json" accept=".json" style="display:none" />
      </label>
    </div>
    <a href="index.html" class="btn">← Dashboard</a>
  </div>

  <div class="builder-wrap">
    <div class="editor-panel" id="editor-panel" style="display:none"></div>
    <div class="preview-panel">
      <div class="preview-card" id="cv-preview"></div>
      <div class="preview-card" id="cl-preview" style="display:none"></div>
    </div>
  </div>

  <script src="js/store.js"></script>
  <script src="js/render-cv.js"></script>
  <script src="js/render-cl.js"></script>
  <script src="js/editor-cv.js"></script>
  <script src="js/editor-cl.js"></script>
  <script src="js/print.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 8: Open `index.html` in browser and verify it loads without errors**

Open: `open index.html`  
Expected: blank page with "CV Builder" heading and "+ New Profile" button, no console errors.

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "feat: project scaffold — HTML shells, CSS files"
```

---

## Task 2: store.js — localStorage CRUD

**Files:**
- Create: `js/store.js`

- [ ] **Step 1: Create `js/store.js`**

```js
var Store = (function () {
  var KEY = 'cv-builder-profiles';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }

  function get(id) {
    return getAll().find(function (p) { return p.id === id; }) || null;
  }

  function save(profile) {
    var all = getAll();
    var idx = all.findIndex(function (p) { return p.id === profile.id; });
    if (idx >= 0) { all[idx] = profile; } else { all.push(profile); }
    localStorage.setItem(KEY, JSON.stringify(all));
  }

  function remove(id) {
    var all = getAll().filter(function (p) { return p.id !== id; });
    localStorage.setItem(KEY, JSON.stringify(all));
  }

  function createEmpty() {
    return {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      meta: { company: '', position: '', status: 'draft', lang: 'en' },
      personal: { name: '', email: '', phone: '', linkedin: '', github: '', address: '', photo: '' },
      about: { en: '', de: '' },
      sidebarSections: [
        { id: 'skills', title: { en: 'Skills', de: 'Kenntnisse' }, type: 'tags', items: [] },
        { id: 'languages', title: { en: 'Languages', de: 'Sprachen' }, type: 'list', items: [] },
        { id: 'hobbies', title: { en: 'Hobbies', de: 'Hobbys' }, type: 'text', content: { en: '', de: '' } }
      ],
      experience: [],
      education: [],
      coverLetter: { date: { en: '', de: '' }, body: { en: '', de: '' } }
    };
  }

  return { getAll: getAll, get: get, save: save, remove: remove, createEmpty: createEmpty };
})();
```

- [ ] **Step 2: Verify in browser console**

Open `index.html`, open DevTools console, run:
```js
var p = Store.createEmpty(); Store.save(p); Store.getAll().length // → 1
Store.get(p.id).meta.company // → ""
Store.remove(p.id); Store.getAll().length // → 0
```
Expected: all assertions pass, no errors.

- [ ] **Step 3: Commit**

```bash
git add js/store.js
git commit -m "feat: store.js — localStorage CRUD for profiles"
```

---

## Task 3: Dashboard

**Files:**
- Create: `js/dashboard.js`

- [ ] **Step 1: Create `js/dashboard.js`**

```js
(function () {
  var STATUS_OPTIONS = ['draft', 'sent', 'interview', 'rejected', 'offer'];
  var STATUS_LABELS = { draft: 'Draft', sent: 'Sent', interview: 'Interview', rejected: 'Rejected', offer: 'Offer' };

  function formatDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function renderCards() {
    var grid = document.getElementById('cards-grid');
    var profiles = Store.getAll();
    if (profiles.length === 0) {
      grid.innerHTML = '<div class="empty-state">No profiles yet. Click "+ New Profile" to start.</div>';
      return;
    }
    grid.innerHTML = profiles.map(function (p) {
      var statusOpts = STATUS_OPTIONS.map(function (s) {
        return '<option value="' + s + '"' + (p.meta.status === s ? ' selected' : '') + '>' + STATUS_LABELS[s] + '</option>';
      }).join('');
      return '<div class="profile-card" data-id="' + p.id + '">'
        + '<div class="profile-card-title">' + (p.meta.company || 'Unnamed company') + '</div>'
        + '<div class="profile-card-position">' + (p.meta.position || 'No position') + '</div>'
        + '<select class="status-select" data-id="' + p.id + '">' + statusOpts + '</select>'
        + '<div class="profile-card-footer">'
        + '<span class="profile-card-date">' + formatDate(p.createdAt) + '</span>'
        + '<div class="card-actions">'
        + '<button class="btn btn-open" data-id="' + p.id + '">Open</button>'
        + '<button class="btn btn-delete" data-id="' + p.id + '" style="color:#c00;border-color:#f8d0d0">Delete</button>'
        + '</div></div></div>';
    }).join('');
  }

  document.getElementById('btn-new').addEventListener('click', function () {
    var p = Store.createEmpty();
    Store.save(p);
    window.location.href = 'builder.html?id=' + p.id;
  });

  document.getElementById('cards-grid').addEventListener('click', function (e) {
    var id = e.target.dataset.id;
    if (!id) return;
    if (e.target.classList.contains('btn-open')) {
      window.location.href = 'builder.html?id=' + id;
    }
    if (e.target.classList.contains('btn-delete')) {
      if (confirm('Delete this profile?')) { Store.remove(id); renderCards(); }
    }
  });

  document.getElementById('cards-grid').addEventListener('change', function (e) {
    if (e.target.classList.contains('status-select')) {
      var id = e.target.dataset.id;
      var p = Store.get(id);
      if (p) { p.meta.status = e.target.value; Store.save(p); }
    }
  });

  document.getElementById('import-json').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var data = JSON.parse(ev.target.result);
        if (!data.id) data.id = Math.random().toString(36).slice(2) + Date.now().toString(36);
        if (!data.createdAt) data.createdAt = new Date().toISOString();
        Store.save(data);
        renderCards();
      } catch (err) { alert('Invalid JSON file'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  renderCards();
})();
```

- [ ] **Step 2: Verify in browser**

1. Open `index.html` — see "No profiles yet" empty state
2. Click "+ New Profile" — redirected to `builder.html?id=<id>`
3. Go back, see card with "Unnamed company" and status select
4. Change status select → refresh page → status persists
5. Click Delete → card removed

- [ ] **Step 3: Commit**

```bash
git add js/dashboard.js
git commit -m "feat: dashboard — profile cards, new/delete, status select, import JSON"
```

---

## Task 4: CV Preview Renderer

**Files:**
- Create: `js/render-cv.js`

- [ ] **Step 1: Create `js/render-cv.js`**

```js
var RenderCV = (function () {
  var L10N = {
    en: { aboutMe: 'ABOUT ME', experience: 'EXPERIENCE', education: 'EDUCATION' },
    de: { aboutMe: 'ÜBER MICH', experience: 'BERUFSERFAHRUNG', education: 'AUSBILDUNG' }
  };

  function esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function bold(text) {
    return esc(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  function renderSidebarSection(sec, lang) {
    var title = esc(sec.title[lang] || sec.title.en || '');
    var body = '';
    if (sec.type === 'tags') {
      body = (sec.items || []).map(function (t) {
        return '<span class="cv-sidebar-tag">' + esc(t) + '</span>';
      }).join('');
    } else if (sec.type === 'list') {
      body = '<ul class="cv-sidebar-list">' + (sec.items || []).map(function (item) {
        var text = typeof item === 'object' ? (item[lang] || item.en || '') : item;
        return '<li>' + esc(text) + '</li>';
      }).join('') + '</ul>';
    } else if (sec.type === 'text') {
      var content = sec.content ? (sec.content[lang] || sec.content.en || '') : '';
      body = '<div class="cv-sidebar-text">' + esc(content) + '</div>';
    }
    return '<div class="cv-sidebar-section"><div class="cv-sidebar-section-title">' + title + '</div>' + body + '</div>';
  }

  function render(profile, lang) {
    var L = L10N[lang] || L10N.en;
    var p = profile.personal || {};
    var photo = p.photo
      ? '<img class="cv-sidebar-photo" src="' + p.photo + '" alt="photo" />'
      : '<div class="cv-sidebar-photo-placeholder">No photo</div>';

    var sidebar = photo
      + (profile.sidebarSections || []).map(function (s) { return renderSidebarSection(s, lang); }).join('');

    var contact = [p.email, p.phone].filter(Boolean).map(function (v) { return esc(v); }).join(' | ');
    var links = [p.linkedin, p.github].filter(Boolean).map(function (v) { return esc(v); }).join(' | ');

    var expHtml = (profile.experience || []).map(function (job) {
      var title = job.title ? (job.title[lang] || job.title.en || '') : '';
      var duration = job.duration ? (job.duration[lang] || job.duration.en || '') : '';
      var bullets = (job.bullets ? (job.bullets[lang] || job.bullets.en || []) : [])
        .map(function (b) { return '<li>' + bold(b) + '</li>'; }).join('');
      return '<div style="margin-top:6px;margin-bottom:10px">'
        + '<div class="cv-exp-header"><div><strong>' + esc(title) + '</strong><br>'
        + '<em style="font-size:9pt;color:#555">' + esc(job.company || '') + '</em></div>'
        + '<div class="cv-exp-period">' + esc(job.period || '') + '<br>(' + esc(duration) + ')</div></div>'
        + '<ul class="cv-exp-bullets">' + bullets + '</ul></div>';
    }).join('');

    var eduHtml = (profile.education || []).map(function (ed) {
      var degree = ed.degree ? (ed.degree[lang] || ed.degree.en || '') : '';
      var location = ed.location ? (ed.location[lang] || ed.location.en || '') : '';
      return '<div style="font-size:9.5pt;margin-top:4px"><strong>' + esc(ed.institution || '') + '</strong><br>'
        + esc(degree) + '<br><em style="color:#555">' + esc(location) + (ed.period ? ' · ' + esc(ed.period) : '') + '</em></div>';
    }).join('');

    var html = '<div class="cv-wrap">'
      + '<div class="cv-sidebar">' + sidebar + '</div>'
      + '<div class="cv-main">'
      + '<div class="cv-name">' + esc(p.name || '') + '</div>'
      + (contact ? '<div class="cv-contact">' + contact + '</div>' : '')
      + (links ? '<div class="cv-contact">' + links + '</div>' : '')
      + (p.address ? '<div class="cv-contact">' + esc(p.address) + '</div>' : '')
      + '<div class="cv-section" style="margin-top:12px"><div class="cv-section-title">' + L.aboutMe + '</div><hr class="cv-divider"/>'
      + '<div style="font-size:9.5pt">' + esc(profile.about ? (profile.about[lang] || '') : '') + '</div></div>'
      + (expHtml ? '<div class="cv-section"><div class="cv-section-title">' + L.experience + '</div><hr class="cv-divider"/>' + expHtml + '</div>' : '')
      + (eduHtml ? '<div class="cv-section"><div class="cv-section-title">' + L.education + '</div><hr class="cv-divider"/>' + eduHtml + '</div>' : '')
      + '</div></div>';

    document.getElementById('cv-preview').innerHTML = html;
  }

  return { render: render };
})();
```

- [ ] **Step 2: Verify in browser console**

Navigate to `builder.html?id=<any-id>` (even invalid). Open console:
```js
RenderCV.render(Store.createEmpty(), 'en')
```
Expected: sidebar + main column rendered in `#cv-preview`, no errors. Photo placeholder shows "No photo".

- [ ] **Step 3: Commit**

```bash
git add js/render-cv.js
git commit -m "feat: render-cv.js — CV preview with sidebar, experience, education"
```

---

## Task 5: Cover Letter Preview Renderer

**Files:**
- Create: `js/render-cl.js`

- [ ] **Step 1: Create `js/render-cl.js`**

```js
var RenderCL = (function () {
  function esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function render(profile, lang) {
    var p = profile.personal || {};
    var meta = profile.meta || {};
    var cl = profile.coverLetter || {};

    var greeting = lang === 'de'
      ? 'Sehr geehrtes ' + esc(meta.company || '') + '-Team,'
      : 'Dear ' + esc(meta.company || '') + ' Hiring Team,';

    var closing = lang === 'de' ? 'Mit freundlichen Grüßen,' : 'Warm regards,';

    var contact = [p.address, [p.phone, p.email].filter(Boolean).join(' | '), [p.linkedin, p.github].filter(Boolean).join(' | ')]
      .filter(Boolean).map(esc).join('<br>');

    var body = (cl.body ? (cl.body[lang] || '') : '').split('\n\n')
      .filter(function (t) { return t.trim(); })
      .map(function (para) { return '<p class="cl-para">' + esc(para) + '</p>'; }).join('');

    var date = cl.date ? (cl.date[lang] || '') : '';

    var html = '<div class="cl-wrap">'
      + '<div style="margin-bottom:24px"><div class="cl-sender-name">' + esc(p.name || '') + '</div>'
      + '<div class="cl-sender-contact">' + contact + '</div></div>'
      + '<div class="cl-addressee"><strong>' + esc(meta.company || '') + '</strong><br>'
      + '<em style="font-size:9.5pt">' + esc(meta.position || '') + '</em></div>'
      + (date ? '<div style="margin-bottom:16px;font-size:9.5pt">' + esc(date) + '</div>' : '')
      + '<div style="margin-bottom:14px">' + greeting + '</div>'
      + body
      + '<div style="margin-top:24px;font-size:9.5pt"><div>' + closing + '</div>'
      + '<div style="margin-top:28px;font-weight:600">' + esc(p.name || '') + '</div></div>'
      + '</div>';

    document.getElementById('cl-preview').innerHTML = html;
  }

  return { render: render };
})();
```

- [ ] **Step 2: Verify in browser console**

```js
RenderCL.render({ personal: { name: 'Test User', email: 'test@test.com' }, meta: { company: 'Acme', position: 'Dev' }, coverLetter: { body: { en: 'Hello.\n\nBye.' } } }, 'en')
```
Expected: Cover letter with sender name, addressee, greeting, two paragraphs, closing signature.

- [ ] **Step 3: Commit**

```bash
git add js/render-cl.js
git commit -m "feat: render-cl.js — Cover Letter preview renderer"
```

---

## Task 6: PDF Export

**Files:**
- Create: `js/print.js`

- [ ] **Step 1: Create `js/print.js`**

```js
var Print = (function () {
  var BASE_CSS = '<style>'
    + '@page{size:A4;margin:1.5cm}'
    + '*{box-sizing:border-box}'
    + 'body{margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10pt;color:#1a1a1a;line-height:1.45}'
    + 'a{color:#555;text-decoration:none}'
    + '.cv-wrap{display:flex;min-height:100vh}'
    + '.cv-sidebar{width:32%;background:#1e2d40;color:#e8edf3;padding:24px 18px}'
    + '.cv-sidebar-photo{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:4px;margin-bottom:18px;display:block}'
    + '.cv-sidebar-section{margin-bottom:18px}'
    + '.cv-sidebar-section-title{font-size:8pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8aaac8;margin-bottom:5px;padding-bottom:3px;border-bottom:1px solid #2e3d52}'
    + '.cv-sidebar-tag{display:inline-block;background:#2e3d52;color:#e8edf3;border-radius:4px;padding:2px 7px;margin:2px 2px 2px 0;font-size:8.5pt}'
    + '.cv-sidebar-list{margin:0;padding:0;list-style:none}'
    + '.cv-sidebar-list li{font-size:9pt;margin-bottom:3px}'
    + '.cv-sidebar-text{font-size:9pt;line-height:1.55}'
    + '.cv-main{flex:1;padding:20px 22px}'
    + '.cv-name{font-size:20pt;font-weight:700;margin-bottom:4px}'
    + '.cv-contact{font-size:8.5pt;color:#555;line-height:1.7}'
    + '.cv-section{margin-bottom:10px}'
    + '.cv-section-title{font-size:11pt;font-weight:700;color:#0056b3;letter-spacing:.03em;margin-bottom:1px}'
    + '.cv-divider{border:none;border-top:0.5px solid #bbb;margin:1px 0 5px}'
    + '.cv-exp-header{display:flex;justify-content:space-between}'
    + '.cv-exp-period{font-size:8.5pt;color:#555;text-align:right;white-space:nowrap;flex-shrink:0;margin-left:10px}'
    + '.cv-exp-bullets{margin:4px 0 0;padding-left:14px}'
    + '.cv-exp-bullets li{font-size:9.5pt;margin-bottom:2px}'
    + '.cv-bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}'
    + '.cl-wrap{font-family:Arial,Helvetica,sans-serif;font-size:10pt;color:#1a1a1a;line-height:1.55}'
    + '.cl-sender-name{font-size:16pt;font-weight:700;margin-bottom:5px}'
    + '.cl-sender-contact{font-size:9pt;color:#555;line-height:1.7}'
    + '.cl-para{font-size:9.5pt;margin:0 0 12px}'
    + '</style>';

  function openAndPrint(bodyHTML) {
    var win = window.open('', '_blank');
    if (!win) { alert('Allow popups for this page, then try again.'); return; }
    win.document.open();
    win.document.write('<!DOCTYPE html><html><head><meta charset="utf-8">' + BASE_CSS + '</head><body>' + bodyHTML + '</body></html>');
    win.document.close();
    setTimeout(function () { win.focus(); win.print(); }, 600);
  }

  function printCV(profile, lang) {
    // Reuse the innerHTML that RenderCV already built, or rebuild it
    openAndPrint(document.getElementById('cv-preview').innerHTML);
  }

  function printCL(profile, lang) {
    openAndPrint(document.getElementById('cl-preview').innerHTML);
  }

  return { printCV: printCV, printCL: printCL };
})();
```

- [ ] **Step 2: Verify manually**

1. Open `builder.html?id=<id>`, run in console: `RenderCV.render(Store.createEmpty(), 'en')`
2. Run: `Print.printCV()`
3. Expected: new window opens with CV layout, print dialog appears automatically
4. Repeat with `Print.printCL()` — cover letter prints

- [ ] **Step 3: Commit**

```bash
git add js/print.js
git commit -m "feat: print.js — separate CV and Cover Letter PDF export"
```

---

## Task 7: CV Editor Panel

**Files:**
- Create: `js/editor-cv.js`

- [ ] **Step 1: Create `js/editor-cv.js`**

```js
var EditorCV = (function () {
  var _profile, _lang, _onChange;

  function el(tag, attrs, inner) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'className') e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    if (inner !== undefined) e.innerHTML = inner;
    return e;
  }

  function field(label, value, onInput, opts) {
    opts = opts || {};
    var wrap = el('div', { className: 'field-wrap' });
    if (label) wrap.appendChild(el('label', { className: 'field-label' }, label));
    if (opts.hint) wrap.appendChild(el('div', { className: 'field-hint' }, opts.hint));
    var input;
    if (opts.multi) {
      input = el('textarea', { className: 'field-input', rows: opts.rows || 3 });
    } else {
      input = el('input', { className: 'field-input', type: 'text' });
    }
    input.value = value || '';
    input.addEventListener('input', function () { onInput(input.value); });
    wrap.appendChild(input);
    return wrap;
  }

  function sectionLabel(text) { return el('div', { className: 'section-label' }, text); }

  function buildPersonal(container) {
    container.appendChild(sectionLabel('Personal Info'));
    var grid = el('div', { className: 'field-grid-2' });
    var fields = [
      ['Name', 'name'], ['Phone', 'phone'], ['Email', 'email'], ['Address', 'address'],
      ['LinkedIn', 'linkedin'], ['GitHub', 'github']
    ];
    fields.forEach(function (pair) {
      grid.appendChild(field(pair[0], _profile.personal[pair[1]], function (v) {
        _profile.personal[pair[1]] = v; _onChange();
      }));
    });
    container.appendChild(grid);
  }

  function buildPhoto(container) {
    container.appendChild(sectionLabel('Photo'));
    var wrap = el('div', { className: 'photo-upload-wrap' });
    var thumb = _profile.personal.photo
      ? el('img', { className: 'photo-thumb', src: _profile.personal.photo, alt: 'photo' })
      : el('div', { className: 'photo-thumb-placeholder' }, 'No photo');
    wrap.appendChild(thumb);
    var fileInput = el('input', { type: 'file', accept: 'image/*' });
    fileInput.addEventListener('change', function (e) {
      var file = e.target.files[0]; if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        _profile.personal.photo = ev.target.result;
        _onChange();
        build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
      };
      reader.readAsDataURL(file);
    });
    wrap.appendChild(fileInput);
    container.appendChild(wrap);
  }

  function buildAbout(container) {
    container.appendChild(sectionLabel('About Me — ' + _lang.toUpperCase()));
    container.appendChild(field(null, _profile.about[_lang], function (v) {
      _profile.about[_lang] = v; _onChange();
    }, { multi: true, rows: 4 }));
  }

  function buildSidebar(container) {
    container.appendChild(sectionLabel('Sidebar Sections'));
    var list = el('div');
    (_profile.sidebarSections || []).forEach(function (sec, idx) {
      var item = el('div', { className: 'dynamic-item' });
      var actions = el('div', { className: 'dynamic-item-actions' });
      var delBtn = el('button', { className: 'btn-icon', title: 'Delete' }, '🗑');
      delBtn.addEventListener('click', function () {
        _profile.sidebarSections.splice(idx, 1);
        _onChange();
        build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
      });
      actions.appendChild(delBtn);
      item.appendChild(actions);
      item.appendChild(field('Title', sec.title[_lang] || sec.title.en || '', function (v) {
        sec.title[_lang] = v; _onChange();
      }));
      var typeWrap = el('div', { className: 'field-wrap' });
      typeWrap.appendChild(el('label', { className: 'field-label' }, 'Type'));
      var typeSelect = el('select', { className: 'field-input' },
        '<option value="tags"' + (sec.type === 'tags' ? ' selected' : '') + '>Tags</option>'
        + '<option value="list"' + (sec.type === 'list' ? ' selected' : '') + '>List</option>'
        + '<option value="text"' + (sec.type === 'text' ? ' selected' : '') + '>Text</option>');
      typeSelect.addEventListener('change', function () {
        sec.type = typeSelect.value; _onChange();
        build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
      });
      typeWrap.appendChild(typeSelect);
      item.appendChild(typeWrap);

      if (sec.type === 'tags' || sec.type === 'list') {
        var itemsVal = sec.type === 'tags'
          ? (sec.items || []).join('\n')
          : (sec.items || []).map(function (i) { return typeof i === 'object' ? (i[_lang] || i.en || '') : i; }).join('\n');
        var hint = sec.type === 'tags' ? 'One tag per line' : 'One item per line';
        item.appendChild(field('Items', itemsVal, function (v) {
          var lines = v.split('\n');
          if (sec.type === 'tags') { sec.items = lines; }
          else { sec.items = lines.map(function (l) { var o = {}; o[_lang] = l; return o; }); }
          _onChange();
        }, { multi: true, rows: 4, hint: hint }));
      } else {
        item.appendChild(field('Content', sec.content ? (sec.content[_lang] || '') : '', function (v) {
          if (!sec.content) sec.content = {};
          sec.content[_lang] = v; _onChange();
        }, { multi: true, rows: 4 }));
      }
      list.appendChild(item);
    });

    var addBtn = el('button', { className: 'btn-add' }, '+ Add Section');
    addBtn.addEventListener('click', function () {
      _profile.sidebarSections.push({
        id: 's' + Date.now(),
        title: { en: 'New Section', de: 'Neuer Abschnitt' },
        type: 'list',
        items: []
      });
      _onChange();
      build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
    });
    list.appendChild(addBtn);
    container.appendChild(list);
  }

  function buildExperience(container) {
    container.appendChild(sectionLabel('Experience — ' + _lang.toUpperCase()));
    var list = el('div');
    (_profile.experience || []).forEach(function (job, idx) {
      var item = el('div', { className: 'dynamic-item' });
      var actions = el('div', { className: 'dynamic-item-actions' });
      if (idx > 0) {
        var upBtn = el('button', { className: 'btn-icon', title: 'Move up' }, '↑');
        upBtn.addEventListener('click', function () {
          var tmp = _profile.experience[idx - 1];
          _profile.experience[idx - 1] = _profile.experience[idx];
          _profile.experience[idx] = tmp;
          _onChange();
          build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
        });
        actions.appendChild(upBtn);
      }
      var delBtn = el('button', { className: 'btn-icon', title: 'Delete' }, '🗑');
      delBtn.addEventListener('click', function () {
        _profile.experience.splice(idx, 1);
        _onChange();
        build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
      });
      actions.appendChild(delBtn);
      item.appendChild(actions);

      item.appendChild(field('Job Title', job.title ? (job.title[_lang] || '') : '', function (v) {
        if (!job.title) job.title = {}; job.title[_lang] = v; _onChange();
      }));
      var grid3 = el('div', { className: 'field-grid-3' });
      grid3.appendChild(field('Company', job.company || '', function (v) { job.company = v; _onChange(); }));
      grid3.appendChild(field('Period', job.period || '', function (v) { job.period = v; _onChange(); }));
      grid3.appendChild(field('Duration', job.duration ? (job.duration[_lang] || '') : '', function (v) {
        if (!job.duration) job.duration = {}; job.duration[_lang] = v; _onChange();
      }));
      item.appendChild(grid3);
      item.appendChild(field('Bullets', (job.bullets ? (job.bullets[_lang] || []) : []).join('\n'), function (v) {
        if (!job.bullets) job.bullets = {};
        job.bullets[_lang] = v.split('\n'); _onChange();
      }, { multi: true, rows: 5, hint: 'One per line · **text** for bold' }));
      list.appendChild(item);
    });

    var addBtn = el('button', { className: 'btn-add' }, '+ Add Job');
    addBtn.addEventListener('click', function () {
      _profile.experience.push({
        id: 'e' + Date.now(),
        title: { en: '', de: '' }, company: '', period: '',
        duration: { en: '', de: '' }, bullets: { en: [], de: [] }
      });
      _onChange();
      build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
    });
    list.appendChild(addBtn);
    container.appendChild(list);
  }

  function buildEducation(container) {
    container.appendChild(sectionLabel('Education'));
    var list = el('div');
    (_profile.education || []).forEach(function (ed, idx) {
      var item = el('div', { className: 'dynamic-item' });
      var actions = el('div', { className: 'dynamic-item-actions' });
      var delBtn = el('button', { className: 'btn-icon' }, '🗑');
      delBtn.addEventListener('click', function () {
        _profile.education.splice(idx, 1); _onChange();
        build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
      });
      actions.appendChild(delBtn);
      item.appendChild(actions);
      item.appendChild(field('Institution', ed.institution || '', function (v) { ed.institution = v; _onChange(); }));
      var grid2 = el('div', { className: 'field-grid-2' });
      grid2.appendChild(field('Degree', ed.degree ? (ed.degree[_lang] || '') : '', function (v) {
        if (!ed.degree) ed.degree = {}; ed.degree[_lang] = v; _onChange();
      }));
      grid2.appendChild(field('Period', ed.period || '', function (v) { ed.period = v; _onChange(); }));
      item.appendChild(grid2);
      item.appendChild(field('Location', ed.location ? (ed.location[_lang] || '') : '', function (v) {
        if (!ed.location) ed.location = {}; ed.location[_lang] = v; _onChange();
      }));
      list.appendChild(item);
    });
    var addBtn = el('button', { className: 'btn-add' }, '+ Add Education');
    addBtn.addEventListener('click', function () {
      _profile.education.push({ id: 'ed' + Date.now(), institution: '', degree: { en: '', de: '' }, location: { en: '', de: '' }, period: '' });
      _onChange(); build(document.getElementById('editor-panel'), _profile, _lang, _onChange);
    });
    list.appendChild(addBtn);
    container.appendChild(list);
  }

  function build(container, profile, lang, onChange) {
    _profile = profile; _lang = lang; _onChange = onChange;
    container.innerHTML = '';
    var wrap = el('div', { className: 'panel-card' });
    buildPersonal(wrap);
    buildPhoto(wrap);
    buildAbout(wrap);
    buildSidebar(wrap);
    buildExperience(wrap);
    buildEducation(wrap);
    container.appendChild(wrap);
  }

  return { build: build };
})();
```

- [ ] **Step 2: Verify manually**

1. Open `builder.html?id=<id>`, switch to Edit mode
2. Expected: form appears with Personal Info, Photo upload, About Me, sidebar sections, experience, education
3. Type in Name field — CV preview updates live
4. Click "+ Add Job" — new job entry appears
5. Click 🗑 on a sidebar section — it disappears

- [ ] **Step 3: Commit**

```bash
git add js/editor-cv.js
git commit -m "feat: editor-cv.js — full CV edit form with dynamic sections"
```

---

## Task 8: Cover Letter Editor Panel

**Files:**
- Create: `js/editor-cl.js`

- [ ] **Step 1: Create `js/editor-cl.js`**

```js
var EditorCL = (function () {
  function el(tag, attrs, inner) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'className') e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    if (inner !== undefined) e.innerHTML = inner;
    return e;
  }

  function field(label, value, onInput, opts) {
    opts = opts || {};
    var wrap = el('div', { className: 'field-wrap' });
    if (label) wrap.appendChild(el('label', { className: 'field-label' }, label));
    if (opts.hint) wrap.appendChild(el('div', { className: 'field-hint' }, opts.hint));
    var input;
    if (opts.multi) {
      input = el('textarea', { className: 'field-input', rows: opts.rows || 3 });
    } else {
      input = el('input', { className: 'field-input', type: 'text' });
    }
    input.value = value || '';
    input.addEventListener('input', function () { onInput(input.value); });
    wrap.appendChild(input);
    return wrap;
  }

  function sectionLabel(text) { return el('div', { className: 'section-label' }, text); }

  function build(container, profile, lang, onChange) {
    container.innerHTML = '';
    var wrap = el('div', { className: 'panel-card' });
    var meta = profile.meta || {};
    var cl = profile.coverLetter || {};

    wrap.appendChild(sectionLabel('Profile'));
    var grid2 = el('div', { className: 'field-grid-2' });
    grid2.appendChild(field('Company', meta.company || '', function (v) { profile.meta.company = v; onChange(); }));
    grid2.appendChild(field('Position', meta.position || '', function (v) { profile.meta.position = v; onChange(); }));
    wrap.appendChild(grid2);

    wrap.appendChild(field('Date (' + lang.toUpperCase() + ')', cl.date ? (cl.date[lang] || '') : '', function (v) {
      if (!profile.coverLetter.date) profile.coverLetter.date = {};
      profile.coverLetter.date[lang] = v; onChange();
    }));

    wrap.appendChild(sectionLabel('Letter Body — ' + lang.toUpperCase()));
    wrap.appendChild(el('div', { className: 'field-hint' }, 'Separate paragraphs with a blank line'));
    var bodyInput = el('textarea', { className: 'field-input', rows: 16 });
    bodyInput.value = cl.body ? (cl.body[lang] || '') : '';
    bodyInput.addEventListener('input', function () {
      if (!profile.coverLetter.body) profile.coverLetter.body = {};
      profile.coverLetter.body[lang] = bodyInput.value; onChange();
    });
    wrap.appendChild(bodyInput);

    container.appendChild(wrap);
  }

  return { build: build };
})();
```

- [ ] **Step 2: Verify manually**

Switch tab to "Cover Letter", switch to Edit mode.  
Expected: Company, Position, Date, body textarea visible. Typing in body textarea updates cover letter preview live.

- [ ] **Step 3: Commit**

```bash
git add js/editor-cl.js
git commit -m "feat: editor-cl.js — Cover Letter edit form"
```

---

## Task 9: app.js — Wire Everything Together

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: Create `js/app.js`**

```js
(function () {
  // Read profile id from URL
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  var profile = id ? Store.get(id) : null;
  if (!profile) { window.location.href = 'index.html'; return; }

  var tab = 'cv';       // 'cv' | 'cover'
  var mode = 'preview'; // 'preview' | 'edit'
  var lang = profile.meta.lang || 'en';

  var debounceTimer;
  function persist() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () { Store.save(profile); }, 300);
  }

  function rerender() {
    if (tab === 'cv') {
      RenderCV.render(profile, lang);
    } else {
      RenderCL.render(profile, lang);
    }
  }

  function onChange() { persist(); rerender(); }

  function rebuildEditor() {
    var panel = document.getElementById('editor-panel');
    if (tab === 'cv') {
      EditorCV.build(panel, profile, lang, onChange);
    } else {
      EditorCL.build(panel, profile, lang, onChange);
    }
  }

  function setTab(newTab) {
    tab = newTab;
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    document.getElementById('cv-preview').style.display = tab === 'cv' ? '' : 'none';
    document.getElementById('cl-preview').style.display = tab === 'cover' ? '' : 'none';
    if (mode === 'edit') rebuildEditor();
    rerender();
  }

  function setLang(newLang) {
    lang = newLang;
    profile.meta.lang = lang;
    ['en', 'de'].forEach(function (l) {
      document.getElementById('btn-lang-' + l).classList.toggle('active', l === lang);
    });
    if (mode === 'edit') rebuildEditor();
    rerender();
  }

  function setMode(newMode) {
    mode = newMode;
    document.getElementById('btn-preview').classList.toggle('active', mode === 'preview');
    document.getElementById('btn-edit').classList.toggle('active', mode === 'edit');
    var panel = document.getElementById('editor-panel');
    if (mode === 'edit') {
      panel.style.display = '';
      rebuildEditor();
    } else {
      panel.style.display = 'none';
    }
  }

  // Toolbar wiring
  document.querySelectorAll('.tab-btn').forEach(function (b) {
    b.addEventListener('click', function () { setTab(b.dataset.tab); });
  });
  document.getElementById('btn-lang-en').addEventListener('click', function () { setLang('en'); });
  document.getElementById('btn-lang-de').addEventListener('click', function () { setLang('de'); });
  document.getElementById('btn-preview').addEventListener('click', function () { setMode('preview'); });
  document.getElementById('btn-edit').addEventListener('click', function () { setMode('edit'); });

  document.getElementById('btn-save-cv').addEventListener('click', function () { Print.printCV(profile, lang); });
  document.getElementById('btn-save-cl').addEventListener('click', function () { Print.printCL(profile, lang); });

  document.getElementById('btn-export').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (profile.meta.company || 'cv') + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.getElementById('import-json').addEventListener('change', function (e) {
    var file = e.target.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var data = JSON.parse(ev.target.result);
        data.id = profile.id; // keep same id
        Object.assign(profile, data);
        Store.save(profile);
        if (mode === 'edit') rebuildEditor();
        rerender();
      } catch (err) { alert('Invalid JSON file'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Initial render
  rerender();
})();
```

- [ ] **Step 2: Full end-to-end verify**

1. Open `index.html`, click "+ New Profile" → redirected to builder
2. Switch to Edit mode → forms appear
3. Fill in Name → CV preview name updates live
4. Add a job entry → appears in preview
5. Switch to Cover Letter tab → CL form and preview
6. Switch language EN↔DE → preview switches
7. Click "Save CV as PDF" → print dialog opens with CV
8. Click "Save Cover Letter as PDF" → print dialog opens with CL
9. Click "Export JSON" → file downloads
10. Import the same JSON back → data unchanged
11. Go to Dashboard → card shows company name, change status → persists on refresh

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: app.js — full builder wiring, live preview, PDF, import/export"
```

---

## Task 10: GitHub Pages Setup

**Files:**
- Create: `.nojekyll`

- [ ] **Step 1: Create `.nojekyll`**

```bash
touch .nojekyll
```

This tells GitHub Pages not to process the files with Jekyll (needed when JS filenames start with `_` or for correct static serving).

- [ ] **Step 2: Verify file structure**

```bash
ls -la
```
Expected:
```
index.html
builder.html
.nojekyll
css/
  base.css  layout.css  cv.css  editor.css
js/
  store.js  render-cv.js  render-cl.js  editor-cv.js  editor-cl.js  print.js  app.js  dashboard.js
docs/
```

- [ ] **Step 3: Commit and push**

```bash
git add .nojekyll
git commit -m "chore: add .nojekyll for GitHub Pages"
git remote add origin https://github.com/<your-username>/cv-generator.git
git push -u origin main
```

Then in GitHub repo Settings → Pages → Source: `main` branch, `/ (root)`.

- [ ] **Step 4: Verify deployment**

Open `https://<your-username>.github.io/cv-generator/` — dashboard loads, no 404s in console.
