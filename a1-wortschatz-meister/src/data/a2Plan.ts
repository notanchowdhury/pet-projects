// 30-day A2 bootcamp. Each study day = 1 grammar topic + half an A2 vocabulary lesson
// + one exam-style writing task + one speaking task. Every 7th day is a cumulative review.

export type DayKind = 'study' | 'review' | 'exam';

export interface WritingTask {
  prompt: string;
  minWords: number;
  /** Each entry must appear in the text (case-insensitive regex) before the task counts as done. */
  mustUse: { label: string; pattern: string }[];
}

export interface PlanDay {
  day: number;
  kind: DayKind;
  title: string;
  grammar: string[]; // topics to read today
  quizFrom: string[]; // topics the grammar quiz draws from
  quizSize: number;
  vocab: { level: 'A2.1' | 'A2.2'; lesson: number; part: 0 | 1 }[];
  vocabQuizSize: number;
  writing: WritingTask;
  speaking: string;
}

const GRAMMAR_ORDER = [
  'praesens', 'trennbar-imperativ', 'fragen-wortstellung', 'nomen-plural', 'akkusativ', 'dativ',
  'pronomen', 'possessiv', 'modalverben', 'perfekt', 'praeteritum', 'praepositionen',
  'wechsel', 'reflexiv', 'negation', 'komparativ', 'adjektiv', 'nebensatz',
  'konnektoren', 'konjunktiv2', 'verben-praep', 'futur-zeit', 'genitiv-relativ',
];

// Lessons 1–6 belong to A2.1, 7–12 to A2.2. Each lesson is split over two study days.
const lessonRef = (studyIndex: number) => {
  const lesson = Math.floor(studyIndex / 2) + 1;
  return { level: (lesson <= 6 ? 'A2.1' : 'A2.2') as 'A2.1' | 'A2.2', lesson, part: (studyIndex % 2) as 0 | 1 };
};

const W = (prompt: string, minWords: number, ...mustUse: [string, string][]): WritingTask => ({
  prompt,
  minWords,
  mustUse: mustUse.map(([label, pattern]) => ({ label, pattern })),
});

const writing: WritingTask[] = [
  W('Stell dich in einer E-Mail an deinen neuen Deutschkurs vor: Name, Herkunft, Wohnort, Beruf, Hobbys.', 40, ['ich heiße / mein Name ist', 'hei(ß|ss)e|mein name'], ['wohne', 'wohne']),
  W('SMS an deinen Mitbewohner: Du kommst später nach Hause. Bitte ihn, einzukaufen (3 Dinge) und den Müll rauszubringen. Benutze den Imperativ.', 30, ['a separable verb (ein/an/auf/mit…)', '\\b(ein|an|auf|mit|aus|zurück|weg|ab)\\b'], ['bitte', 'bitte']),
  W('Du suchst ein Zimmer. Schreib 6 Fragen an den Vermieter (Preis, Größe, Einzug, Internet, Haustiere, Besichtigung).', 30, ['wie viel', 'wie ?viel'], ['wann', 'wann'], ['question marks', '\\?.*\\?.*\\?']),
  W('Beschreibe dein Zimmer oder deine Wohnung: Welche Möbel hast du? Was ist neu, was alt?', 40, ['der/die/das noun', '\\b(der|die|das)\\b'], ['es gibt', 'es gibt']),
  W('Du gehst einkaufen. Schreib, was du brauchst und warum, und was es im Supermarkt nicht gibt.', 40, ['einen/keinen', '\\b(einen|keinen)\\b'], ['brauche', 'brauche']),
  W('Schreib, wie du zur Arbeit / zum Kurs fährst und mit wem du am Wochenende Zeit verbringst.', 40, ['mit + Dativ', '\\bmit (dem|der|meinem|meiner|einem|einer|den|meinen)\\b'], ['zum / zur', '\\bzu[mr]\\b']),
  W('WOCHENTEST: Schreib eine E-Mail an eine Freundin über deine erste Woche mit dem A2-Plan. Was war leicht, was schwer?', 50, ['Liebe/Lieber', 'liebe'], ['Viele Grüße', 'gr(ü|ue)(ß|ss)e']),
  W('Deine Freundin hat Geburtstag. Schreib ihr eine Nachricht: gratulieren, Geschenk, Einladung.', 30, ['dir / dich', '\\b(dir|dich)\\b']),
  W('Stell deine Familie vor: Wer ist wer, was machen sie, wo wohnen sie?', 40, ['mein/meine', '\\bmeine?\\b'], ['sein/ihr', '\\b(sein|seine|ihr|ihre)\\b']),
  W('E-Mail an deinen Chef: Du bist krank und kannst nicht zur Arbeit kommen. Du musst zum Arzt.', 40, ['Sehr geehrte(r)', 'sehr geehrte'], ['kann / muss', '\\b(kann|muss)\\b']),
  W('Was hast du letztes Wochenende gemacht? Schreib mindestens 5 Sätze im Perfekt.', 50, ['habe … ge…', '\\bhabe\\b'], ['bin … ge…', '\\bbin\\b']),
  W('Erzähl von deiner Kindheit: Wo hast du gewohnt? Was konntest/musstest/durftest du?', 40, ['war', '\\bwar\\b'], ['konnte/musste/durfte', '\\b(konnte|musste|durfte|wollte)\\b']),
  W('Erkläre einem Freund den Weg von deiner Wohnung zum Bahnhof.', 40, ['nach / zum / zur / bis', '\\b(zum|zur|bis)\\b'], ['links/rechts', '\\b(links|rechts|geradeaus)\\b']),
  W('WOCHENTEST: E-Mail an die Sprachschule: Du möchtest einen Kurs wechseln. Schreib, warum und wann du Zeit hast.', 50, ['Sehr geehrte', 'sehr geehrte'], ['Perfekt', '\\b(habe|bin) \\w+\\b'], ['Mit freundlichen Grüßen', 'freundlichen gr']),
  W('Du ziehst um. Schreib, wohin du die Möbel stellst/legst/hängst.', 40, ['in den / auf den / an die', '\\b(in|auf|an|neben|unter) (den|die|das)\\b'], ['stelle/lege/hänge', '\\b(stelle|lege|hänge|haenge)\\b']),
  W('Schreib über deinen Alltag: Wann stehst du auf, was machst du, worauf freust du dich?', 40, ['mich/sich', '\\b(mich|sich|uns)\\b'], ['freue mich', 'freue mich']),
  W('Absage: Du kannst nicht zur Party kommen. Entschuldige dich und schlag einen anderen Termin vor.', 30, ['nicht / kein', '\\b(nicht|kein|keine|keinen)\\b'], ['leider', 'leider']),
  W('Vergleiche deine Heimatstadt mit deiner Stadt in Deutschland (Wetter, Preise, Leute).', 40, ['… -er als', '\\bals\\b'], ['am …-sten', '\\bam \\w+sten\\b']),
  W('Beschreibe deine Lieblingskleidung und deine Traumwohnung mit vielen Adjektiven.', 40, ['adjective with -en/-es/-er ending', '\\b\\w+(en|es|er) \\w+\\b']),
  W('Warum lernst du Deutsch? Schreib 4 Gründe mit "weil" und deine Meinung mit "Ich finde, dass …".', 50, ['weil', '\\bweil\\b'], ['dass', '\\bdass\\b']),
  W('WOCHENTEST: Antwort auf eine Einladung zu einem Grillfest: zusagen, fragen, was du mitbringen sollst, Weg erfragen.', 50, ['Konnektor (deshalb/denn/trotzdem)', '\\b(deshalb|denn|trotzdem|deswegen)\\b'], ['weil/dass/ob', '\\b(weil|dass|ob)\\b']),
  W('Erzähl über einen Tag, an dem alles schiefging. Benutze zuerst, dann, danach, deshalb, trotzdem.', 50, ['deshalb', '\\bdeshalb\\b'], ['trotzdem', '\\btrotzdem\\b'], ['danach/dann', '\\b(danach|dann)\\b']),
  W('Formelle E-Mail an eine Vermieterin: Die Heizung ist kaputt. Bitte höflich um Hilfe.', 50, ['Könnten / Würden Sie', '\\b(k(ö|oe)nnten|w(ü|ue)rden) sie\\b'], ['Sehr geehrte', 'sehr geehrte']),
  W('Worüber ärgerst du dich, worauf freust du dich, wofür interessierst du dich?', 40, ['sich ärgern über / freuen auf / interessieren für', '\\b(über|auf|für)\\b'], ['darauf/darüber/dafür', '\\bda(r|)(auf|über|für|an|mit)\\b']),
  W('Deine Pläne für nächstes Jahr. Nenne Daten und Uhrzeiten.', 40, ['werde', '\\bwerde\\b'], ['am …ten', '\\bam \\w+ten\\b|\\bam \\d+\\.']),
  W('Beschreibe eine Person, die dir wichtig ist (Relativsatz) und wem was gehört.', 40, ['Relativsatz ", der/die/das"', ', (der|die|das|den) ']),
  W('Fehlerheft-Tag: Schreib 8 Sätze über deine letzten Ferien mit Perfekt UND Adjektivendungen.', 50, ['Perfekt', '\\b(habe|bin|haben|sind)\\b'], ['Adjektiv + Nomen', '\\b(einen|einem|einer|dem|den) \\w+en \\w+']),
  W('PRÜFUNG Schreiben Teil 1 + 2: (a) SMS an einen Freund: Du verspätest dich, sag warum und wann du kommst. (b) E-Mail an deine Kursleiterin: Du kannst nächste Woche nicht kommen, frag nach den Hausaufgaben.', 70, ['weil', '\\bweil\\b'], ['Perfekt', '\\b(habe|bin)\\b'], ['höfliche Bitte', '\\b(k(ö|oe)nnten|w(ü|ue)rden)\\b']),
  W('PRÜFUNG: E-Mail an einen Freund: Du hast eine neue Arbeit. Erzähl, wie du sie gefunden hast, wie die Kollegen sind und was du am Wochenende vorhast.', 60, ['Perfekt', '\\b(habe|bin)\\b'], ['dass/weil', '\\b(dass|weil)\\b'], ['Konnektor', '\\b(deshalb|trotzdem|denn|aber)\\b']),
  W('ABSCHLUSSPRÜFUNG: E-Mail an die Stadtbibliothek: Du möchtest einen Ausweis beantragen. Frag nach Öffnungszeiten, Kosten, nötigen Dokumenten und ob man Bücher online verlängern kann.', 60, ['Sehr geehrte', 'sehr geehrte'], ['ob', '\\bob\\b'], ['Könnten/Würden', '\\b(k(ö|oe)nnten|w(ü|ue)rden)\\b'], ['Mit freundlichen Grüßen', 'freundlichen gr']),
];

const speaking: string[] = [
  'Sprich 2 Minuten laut über dich (Name, Alter, Land, Wohnort, Sprachen, Beruf, Hobby). Nimm dich mit dem Handy auf und hör zu.',
  'Lies 10 trennbare Verben aus der Grammatik laut vor und bilde mit jedem einen Imperativ-Satz.',
  'Sprechen Teil 1: Stell zu den Wörtern "Wohnort", "Geburtstag", "Lieblingsessen", "Sport" je eine Frage und beantworte sie selbst.',
  'Sag 20 Nomen aus der heutigen Liste laut MIT Artikel und Plural.',
  'Beschreibe laut, was es in deiner Wohnung gibt und was du kaufen möchtest (einen…, eine…, ein…).',
  'Erzähl laut, wem du oft hilfst und mit wem du sprichst (Dativ!).',
  'WOCHENTEST: 3 Minuten ohne Pause über deinen Tagesablauf sprechen. Aufnehmen.',
  'Antworte laut mit Pronomen: Gefällt dir die Stadt? Kennst du den Lehrer? Hilfst du deiner Mutter? (10 Fragen erfinden)',
  'Sprechen Teil 2: Erzähl 2 Minuten über deine Familie.',
  'Rollenspiel: Du rufst beim Arzt an und brauchst einen Termin. Benutze können/müssen/möchten.',
  'Erzähl 2 Minuten im Perfekt, was du gestern gemacht hast.',
  'Erzähl, was du als Kind konntest, musstest und durftest.',
  'Gib laut eine Wegbeschreibung von deiner Wohnung zum Supermarkt.',
  'WOCHENTEST: Sprechen Teil 2 "Arbeit": Wo arbeitest du? Was machst du? Was gefällt dir (nicht)? 3 Minuten.',
  'Beschreibe laut ein Foto von deinem Zimmer: Was steht/liegt/hängt wo?',
  'Erzähl, worauf du dich freust und wofür du dich interessierst.',
  'Beantworte 10 Fragen mit "Nein, …" und "Doch, …" laut.',
  'Sprechen Teil 3: Vergleiche zwei Wohnungsanzeigen laut (größer, billiger, am besten).',
  'Beschreibe laut 5 Personen auf der Straße/im Bild mit Adjektiven.',
  'Sag 8 Sätze mit "weil" und 4 mit "Ich finde, dass …" zu "Leben in Deutschland".',
  'WOCHENTEST: Sprechen Teil 3 allein üben: Plant einen Ausflug am Samstag (Zeit, Ort, Essen, Transport). Sag beide Rollen.',
  'Erzähl eine Geschichte mit zuerst – dann – danach – deshalb – trotzdem.',
  'Rollenspiel Hotel/Restaurant: nur höfliche Sätze (Ich hätte gern…, Könnten Sie…, Wäre es möglich…).',
  'Stell und beantworte 8 Fragen mit Worauf/Wofür/Mit wem…',
  'Sag laut 15 Uhrzeiten und 10 Daten (z.B. Geburtstage deiner Familie).',
  'Beschreibe 5 Dinge mit Relativsatz: "Ein Handy ist ein Gerät, das …"',
  'Wiederhole laut die 15 Sätze aus deinem Fehlerheft richtig.',
  'PRÜFUNG Sprechen Teil 1–3 komplett allein (15 Min.), aufnehmen, anhören, 3 Fehler notieren.',
  'PRÜFUNG Sprechen Teil 2 zu 2 neuen Themen (Freizeit, Wohnen), je 3 Minuten.',
  'ABSCHLUSS: Sprechen Teil 1–3 komplett noch einmal. Vergleiche mit der Aufnahme von Tag 1!',
];

const REVIEW_DAYS = new Set([7, 14, 21]);

export const a2Plan: PlanDay[] = (() => {
  const days: PlanDay[] = [];
  let studyIndex = 0;
  let grammarIndex = 0;
  const learnedSoFar: string[] = [];
  const vocabSoFar: PlanDay['vocab'] = [];

  for (let day = 1; day <= 30; day++) {
    const base = { day, writing: writing[day - 1], speaking: speaking[day - 1] };

    if (REVIEW_DAYS.has(day)) {
      days.push({
        ...base,
        kind: 'review',
        title: `Week ${day / 7} test`,
        grammar: [],
        quizFrom: [...learnedSoFar],
        quizSize: 25,
        vocab: vocabSoFar.slice(-12),
        vocabQuizSize: 30,
      });
      continue;
    }

    if (day === 27) {
      const vocab = [lessonRef(studyIndex++)];
      vocabSoFar.push(...vocab);
      days.push({ ...base, kind: 'study', title: 'Weak spots: Perfekt & adjective endings', grammar: ['perfekt', 'adjektiv'], quizFrom: ['perfekt', 'adjektiv'], quizSize: 16, vocab, vocabQuizSize: 20 });
      continue;
    }

    if (day >= 28) {
      const all = [...learnedSoFar];
      days.push({
        ...base,
        kind: 'exam',
        title: day === 30 ? 'Final A2 exam' : `Mock exam ${day - 27}`,
        grammar: [],
        quizFrom: all,
        quizSize: day === 30 ? 50 : 35,
        vocab: [...vocabSoFar],
        vocabQuizSize: day === 30 ? 50 : 30,
      });
      continue;
    }

    const topic = GRAMMAR_ORDER[grammarIndex++];
    learnedSoFar.push(topic);
    const vocab = [lessonRef(studyIndex++)];
    vocabSoFar.push(...vocab);
    days.push({ ...base, kind: 'study', title: topic, grammar: [topic], quizFrom: [topic], quizSize: 99, vocab, vocabQuizSize: 20 });
  }
  return days;
})();

export const PASS_MARK = 0.8;
