import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Circle, Volume2 } from 'lucide-react';
import { a2Plan, PASS_MARK } from '@/data/a2Plan';
import { grammarById } from '@/data/a2Grammar';
import { isDayComplete, useA2 } from '@/lib/a2Progress';
import { buildGrammarQuiz, buildVocabQuiz, wordsForDay } from '@/lib/a2Quiz';
import GrammarLesson from '@/components/a2/GrammarLesson';
import Quiz, { speakGerman } from '@/components/a2/Quiz';
import SpeakingRecorder from '@/components/a2/SpeakingRecorder';
import { dayTitle } from './Bootcamp';

const Status = ({ ok, label }: { ok: boolean; label: string }) => (
  <span className="flex items-center gap-1.5">
    {ok ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
    {label}
  </span>
);

function BootcampDay() {
  const n = Number(useParams().n);
  const { state, setDay, isUnlocked } = useA2();
  const plan = a2Plan[n - 1];
  const p = state.days[n] ?? {};
  const [readDone, setReadDone] = useState(plan?.kind !== 'study' || (p.grammarScore ?? 0) > 0);
  const [draft, setDraft] = useState(p.writing ?? '');
  const words = useMemo(() => (plan ? wordsForDay(plan) : []), [plan]);

  if (!plan || !state.startDate) return <Navigate to="/" replace />;
  if (!isUnlocked(n)) return <Navigate to="/" replace />;

  const grammarOk = (p.grammarScore ?? 0) >= PASS_MARK;
  const vocabOk = (p.vocabScore ?? 0) >= PASS_MARK;
  const wordCount = draft.trim().split(/\s+/).filter(Boolean).length;
  const checks = plan.writing.mustUse.map((m) => ({ ...m, ok: new RegExp(m.pattern, 'i').test(draft) }));
  const savedWords = (p.writing ?? '').trim().split(/\s+/).filter(Boolean).length;
  const writingOk =
    savedWords >= plan.writing.minWords && plan.writing.mustUse.every((m) => new RegExp(m.pattern, 'i').test(p.writing ?? ''));
  const complete = isDayComplete(p, n);

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link to="/" className="text-sm text-muted-foreground hover:underline">← All days</Link>
          <h1 className="text-3xl font-bold">Day {n}: {dayTitle(plan)}</h1>
        </div>
        {complete && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-green-600">Day complete ✅</span>
            {n < 30 && <Button asChild><Link to={`/day/${n + 1}`}>Day {n + 1} →</Link></Button>}
          </div>
        )}
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-x-6 gap-y-2 pt-6 text-sm">
          <Status ok={grammarOk} label={`Grammar ${p.grammarScore ? Math.round(p.grammarScore * 100) + '%' : ''}`} />
          <Status ok={vocabOk} label={`Vocabulary ${p.vocabScore ? Math.round(p.vocabScore * 100) + '%' : ''}`} />
          <Status ok={writingOk} label="Writing" />
          <Status ok={!!p.speakingDone} label="Speaking" />
        </CardContent>
      </Card>

      <Tabs defaultValue="grammar">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="grammar">1. Grammar</TabsTrigger>
          <TabsTrigger value="vocab">2. Words</TabsTrigger>
          <TabsTrigger value="writing">3. Writing</TabsTrigger>
          <TabsTrigger value="speaking">4. Speaking</TabsTrigger>
        </TabsList>

        <TabsContent value="grammar" className="space-y-6">
          {plan.grammar.map((id) => (
            <Card key={id}><CardContent className="pt-6"><GrammarLesson topic={grammarById[id]} /></CardContent></Card>
          ))}
          {plan.kind !== 'study' && (
            <p className="rounded-lg bg-accent/40 p-3 text-sm">
              {plan.kind === 'review' ? 'Weekly test' : 'Mock exam'}: {plan.quizSize} random questions from all {plan.quizFrom.length} topics so far, plus your old mistakes.
              Real A2 exams need 60%. Here you need 80%.
            </p>
          )}
          <Card>
            <CardContent className="pt-6">
              {readDone ? (
                <Quiz
                  key={`g${n}`}
                  build={() => buildGrammarQuiz(plan, state.mistakes)}
                  onFinish={(score) => setDay(n, { grammarScore: score })}
                />
              ) : (
                <div className="space-y-3 text-center">
                  <p>Read the rules above aloud, do the PDF unit, write 3 example sentences in your notebook. Then start the quiz.</p>
                  <Button size="lg" onClick={() => setReadDone(true)}>I studied it. Start the quiz</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vocab" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="mb-3 text-sm text-muted-foreground">
                {words.length} words. Read each aloud with the article and plural. Cover the English and test yourself. Then take the quiz ({plan.vocabQuizSize} questions).
              </p>
              <div className="max-h-96 overflow-y-auto rounded border">
                <table className="w-full text-sm">
                  <tbody>
                    {words.map((w, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2">
                          <span className={w.article === 'der' ? 'text-blue-600' : w.article === 'die' ? 'text-pink-600' : w.article === 'das' ? 'text-green-600' : ''}>
                            {w.german}
                          </span>
                          {w.plural && <span className="text-muted-foreground">, {w.plural.replace(/^die /, '')}</span>}
                        </td>
                        <td className="p-2 text-muted-foreground">{w.english}</td>
                        <td className="w-10 p-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => speakGerman(w.german)} aria-label={`Listen to ${w.german}`}>
                            <Volume2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Quiz
                key={`v${n}`}
                speak
                build={() => buildVocabQuiz(words, plan.vocabQuizSize, state.mistakes)}
                onFinish={(score) => setDay(n, { vocabScore: score })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="writing">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <p className="text-lg font-medium">{plan.writing.prompt}</p>
              <Textarea rows={10} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Schreib hier auf Deutsch …" spellCheck={false} />
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <Status ok={wordCount >= plan.writing.minWords} label={`${wordCount}/${plan.writing.minWords} words`} />
                {checks.map((c) => <Status key={c.label} ok={c.ok} label={`uses ${c.label}`} />)}
              </div>
              <Button onClick={() => setDay(n, { writing: draft })}>Save</Button>
              <div className="rounded-lg bg-muted p-3 text-sm">
                <b>Self-check before saving:</b> verb in position 2? Verb at the end after weil/dass? Nouns capitalised? Akkusativ/Dativ endings?
                Greeting and closing (Liebe…/Viele Grüße or Sehr geehrte…/Mit freundlichen Grüßen)? Then paste it into Claude or ask a native speaker for corrections.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="speaking">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <p className="text-lg font-medium">{plan.speaking}</p>
              <SpeakingRecorder onLongEnough={() => setDay(n, { speakingDone: true })} />
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={!!p.speakingDone} onCheckedChange={(v) => setDay(n, { speakingDone: v === true })} />
                I did the speaking task out loud (recorded on another device if the mic here does not work).
              </label>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Remount per day so drafts and quiz state never leak from one day into the next.
export default function BootcampDayRoute() {
  const { n } = useParams();
  return <BootcampDay key={n} />;
}
