import { a2Grammar, grammarById, Exercise } from '@/data/a2Grammar';
import { levelVocabulary } from '@/data/levelVocabulary';
import type { PlanDay } from '@/data/a2Plan';
import type { Mistake } from './a2Progress';

export type VocabWord = (typeof levelVocabulary)[number];

export interface QuizItem {
  key: string; // mistake key
  topicTitle: string;
  exercise: Exercise;
  fromMistakes?: boolean;
}

export const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Lenient comparison: case, punctuation, extra spaces, ae/oe/ue/ss spellings are ignored. */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[.,!?;:"'()…-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const isCorrect = (ex: Exercise, given: string) =>
  ex.type === 'mc' ? given === ex.answer : ex.answer.some((a) => normalize(a) === normalize(given));

const itemFromKey = (key: string): QuizItem | null => {
  const [topicId, idx] = key.split('#');
  const topic = grammarById[topicId];
  const exercise = topic?.exercises[Number(idx)];
  return exercise ? { key, topicTitle: topic.title, exercise } : null;
};

export function buildGrammarQuiz(day: PlanDay, mistakes: Record<string, Mistake>): QuizItem[] {
  const pool: QuizItem[] = day.quizFrom.flatMap((id) =>
    grammarById[id].exercises.map((exercise, i) => ({ key: `${id}#${i}`, topicTitle: grammarById[id].title, exercise })),
  );
  const main = shuffle(pool).slice(0, day.quizSize);
  const inMain = new Set(main.map((m) => m.key));
  // Warm-up: up to 4 of your old grammar mistakes from other topics, most-missed first.
  const warmup = Object.values(mistakes)
    .filter((m) => !m.key.startsWith('v#') && !inMain.has(m.key))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map((m) => itemFromKey(m.key))
    .filter((x): x is QuizItem => !!x)
    .map((x) => ({ ...x, fromMistakes: true }));
  return [...warmup, ...main];
}

export function mistakeQuiz(mistakes: Record<string, Mistake>): QuizItem[] {
  return shuffle(
    Object.values(mistakes)
      .filter((m) => !m.key.startsWith('v#'))
      .map((m) => itemFromKey(m.key))
      .filter((x): x is QuizItem => !!x),
  );
}

export function topicQuiz(topicId: string): QuizItem[] {
  const t = grammarById[topicId];
  return shuffle(t.exercises.map((exercise, i) => ({ key: `${topicId}#${i}`, topicTitle: t.title, exercise })));
}

// ---------- Vocabulary ----------

const lessonWords = (level: string, lesson: number) =>
  levelVocabulary.filter((w) => w.level === level && w.category.startsWith(`Lektion ${lesson}:`));

export function wordsForDay(day: PlanDay): VocabWord[] {
  return day.vocab.flatMap(({ level, lesson, part }) => {
    const all = lessonWords(level, lesson);
    const half = Math.ceil(all.length / 2);
    return part === 0 ? all.slice(0, half) : all.slice(half);
  });
}

export const allA2Words = () => levelVocabulary.filter((w) => w.level.startsWith('A2'));

const bareGerman = (w: VocabWord) => (w.article ? w.german.slice(w.article.length + 1) : w.german);

export function buildVocabQuiz(words: VocabWord[], size: number, mistakes: Record<string, Mistake>): QuizItem[] {
  const distractorPool = allA2Words();
  const wrongFirst = words.filter((w) => mistakes[`v#${w.german}`]);
  const chosen = [...shuffle(wrongFirst), ...shuffle(words.filter((w) => !mistakes[`v#${w.german}`]))].slice(0, size);

  return shuffle(chosen).map((w, i) => {
    const key = `v#${w.german}`;
    // Nouns: alternate between article drill and meaning drill so both get trained.
    if (w.article && i % 2 === 0) {
      return {
        key,
        topicTitle: 'Article',
        exercise: {
          type: 'mc',
          prompt: `___ ${bareGerman(w)}  (${w.english})`,
          options: ['der', 'die', 'das'],
          answer: w.article,
          explain: `${w.german}${w.plural ? ` – ${w.plural}` : ''}`,
        },
      };
    }
    const distractors = shuffle(distractorPool.filter((d) => d.english !== w.english))
      .slice(0, 3)
      .map((d) => d.english);
    return {
      key,
      topicTitle: 'Meaning',
      exercise: {
        type: 'mc',
        prompt: w.german,
        options: shuffle([w.english, ...distractors]),
        answer: w.english,
        explain: w.germanExample ? `${w.germanExample} — ${w.englishExample}` : w.english,
      },
    };
  });
}

export const totalExercises = a2Grammar.reduce((n, t) => n + t.exercises.length, 0);
