import { GrammarTopic } from '@/data/a2Grammar';
import { BookOpen, AlertTriangle, Target } from 'lucide-react';
import { speakGerman } from './Quiz';

export const bookRef = (b: { unit: number; page: number }) =>
  b.unit === 0 ? `Appendix "Common irregular verbs", p. ${b.page}` : `Unit ${b.unit}, p. ${b.page}`;

export default function GrammarLesson({ topic }: { topic: GrammarTopic }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-2xl font-bold">{topic.titleDe}</h3>
        <p className="text-muted-foreground">{topic.title}</p>
      </div>

      <div className="flex gap-2 rounded-lg bg-accent/40 p-3 text-sm">
        <Target className="h-4 w-4 shrink-0 translate-y-0.5" />
        <span><b>Why for A2:</b> {topic.why}</span>
      </div>

      <div className="flex gap-2 rounded-lg border p-3 text-sm">
        <BookOpen className="h-4 w-4 shrink-0 translate-y-0.5" />
        <span>
          <b>Your PDF (Basic German):</b> {topic.book.map(bookRef).join(' · ')}. Read the unit, do its exercises, check the key on p. 175, then come back for the quiz.
        </span>
      </div>

      {topic.rules.map((r) => (
        <section key={r.heading} className="space-y-2">
          <h4 className="text-lg font-semibold text-primary">{r.heading}</h4>
          {r.body && <p className="leading-relaxed">{r.body}</p>}
          {r.table && (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-muted">
                    {r.table[0].map((h, i) => (
                      <th key={i} className="border px-2 py-1 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {r.table.slice(1).map((row, i) => (
                    <tr key={i}>
                      {row.map((c, j) => (
                        <td key={j} className={`border px-2 py-1 ${j === 0 ? 'font-medium' : ''}`}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}

      <section className="space-y-2">
        <h4 className="text-lg font-semibold text-primary">Examples (click to listen, then repeat aloud)</h4>
        {topic.examples.map((e) => (
          <button key={e.de} onClick={() => speakGerman(e.de)} className="block w-full rounded border p-2 text-left hover:bg-muted">
            <div className="font-medium italic">{e.de}</div>
            <div className="text-sm text-muted-foreground">{e.en}</div>
          </button>
        ))}
      </section>

      <section className="space-y-1">
        <h4 className="flex items-center gap-2 text-lg font-semibold text-orange-600">
          <AlertTriangle className="h-4 w-4" /> Typical mistakes
        </h4>
        <ul className="list-disc space-y-1 pl-6">
          {topic.pitfalls.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </section>
    </div>
  );
}
