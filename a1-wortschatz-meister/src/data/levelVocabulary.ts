import raw from './levelVocabulary.json';
import b2Raw from './b2Vocabulary.json';
import { VocabularyItem } from './vocabularyData';

export const LEVELS = ['A1.1', 'A1.2', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2'] as const;

type Raw = { level: string; lesson: string; article: string; german: string; plural: string; english: string; example: string; germanExample: string; englishExample: string; pronunciation?: string };

export const levelVocabulary: (VocabularyItem & { level: string })[] = ([...raw, ...b2Raw] as Raw[]).map((r) => {
  const article = (r.article || null) as VocabularyItem['article'];
  return {
    level: r.level,
    english: r.english,
    german: article ? `${article} ${r.german}` : r.german,
    pronunciation: r.pronunciation || '',
    germanExample: r.germanExample,
    englishExample: r.englishExample,
    category: r.lesson,
    article,
    plural: r.plural && r.plural !== '–' ? `die ${r.plural}` : undefined,
  };
});
