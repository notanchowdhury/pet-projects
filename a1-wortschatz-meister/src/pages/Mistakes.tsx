import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Quiz from '@/components/a2/Quiz';
import { buildVocabQuiz, mistakeQuiz, allA2Words } from '@/lib/a2Quiz';
import { useA2 } from '@/lib/a2Progress';

export default function Mistakes() {
  const { state } = useA2();
  const [mode, setMode] = useState<'grammar' | 'vocab' | null>(null);
  const [round, setRound] = useState(0);
  const all = Object.values(state.mistakes);
  const grammar = all.filter((m) => !m.key.startsWith('v#'));
  const vocab = all.filter((m) => m.key.startsWith('v#'));
  const vocabWords = () => {
    const keys = new Set(vocab.map((m) => m.key.slice(2)));
    return allA2Words().filter((w) => keys.has(w.german));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Mistake notebook (Fehlerheft)</h1>
        <p className="text-muted-foreground">
          Every wrong answer lands here. It leaves only after you answer it correctly twice in a row. Aim for zero before every weekly test.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="text-4xl font-bold text-red-600">{grammar.length}</div>
            <div>open grammar mistakes</div>
            <Button disabled={!grammar.length} onClick={() => { setMode('grammar'); setRound((r) => r + 1); }}>Drill grammar mistakes</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="text-4xl font-bold text-red-600">{vocab.length}</div>
            <div>open vocabulary mistakes</div>
            <Button disabled={!vocab.length} onClick={() => { setMode('vocab'); setRound((r) => r + 1); }}>Drill vocabulary mistakes</Button>
          </CardContent>
        </Card>
      </div>
      {mode && (
        <Card>
          <CardContent className="pt-6">
            <Quiz
              key={`${mode}${round}`}
              speak={mode === 'vocab'}
              build={() => (mode === 'grammar' ? mistakeQuiz(state.mistakes) : buildVocabQuiz(vocabWords(), 999, state.mistakes))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
