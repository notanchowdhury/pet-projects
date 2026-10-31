import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, RotateCcw, Volume2 } from 'lucide-react';
import { isCorrect, QuizItem } from '@/lib/a2Quiz';
import { PASS_MARK } from '@/data/a2Plan';
import { useA2 } from '@/lib/a2Progress';

interface Props {
  build: () => QuizItem[];
  onFinish?: (score: number) => void;
  passMark?: number;
  speak?: boolean;
}

export const speakGerman = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE';
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
};

export default function Quiz({ build, onFinish, passMark = PASS_MARK, speak }: Props) {
  const { recordAnswer } = useA2();
  const [items, setItems] = useState<QuizItem[]>(build);
  const [i, setI] = useState(0);
  const [given, setGiven] = useState('');
  const [checked, setChecked] = useState<null | boolean>(null);
  const [correct, setCorrect] = useState(0);
  const [wrongList, setWrongList] = useState<QuizItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const done = i >= items.length;

  useEffect(() => {
    if (!done && checked === null) inputRef.current?.focus();
  }, [i, checked, done]);

  useEffect(() => {
    if (done && items.length) onFinish?.(correct / items.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const restart = () => {
    setItems(build());
    setI(0);
    setGiven('');
    setChecked(null);
    setCorrect(0);
    setWrongList([]);
  };

  if (!items.length) return <p className="text-muted-foreground">No questions here yet.</p>;

  if (done) {
    const score = correct / items.length;
    const passed = score >= passMark;
    return (
      <div className="space-y-4">
        <div className={`rounded-lg border-2 p-6 text-center ${passed ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}`}>
          <div className="text-4xl font-bold">{Math.round(score * 100)}%</div>
          <div className="mt-1">{correct} / {items.length} correct</div>
          <div className="mt-2 font-semibold">
            {passed ? 'Bestanden! ✅' : `Not passed. You need ${Math.round(passMark * 100)}% — read the rules again and redo it.`}
          </div>
        </div>
        {wrongList.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Your mistakes (saved to the mistake notebook):</h4>
            {wrongList.map((w, k) => (
              <div key={k} className="rounded border p-3 text-sm">
                <div className="font-medium">{w.exercise.prompt}</div>
                <div className="text-green-700 dark:text-green-400">
                  ✓ {w.exercise.type === 'mc' ? w.exercise.answer : w.exercise.answer[0]}
                </div>
                <div className="text-muted-foreground">{w.exercise.explain}</div>
              </div>
            ))}
          </div>
        )}
        <Button onClick={restart} variant={passed ? 'outline' : 'default'} className="gap-2">
          <RotateCcw className="h-4 w-4" /> {passed ? 'Practice again' : 'Retry (new order)'}
        </Button>
      </div>
    );
  }

  const item = items[i];
  const ex = item.exercise;

  const check = (value: string) => {
    if (checked !== null || !value.trim()) return;
    const ok = isCorrect(ex, value);
    setGiven(value);
    setChecked(ok);
    recordAnswer(item.key, ok);
    if (ok) setCorrect((c) => c + 1);
    else setWrongList((w) => [...w, item]);
  };

  const next = () => {
    setI((n) => n + 1);
    setGiven('');
    setChecked(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Progress value={(i / items.length) * 100} className="h-2" />
        <span className="whitespace-nowrap text-sm text-muted-foreground">{i + 1}/{items.length}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{item.topicTitle}</Badge>
        {item.fromMistakes && <Badge className="bg-orange-500">Old mistake: fix it</Badge>}
      </div>
      <div className="flex items-start gap-2 text-xl font-medium">
        <span>{ex.prompt}</span>
        {speak && (
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => speakGerman(ex.prompt.replace('___', ''))} aria-label="Listen">
            <Volume2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {ex.type === 'mc' ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {ex.options.map((o) => {
            const isAns = o === ex.answer;
            const style =
              checked === null
                ? ''
                : isAns
                  ? 'border-green-600 bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
                  : o === given
                    ? 'border-red-600 bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100'
                    : 'opacity-50';
            return (
              <Button key={o} variant="outline" className={`h-auto justify-start whitespace-normal py-3 text-left ${style}`} onClick={() => check(o)}>
                {o}
              </Button>
            );
          })}
        </div>
      ) : (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            check(given);
          }}
        >
          <Input
            ref={inputRef}
            value={given}
            disabled={checked !== null}
            onChange={(e) => setGiven(e.target.value)}
            placeholder={ex.hint ?? 'Type your answer (ä/ae both OK)'}
            autoComplete="off"
            spellCheck={false}
          />
          {checked === null && <Button type="submit">Check</Button>}
        </form>
      )}

      {checked !== null && (
        <div className={`flex gap-3 rounded-lg p-4 ${checked ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
          {checked ? <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" /> : <XCircle className="h-5 w-5 shrink-0 text-red-600" />}
          <div className="text-sm">
            {!checked && (
              <div className="font-semibold">Correct: {ex.type === 'mc' ? ex.answer : ex.answer[0]}</div>
            )}
            <div>{ex.explain}</div>
          </div>
        </div>
      )}
      {checked !== null && (
        <Button onClick={next} autoFocus>
          Next →
        </Button>
      )}
    </div>
  );
}
