import { useCallback, useEffect, useState } from 'react';
import { a2Plan, PASS_MARK } from '@/data/a2Plan';

export interface DayProgress {
  grammarScore?: number; // best score 0..1
  vocabScore?: number;
  writing?: string;
  speakingDone?: boolean;
  completedAt?: string; // ISO date
}

export interface Mistake {
  key: string; // `${topicId}#${index}` for grammar, `v#${german}` for vocab
  count: number;
  lastWrong: string;
  fixedStreak: number; // consecutive correct answers since last wrong; removed at 2
}

export interface A2State {
  startDate: string | null; // YYYY-MM-DD
  examDate: string | null;
  days: Record<number, DayProgress>;
  mistakes: Record<string, Mistake>;
  activity: string[]; // dates (YYYY-MM-DD) on which any quiz was passed
}

const KEY = 'a2-bootcamp-v1';
const EMPTY: A2State = { startDate: null, examDate: null, days: {}, mistakes: {}, activity: [] };

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const daysBetween = (a: string, b: string) =>
  Math.round((new Date(`${b}T12:00:00`).getTime() - new Date(`${a}T12:00:00`).getTime()) / 86_400_000);

function load(): A2State {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

let state: A2State = load();
const listeners = new Set<(s: A2State) => void>();

function save(next: A2State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: keep in memory */
  }
  listeners.forEach((l) => l(next));
}

export function isDayComplete(p: DayProgress | undefined, day: number) {
  if (!p) return false;
  const plan = a2Plan[day - 1];
  const words = (p.writing ?? '').trim().split(/\s+/).filter(Boolean).length;
  const writingOk =
    words >= plan.writing.minWords && plan.writing.mustUse.every((m) => new RegExp(m.pattern, 'i').test(p.writing ?? ''));
  return (p.grammarScore ?? 0) >= PASS_MARK && (p.vocabScore ?? 0) >= PASS_MARK && writingOk && !!p.speakingDone;
}

export function useA2() {
  const [s, setS] = useState(state);
  useEffect(() => {
    listeners.add(setS);
    return () => void listeners.delete(setS);
  }, []);

  const update = useCallback((fn: (s: A2State) => A2State) => save(fn(state)), []);

  const setDay = useCallback(
    (day: number, patch: Partial<DayProgress>) =>
      update((cur) => {
        const prev = cur.days[day] ?? {};
        const merged: DayProgress = {
          ...prev,
          ...patch,
          grammarScore: Math.max(prev.grammarScore ?? 0, patch.grammarScore ?? 0) || undefined,
          vocabScore: Math.max(prev.vocabScore ?? 0, patch.vocabScore ?? 0) || undefined,
        };
        if (!merged.completedAt && isDayComplete(merged, day)) merged.completedAt = todayISO();
        const passedQuiz = (patch.grammarScore ?? 0) >= PASS_MARK || (patch.vocabScore ?? 0) >= PASS_MARK;
        const activity = passedQuiz && !cur.activity.includes(todayISO()) ? [...cur.activity, todayISO()] : cur.activity;
        return { ...cur, activity, days: { ...cur.days, [day]: merged } };
      }),
    [update],
  );

  const recordAnswer = useCallback(
    (key: string, correct: boolean) =>
      update((cur) => {
        const m = { ...cur.mistakes };
        const existing = m[key];
        if (!correct) m[key] = { key, count: (existing?.count ?? 0) + 1, lastWrong: todayISO(), fixedStreak: 0 };
        else if (existing) {
          if (existing.fixedStreak + 1 >= 2) delete m[key];
          else m[key] = { ...existing, fixedStreak: existing.fixedStreak + 1 };
        }
        return { ...cur, mistakes: m };
      }),
    [update],
  );

  const start = useCallback(
    (startDate: string) => update((cur) => ({ ...cur, startDate, examDate: addDays(startDate, 29) })),
    [update],
  );

  const reset = useCallback(() => save(EMPTY), []);

  // Derived values
  const completed = a2Plan.filter((d) => isDayComplete(s.days[d.day], d.day)).length;
  const scheduledDay = s.startDate ? Math.min(30, Math.max(1, daysBetween(s.startDate, todayISO()) + 1)) : 1;
  const nextDay = a2Plan.find((d) => !isDayComplete(s.days[d.day], d.day))?.day ?? 31;
  // Days that should already be finished (everything before today's scheduled day) but are not.
  const daysBehind = s.startDate ? Math.max(0, scheduledDay - nextDay) : 0;

  let streak = 0;
  for (let d = todayISO(); s.activity.includes(d); d = addDays(d, -1)) streak++;
  if (streak === 0 && s.activity.includes(addDays(todayISO(), -1))) {
    for (let d = addDays(todayISO(), -1); s.activity.includes(d); d = addDays(d, -1)) streak++;
  }

  return {
    state: s,
    setDay,
    recordAnswer,
    start,
    reset,
    completed,
    scheduledDay,
    nextDay,
    daysBehind,
    streak,
    isUnlocked: (day: number) => day <= nextDay,
  };
}
