import { Link, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { a2Grammar, grammarById } from '@/data/a2Grammar';
import { a2Plan } from '@/data/a2Plan';
import GrammarLesson, { bookRef } from '@/components/a2/GrammarLesson';
import Quiz from '@/components/a2/Quiz';
import { topicQuiz } from '@/lib/a2Quiz';
import { useA2 } from '@/lib/a2Progress';

const dayOf = (id: string) => a2Plan.find((d) => d.kind === 'study' && d.grammar[0] === id)?.day;

export function GrammarTopicPage() {
  const { id = '' } = useParams();
  const topic = grammarById[id];
  if (!topic) return <p className="p-8">Unknown topic. <Link to="/grammar" className="underline">Back</Link></p>;
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <Link to="/grammar" className="text-sm text-muted-foreground hover:underline">← All grammar</Link>
      <Card><CardContent className="pt-6"><GrammarLesson topic={topic} /></CardContent></Card>
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-xl font-semibold">Free practice</h3>
          <Quiz key={id} build={() => topicQuiz(id)} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function GrammarHub() {
  const { state } = useA2();
  const mistakesByTopic = (id: string) => Object.keys(state.mistakes).filter((k) => k.startsWith(`${id}#`)).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">A2 grammar: everything you need</h1>
        <p className="text-muted-foreground">
          23 topics in exam-priority order, each linked to your PDF "Basic German: A Grammar and Workbook". Red numbers are open mistakes.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {a2Grammar.map((t, i) => {
          const m = mistakesByTopic(t.id);
          const day = dayOf(t.id);
          return (
            <Link key={t.id} to={`/grammar/${t.id}`}>
              <Card className="h-full transition hover:shadow-md">
                <CardContent className="space-y-1 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">#{i + 1}{day ? ` · Day ${day}` : ''}</span>
                    {m > 0 && <Badge variant="destructive">{m} mistakes</Badge>}
                  </div>
                  <div className="font-semibold">{t.titleDe}</div>
                  <div className="text-sm text-muted-foreground">{t.title}</div>
                  <div className="text-xs text-muted-foreground">PDF: {t.book.map(bookRef).join(' · ')}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
