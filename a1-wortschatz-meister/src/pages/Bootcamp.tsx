import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CalendarClock, CheckCircle2, Lock, Trophy } from 'lucide-react';
import { a2Plan } from '@/data/a2Plan';
import { grammarById } from '@/data/a2Grammar';
import { addDays, daysBetween, isDayComplete, todayISO, useA2 } from '@/lib/a2Progress';

export const dayTitle = (d: (typeof a2Plan)[number]) => (d.kind === 'study' && grammarById[d.title] ? grammarById[d.title].titleDe : d.title);

const RULES = [
  'Every day takes about 2–3 hours. No zero days. Do it before anything else.',
  'A day only counts when ALL 4 tasks are done: grammar quiz ≥ 80%, vocabulary quiz ≥ 80%, writing task (min. words + required structures), speaking task.',
  'You cannot skip ahead: day N+1 opens only after day N is complete. You MAY do two days in one session to catch up.',
  'Every wrong answer goes into your mistake notebook and comes back in the next quizzes until you get it right twice.',
  'Days 7, 14, 21 are tests over everything so far. Days 28–30 are mock exams.',
  'Do the matching unit in your PDF (Basic German) every study day. The app tells you which unit.',
  'Outside the app: 20 min German listening every day (Nicos Weg A2, Deutsche Welle "Langsam gesprochene Nachrichten", podcasts).',
];

export default function Bootcamp() {
  const { state, start, reset, completed, scheduledDay, nextDay, daysBehind, isUnlocked } = useA2();
  const [date, setDate] = useState(todayISO());
  const navigate = useNavigate();

  if (!state.startDate) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
        <h1 className="text-4xl font-bold text-primary">A2 in 30 days: strict mode</h1>
        <p className="text-lg">
          23 grammar topics, the full A2 vocabulary from your course (1,038 words), 30 writing tasks, 30 speaking tasks,
          3 weekly tests and 3 mock exams. Your PDF is linked into every lesson.
        </p>
        <Card>
          <CardHeader><CardTitle>The rules</CardTitle></CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-5">{RULES.map((r) => <li key={r}>{r}</li>)}</ol>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm">
              Start date (day 1)
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <Button size="lg" onClick={() => start(date)}>I commit. Start my 30 days.</Button>
          </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground">Target exam-ready date: {addDays(date, 29)}</p>
      </div>
    );
  }

  const daysLeft = daysBetween(todayISO(), state.examDate!);
  const finished = completed === 30;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarClock className="h-4 w-4" /> Exam-ready by</div>
            <div className="text-3xl font-bold">{daysLeft >= 0 ? `${daysLeft} days` : 'Date passed'}</div>
            <div className="text-sm text-muted-foreground">{state.examDate} · today is scheduled day {scheduledDay}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Progress</div>
            <div className="text-3xl font-bold">{completed} / 30</div>
            <Progress value={(completed / 30) * 100} className="mt-2" />
          </CardContent>
        </Card>
        <Card className={daysBehind ? 'border-red-500' : 'border-green-500'}>
          <CardContent className="pt-6">
            {daysBehind ? (
              <>
                <div className="flex items-center gap-2 font-semibold text-red-600"><AlertTriangle className="h-4 w-4" /> {daysBehind} day{daysBehind > 1 ? 's' : ''} behind</div>
                <p className="mt-1 text-sm">You must finish {daysBehind + 1} days today to be back on schedule. No excuses: start now.</p>
              </>
            ) : finished ? (
              <div className="flex items-center gap-2 font-semibold text-green-600"><Trophy className="h-5 w-5" /> All 30 days done. Book the exam!</div>
            ) : (
              <>
                <div className="flex items-center gap-2 font-semibold text-green-600"><CheckCircle2 className="h-4 w-4" /> On schedule</div>
                <p className="mt-1 text-sm">{nextDay > scheduledDay ? 'Today is done. Review your mistakes or work ahead.' : 'Finish today\'s day to stay on track.'}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {!finished && (
        <Button size="lg" className="w-full text-lg" onClick={() => navigate(`/day/${nextDay}`)}>
          Continue → Day {nextDay}: {dayTitle(a2Plan[nextDay - 1])}
        </Button>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {a2Plan.map((d) => {
          const p = state.days[d.day];
          const done = isDayComplete(p, d.day);
          const unlocked = isUnlocked(d.day);
          const overdue = !done && d.day < scheduledDay;
          const cls = done
            ? 'border-green-500 bg-green-50 dark:bg-green-950'
            : overdue
              ? 'border-red-500 bg-red-50 dark:bg-red-950'
              : d.day === nextDay
                ? 'border-primary ring-2 ring-primary'
                : '';
          const body = (
            <div className={`h-full rounded-lg border p-3 transition ${cls} ${unlocked ? 'hover:shadow-md' : 'opacity-50'}`}>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Day {d.day} · {addDays(state.startDate!, d.day - 1).slice(5)}</span>
                {done ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : !unlocked && <Lock className="h-3 w-3" />}
              </div>
              <div className={`mt-1 text-sm font-semibold ${d.kind !== 'study' ? 'text-orange-600' : ''}`}>{dayTitle(d)}</div>
              {d.vocab.length === 1 && (
                <div className="mt-1 text-xs text-muted-foreground">{d.vocab[0].level} L{d.vocab[0].lesson} ({d.vocab[0].part + 1}/2)</div>
              )}
            </div>
          );
          return unlocked ? <Link key={d.day} to={`/day/${d.day}`}>{body}</Link> : <div key={d.day}>{body}</div>;
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>The rules (you agreed to these)</CardTitle></CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-1 pl-5 text-sm">{RULES.map((r) => <li key={r}>{r}</li>)}</ol>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 text-muted-foreground"
            onClick={() => window.confirm('Delete ALL progress and restart the 30 days?') && reset()}
          >
            Reset everything
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
