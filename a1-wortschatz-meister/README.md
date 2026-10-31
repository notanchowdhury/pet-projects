# A1 Wortschatz Meister: A2 in 30 Days

A German study app with a strict 30-day plan to reach A2, plus the full A1–B2 course vocabulary.

## Features

- **30-day A2 plan.** Each day has four tasks: a grammar lesson and quiz, a vocabulary quiz, an exam-style writing task and a speaking task. A day counts only when all four are done (both quizzes at 80% or more).
- **Strict progression.** The next day unlocks only after the current one is complete. The dashboard shows a countdown, a streak and a red warning when you fall behind schedule.
- **23 A2 grammar topics** with rule tables, examples, typical mistakes and 201 exercises. Each topic points to the matching unit in *Basic German: A Grammar and Workbook* (Schenke & Seago).
- **Mistake notebook.** Every wrong answer is saved and comes back in later quizzes until you answer it correctly twice in a row.
- **Writing checks.** Each writing task has a minimum word count and required structures (for example `weil`, Perfekt or polite `Könnten Sie`).
- **Speaking recorder.** The speaking task can be ticked after an in-browser recording of at least 60 seconds.
- **Weekly tests** on days 7, 14 and 21 and **mock exams** on days 28–30.
- **Vocabulary table** for A1.1–B2 with search, pronunciation (browser text-to-speech) and PDF export.

Progress is stored in the browser's `localStorage`.

## Run locally

```sh
npm ci
npm run dev
```

## Project layout

```text
src/
├── data/
│   ├── levelVocabulary.json   # A1.1–B1.2 course vocabulary
│   ├── b2Vocabulary.json      # B2 vocabulary (kept separate per source)
│   ├── levelVocabulary.ts     # adapter that combines the JSON lists
│   ├── a2Grammar.ts           # grammar topics and exercises
│   └── a2Plan.ts              # 30-day plan, writing and speaking tasks
├── lib/
│   ├── a2Progress.ts          # progress store (localStorage)
│   └── a2Quiz.ts              # quiz builders and answer checking
├── components/a2/             # quiz, grammar lesson, recorder, navigation
└── pages/                     # plan dashboard, day view, grammar, mistakes, vocabulary
```

## Stack

Vite, React, TypeScript, Tailwind CSS, shadcn/ui, jsPDF.
