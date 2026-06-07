# CV Builder — Profile JSON Format

Импортируй готовый JSON через кнопку **⬆ Import JSON** в билдере или на дашборде.

---

## Минимальный шаблон

```json
{
  "meta": {
    "company": "Название компании",
    "position": "Должность",
    "status": "draft",
    "lang": "en"
  },
  "personal": {
    "name": "Имя Фамилия",
    "email": "email@example.com",
    "phone": "+49 123 456 789",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username",
    "address": "Город, Страна",
    "photo": ""
  },
  "about": {
    "en": "About me in English.",
    "de": "Über mich auf Deutsch."
  },
  "sidebarSections": [],
  "experience": [],
  "education": [],
  "coverLetter": {
    "date": { "en": "June 2026", "de": "Juni 2026" },
    "body": { "en": "", "de": "" }
  }
}
```

> Поля `id` и `createdAt` необязательны — генерируются автоматически при импорте.

---

## Поля

### `meta`

| Поле | Тип | Описание |
|------|-----|----------|
| `company` | string | Название компании |
| `position` | string | Должность |
| `status` | string | `draft` · `sent` · `interview` · `rejected` · `offer` |
| `lang` | string | Язык по умолчанию: `en` или `de` |

---

### `personal`

| Поле | Тип | Описание |
|------|-----|----------|
| `name` | string | Полное имя |
| `email` | string | Email |
| `phone` | string | Телефон |
| `linkedin` | string | LinkedIn URL |
| `github` | string | GitHub URL |
| `address` | string | Адрес |
| `photo` | string | Фото — загружай через UI, поле заполнится автоматически как `data:image/...` |

---

### `about`

Текст "About Me" на каждом языке.

```json
"about": {
  "en": "Senior developer with 5+ years...",
  "de": "Senior-Entwickler mit über 5 Jahren..."
}
```

---

### `sidebarSections`

Массив секций в левой колонке CV. Три типа:

#### Тип `tags` — теги (например, навыки)

```json
{
  "id": "skills",
  "title": { "en": "Skills", "de": "Kenntnisse" },
  "type": "tags",
  "items": ["React", "TypeScript", "CSS3"]
}
```

#### Тип `list` — список с переводом

```json
{
  "id": "languages",
  "title": { "en": "Languages", "de": "Sprachen" },
  "type": "list",
  "items": [
    { "en": "English: Native", "de": "Englisch: Muttersprache" },
    { "en": "German: C1",      "de": "Deutsch: C1" }
  ]
}
```

#### Тип `text` — свободный текст

```json
{
  "id": "hobbies",
  "title": { "en": "Hobbies", "de": "Hobbys" },
  "type": "text",
  "content": {
    "en": "Open source, hiking, photography",
    "de": "Open Source, Wandern, Fotografie"
  }
}
```

---

### `experience`

```json
"experience": [
  {
    "id": "e1",
    "title":    { "en": "Senior Frontend Developer", "de": "Senior Frontend-Entwickler" },
    "company":  "Company Name",
    "period":   "01/2022 – present",
    "duration": { "en": "3 Years", "de": "3 Jahre" },
    "bullets": {
      "en": [
        "Built scalable React app with **50k+ users**",
        "Reduced load time by **30%**"
      ],
      "de": [
        "Entwickelte skalierbare React-App mit **über 50.000 Nutzern**",
        "Ladezeit um **30 %** reduziert"
      ]
    }
  }
]
```

> Текст внутри `**двойных звёздочек**` отображается жирным в CV и PDF.

---

### `education`

```json
"education": [
  {
    "id": "ed1",
    "institution": "University Name",
    "degree": {
      "en": "Bachelor of Science in Computer Science",
      "de": "Bachelor of Science in Informatik"
    },
    "location": {
      "en": "Berlin, Germany",
      "de": "Berlin, Deutschland"
    },
    "period": "2015–2019"
  }
]
```

---

### `coverLetter`

```json
"coverLetter": {
  "date": {
    "en": "June 2026",
    "de": "Juni 2026"
  },
  "body": {
    "en": "First paragraph.\n\nSecond paragraph.\n\nThird paragraph.",
    "de": "Erster Absatz.\n\nZweiter Absatz.\n\nDritter Absatz."
  }
}
```

> Параграфы разделяются двойным переносом строки `\n\n`.  
> Шапка письма (имя, компания, приветствие, подпись) генерируется автоматически из `personal` и `meta`.

---

## Полный пример

Смотри [`test-profile.json`](test-profile.json).
