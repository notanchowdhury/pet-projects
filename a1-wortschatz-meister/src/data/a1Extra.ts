export interface VocabularyItem {
  english: string;
  german: string;
  pronunciation: string;
  germanExample: string;
  englishExample: string;
  category: string;
  article?: 'der' | 'die' | 'das' | null;
  plural?: string;
}

// Utility: naive stress marker (uppercase first vowel cluster, hyphenate rest)
function stressify(word: string) {
  const vowels = /[aeiouäöüAEIOUÄÖÜ]+/u;
  const m = word.match(vowels);
  if (!m || m.index === undefined) return word.toUpperCase();
  const i = m.index;
  const j = i + m[0].length;
  return word.slice(0, i) + word.slice(i, j).toUpperCase() + (j < word.length ? "-" + word.slice(j).toLowerCase() : "");
}

// Numbers 1..100
const units: Record<number, { de: string; en: string }> = {
  0: { de: "null", en: "zero" },
  1: { de: "eins", en: "one" },
  2: { de: "zwei", en: "two" },
  3: { de: "drei", en: "three" },
  4: { de: "vier", en: "four" },
  5: { de: "fünf", en: "five" },
  6: { de: "sechs", en: "six" },
  7: { de: "sieben", en: "seven" },
  8: { de: "acht", en: "eight" },
  9: { de: "neun", en: "nine" },
};

const teens: Record<number, { de: string; en: string }> = {
  10: { de: "zehn", en: "ten" },
  11: { de: "elf", en: "eleven" },
  12: { de: "zwölf", en: "twelve" },
  13: { de: "dreizehn", en: "thirteen" },
  14: { de: "vierzehn", en: "fourteen" },
  15: { de: "fünfzehn", en: "fifteen" },
  16: { de: "sechzehn", en: "sixteen" },
  17: { de: "siebzehn", en: "seventeen" },
  18: { de: "achtzehn", en: "eighteen" },
  19: { de: "neunzehn", en: "nineteen" },
};

const tens: Record<number, { de: string; en: string }> = {
  20: { de: "zwanzig", en: "twenty" },
  30: { de: "dreißig", en: "thirty" },
  40: { de: "vierzig", en: "forty" },
  50: { de: "fünfzig", en: "fifty" },
  60: { de: "sechzig", en: "sixty" },
  70: { de: "siebzig", en: "seventy" },
  80: { de: "achtzig", en: "eighty" },
  90: { de: "neunzig", en: "ninety" },
  100: { de: "hundert", en: "one hundred" },
};

function numberDe(n: number): { de: string; en: string } {
  if (n <= 9) return units[n];
  if (n >= 10 && n <= 19) return teens[n];
  if (n % 10 === 0) return tens[n];
  const u = n % 10;
  const t = n - u;
  // eins -> ein for composites
  const uDe = units[u].de === "eins" ? "ein" : units[u].de;
  return { de: `${uDe}und${tens[t].de}`, en: `${units[u].en} ${tens[t].en}` };
}

function numberItem(n: number): VocabularyItem {
  const { de, en } = numberDe(n);
  return {
    english: en,
    german: de,
    pronunciation: stressify(de),
    germanExample: `Ich habe ${de} Bücher.`,
    englishExample: `I have ${en} books.`,
    category: "numbers",
  };
}

// Countries (selection)
const countryLines = `
Germany|Deutschland
Austria|Österreich
Switzerland|die Schweiz
France|Frankreich
Italy|Italien
Spain|Spanien
Portugal|Portugal
Netherlands|die Niederlande
Belgium|Belgien
Denmark|Dänemark
Norway|Norwegen
Sweden|Schweden
Finland|Finnland
Poland|Polen
Czech Republic|Tschechien
Hungary|Ungarn
Greece|Griechenland
Turkey|die Türkei
United Kingdom|das Vereinigte Königreich
Ireland|Irland
United States|die USA
Canada|Kanada
Mexico|Mexiko
Brazil|Brasilien
Argentina|Argentinien
Chile|Chile
Peru|Peru
China|China
Japan|Japan
South Korea|Südkorea
India|Indien
Russia|Russland
Ukraine|die Ukraine
Australia|Australien
New Zealand|Neuseeland
Egypt|Ägypten
South Africa|Südafrika
Morocco|Marokko
Tunisia|Tunesien
Kenya|Kenia
Nigeria|Nigeria
Iran|Iran
Iraq|Irak
Syria|Syrien
Saudi Arabia|Saudi-Arabien
Israel|Israel
`;

function countryItems(): VocabularyItem[] {
  return countryLines
    .trim()
    .split(/\n+/)
    .map((line) => {
      const [en, de] = line.split("|").map((s) => s.trim());
      const word = de.replace(/^die |^der |^das /, "");
      return {
        english: en.toLowerCase(),
        german: de,
        pronunciation: stressify(word),
        germanExample: `Ich komme aus ${de}.`,
        englishExample: `I come from ${en}.`,
        category: "countries",
      } as VocabularyItem;
    });
}

// Core verbs
const verbLines = `
answer|antworten
ask|fragen
begin|beginnen
believe|glauben
bring|bringen
call|rufen
change|ändern
clean|putzen
close|schließen
cook|kochen
cost|kosten
dance|tanzen
draw|zeichnen
drive|fahren
eat|essen
explain|erklären
find|finden
finish|beenden
forget|vergessen
get|bekommen
give|geben
happen|passieren
have breakfast|frühstücken
hear|hören
help|helfen
hope|hoffen
invite|einladen
kiss|küssen
know (a fact)|wissen
know (be acquainted)|kennen
learn|lernen
like|mögen
live|leben
look|schauen
lose|verlieren
love|lieben
need|brauchen
open|öffnen
pay|bezahlen
play (instrument)|spielen
practice|üben
rain|regnen
read|lesen
remember|erinnern
say|sagen
sell|verkaufen
send|schicken
show|zeigen
sit|sitzen
sleep|schlafen
smile|lächeln
speak|sprechen
stand|stehen
study|studieren
swim|schwimmen
take|nehmen
talk|reden
teach|unterrichten
think|denken
travel|reisen
try|versuchen
wait|warten
walk|gehen
watch|anschauen
work|arbeiten
write|schreiben
`;

function verbItems(): VocabularyItem[] {
  return verbLines
    .trim()
    .split(/\n+/)
    .map((line) => {
      const [en, de] = line.split("|");
      return {
        english: en.trim(),
        german: de.trim(),
        pronunciation: stressify(de.trim()),
        germanExample: `Ich will heute ${de.trim()}.
`,
        englishExample: `I want to ${en.trim()} today.`,
        category: "verbs",
      } as VocabularyItem;
    });
}

// Adjectives
const adjLines = `
angry|wütend
another|ander
awake|wach
beautiful|schön
boring|langweilig
brave|mutig
bright|hell
cheap|billig
clean|sauber
cold|kalt
cool|cool
dark|dunkel
dear|lieb
different|verschieden
dirty|schmutzig
dry|trocken
early|früh
easy|einfach
empty|leer
famous|berühmt
fast|schnell
friendly|freundlich
funny|lustig
good|gut
happy|glücklich
hard|hart
healthy|gesund
heavy|schwer
hot|heiß
hungry|hungrig
important|wichtig
interesting|interessant
late|spät
light|leicht
long|lang
loud|laut
new|neu
nice|nett
old|alt
poor|arm
pretty|hübsch
quiet|leise
rich|reich
sad|traurig
safe|sicher
short|kurz
sick|krank
slow|langsam
small|klein
smart|klug
soft|weich
strong|stark
tall|groß
thirsty|durstig
tired|müde
warm|warm
weak|schwach
wet|nass
young|jung
big|groß
difficult|schwierig
wrong|falsch
correct|right|richtig
simple|einfach
punctual|pünktlich
glad|froh
open|offen
closed|geschlossen
free|frei
busy|beschäftigt
full|voll
expensive|teuer
clear|klar
honest|ehrlich
known|bekannt
possible|möglich
similar|ähnlich
different|anders
special|besonders
necessary|notwendig
common|gemeinsam
frequent|häufig
rare|seldom|selten
personal|persönlich
official|offiziell
public|öffentlich
private|privat
loyal|treu
clever|klug
stupid|dumm
deep|tief
high|hoch
low|niedrig
wide|weit
narrow|eng
sweet|süß
sour|sauer
salty|salzig
bitter|bitter
fortunate|glücklich
unhappy|unglücklich
crazy|verrückt
calm|ruhig
nervous|nervös
aggressive|aggressiv
unfriendly|unfreundlich
patient|geduldig
impatient|ungeduldig
needed|nötig
pure|rein
useful|nützlich
useless|nutzlos
round|rund
angular|eckig
unknown|unbekannt
current|aktuell
technical|technisch
cultural|kulturell
`;

function adjItems(): VocabularyItem[] {
  return adjLines
    .trim()
    .split(/\n+/)
    .map((line) => {
      const [en, de] = line.split("|");
      return {
        english: en.trim(),
        german: de.trim(),
        pronunciation: stressify(de.trim()),
        germanExample: `Das ist sehr ${de.trim()}.`,
        englishExample: `That is very ${en.trim()}.`,
        category: "adjectives",
      } as VocabularyItem;
    });
}

// Household and everyday nouns (with article and plural)
// Format: english|singular with article|plural with die|category
const nounLines = `
book|das Buch|die Bücher|home
notebook|das Heft|die Hefte|school
pen|der Stift|die Stifte|school
pencil|der Bleistift|die Bleistifte|school
eraser|der Radiergummi|die Radiergummis|school
bag|die Tasche|die Taschen|everyday
backpack|der Rucksack|die Rucksäcke|everyday
bottle|die Flasche|die Flaschen|home
cup|die Tasse|die Tassen|home
glass|das Glas|die Gläser|home
plate|der Teller|die Teller|home
fork|die Gabel|die Gabeln|home
spoon|der Löffel|die Löffel|home
knife|das Messer|die Messer|home
napkin|die Serviette|die Servietten|home
key|der Schlüssel|die Schlüssel|home
door|die Tür|die Türen|home
window|das Fenster|die Fenster|home
floor|der Boden|die Böden|home
ceiling|die Decke|die Decken|home
wall|die Wand|die Wände|home
picture|das Bild|die Bilder|home
shelf|das Regal|die Regale|home
bookcase|das Bücherregal|die Bücherregale|home
desk|der Schreibtisch|die Schreibtische|home
chair|der Stuhl|die Stühle|home
sofa|das Sofa|die Sofas|home
armchair|der Sessel|die Sessel|home
bed|das Bett|die Betten|home
blanket|die Decke|die Decken|home
pillow|das Kissen|die Kissen|home
sheet|das Bettlaken|die Bettlaken|home
mirror|der Spiegel|die Spiegel|home
clock|die Uhr|die Uhren|home
calendar|der Kalender|die Kalender|everyday
computer|der Computer|die Computer|everyday
laptop|der Laptop|die Laptops|everyday
phone|das Telefon|die Telefone|everyday
smartphone|das Smartphone|die Smartphones|everyday
headphones|die Kopfhörer|die Kopfhörer|everyday
television|der Fernseher|die Fernseher|home
remote control|die Fernbedienung|die Fernbedienungen|home
camera|die Kamera|die Kameras|everyday
bicycle|das Fahrrad|die Fahrräder|transport
helmet|der Helm|die Helme|transport
bus stop|die Bushaltestelle|die Bushaltestellen|transport
train station|der Bahnhof|die Bahnhöfe|transport
ticket|die Fahrkarte|die Fahrkarten|transport
map|die Karte|die Karten|travel
passport|der Pass|die Pässe|travel
suitcase|der Koffer|die Koffer|travel
umbrella|der Regenschirm|die Regenschirme|weather
raincoat|der Regenmantel|die Regenmäntel|clothing
sunglasses|die Sonnenbrille|die Sonnenbrillen|clothing
hat|der Hut|die Hüte|clothing
cap|die Mütze|die Mützen|clothing
shirt|das Hemd|die Hemden|clothing
t-shirt|das T-Shirt|die T-Shirts|clothing
blouse|die Bluse|die Blusen|clothing
trousers|die Hose|die Hosen|clothing
shorts|die Shorts|die Shorts|clothing
skirt|der Rock|die Röcke|clothing
dress|das Kleid|die Kleider|clothing
shoes|die Schuhe|die Schuhe|clothing
boots|die Stiefel|die Stiefel|clothing
sandals|die Sandalen|die Sandalen|clothing
socks|die Socken|die Socken|clothing
coat|der Mantel|die Mäntel|clothing
jacket|die Jacke|die Jacken|clothing
sweater|der Pullover|die Pullover|clothing
scarf|der Schal|die Schals|clothing
gloves|die Handschuhe|die Handschuhe|clothing
belt|der Gürtel|die Gürtel|clothing
wallet|die Geldbörse|die Geldbörsen|everyday
money|das Geld|-|everyday
credit card|die Kreditkarte|die Kreditkarten|everyday
receipt|die Quittung|die Quittungen|everyday
supermarket|der Supermarkt|die Supermärkte|places
bakery|die Bäckerei|die Bäckereien|places
butcher|die Metzgerei|die Metzgereien|places
pharmacy|die Apotheke|die Apotheken|places
market|der Markt|die Märkte|places
cinema|das Kino|die Kinos|places
theater|das Theater|die Theater|places
museum|das Museum|die Museen|places
library|die Bibliothek|die Bibliotheken|places
park|der Park|die Parks|places
playground|der Spielplatz|die Spielplätze|places
school|die Schule|die Schulen|places
university|die Universität|die Universitäten|places
office|das Büro|die Büros|places
factory|die Fabrik|die Fabriken|places
shop|das Geschäft|die Geschäfte|places
cafe|das Café|die Cafés|places
restaurant|das Restaurant|die Restaurants|places
hotel|das Hotel|die Hotels|places
bank|die Bank|die Banken|places
post office|die Post|die Postämter|places
police station|die Polizeiwache|die Polizeiwachen|places
fire station|die Feuerwache|die Feuerwachen|places
hospital|das Krankenhaus|die Krankenhäuser|places
clinic|die Klinik|die Kliniken|places
dentist|der Zahnarzt|die Zahnärzte|jobs
doctor|der Arzt|die Ärzte|jobs
nurse|die Krankenschwester|die Krankenschwestern|jobs
pharmacist|der Apotheker|die Apotheker|jobs
teacher|der Lehrer|die Lehrer|jobs
student|der Student|die Studenten|jobs
pupil|der Schüler|die Schüler|jobs
chef|der Koch|die Köche|jobs
waiter|der Kellner|die Kellner|jobs
farmer|der Bauer|die Bauern|jobs
mechanic|der Mechaniker|die Mechaniker|jobs
engineer|der Ingenieur|die Ingenieure|jobs
programmer|der Programmierer|die Programmierer|jobs
cleaner|die Reinigungskraft|die Reinigungskräfte|jobs
manager|der Manager|die Manager|jobs
seller|der Verkäufer|die Verkäufer|jobs
customer|der Kunde|die Kunden|jobs
friend|der Freund|die Freunde|people
neighbor|der Nachbar|die Nachbarn|people
child|das Kind|die Kinder|people
baby|das Baby|die Babys|people
family|die Familie|die Familien|people
parents|die Eltern|die Eltern|people
mother|die Mutter|die Mütter|people
father|der Vater|die Väter|people
sister|die Schwester|die Schwestern|people
brother|der Bruder|die Brüder|people
grandmother|die Großmutter|die Großmütter|people
grandfather|der Großvater|die Großväter|people
wife|die Ehefrau|die Ehefrauen|people
husband|der Ehemann|die Ehemänner|people
`;

function nounItems(): VocabularyItem[] {
  return nounLines
    .trim()
    .split(/\n+/)
    .map((line) => {
      const [en, deWithArticle, plural, category] = line.split("|").map((s) => s.trim());
      const base = deWithArticle.split(" ").slice(1).join(" ") || deWithArticle;
      return {
        english: en,
        german: deWithArticle,
        pronunciation: stressify(base),
        germanExample: `Das ist ${deWithArticle}.`,
        englishExample: `This is the ${en}.`,
        category: category || "everyday",
        plural: plural && plural !== '-' ? plural : undefined,
      } as VocabularyItem;
    });
}

// Separable verbs (Trennbare Verben)
const separableVerbData: Array<{ en: string; de: string; deExample: string; enExample: string }> = [
  { en: "get up", de: "aufstehen", deExample: "Ich stehe um 7 Uhr auf.", enExample: "I get up at 7 o'clock." },
  { en: "wake up", de: "aufwachen", deExample: "Wann wachst du auf?", enExample: "When do you wake up?" },
  { en: "come along", de: "mitkommen", deExample: "Kommst du mit ins Kino?", enExample: "Are you coming along to the cinema?" },
  { en: "bring along", de: "mitbringen", deExample: "Ich bringe Kuchen mit.", enExample: "I'm bringing cake along." },
  { en: "invite", de: "einladen", deExample: "Ich lade dich zum Essen ein.", enExample: "I'm inviting you for dinner." },
  { en: "call (phone)", de: "anrufen", deExample: "Ich rufe dich morgen an.", enExample: "I'll call you tomorrow." },
  { en: "pick up", de: "abholen", deExample: "Holst du mich ab?", enExample: "Will you pick me up?" },
  { en: "shop", de: "einkaufen", deExample: "Wir kaufen heute ein.", enExample: "We're shopping today." },
  { en: "tidy up", de: "aufräumen", deExample: "Ich räume mein Zimmer auf.", enExample: "I'm tidying up my room." },
  { en: "close", de: "zumachen", deExample: "Mach bitte die Tür zu.", enExample: "Please close the door." },
  { en: "open", de: "aufmachen", deExample: "Ich mache das Fenster auf.", enExample: "I'm opening the window." },
  { en: "begin", de: "anfangen", deExample: "Der Unterricht fängt um 9 Uhr an.", enExample: "The class begins at 9 o'clock." },
  { en: "stop", de: "aufhören", deExample: "Wann hört der Regen auf?", enExample: "When does the rain stop?" },
  { en: "watch TV", de: "fernsehen", deExample: "Abends sehe ich fern.", enExample: "I watch TV in the evening." },
  { en: "introduce", de: "vorstellen", deExample: "Ich stelle mich vor.", enExample: "I introduce myself." },
  { en: "come back", de: "zurückkommen", deExample: "Wann kommst du zurück?", enExample: "When are you coming back?" },
  { en: "go out", de: "ausgehen", deExample: "Am Wochenende gehe ich aus.", enExample: "I go out on the weekend." },
  { en: "get on", de: "einsteigen", deExample: "Steig schnell ein!", enExample: "Get on quickly!" },
  { en: "get off", de: "aussteigen", deExample: "Ich steige hier aus.", enExample: "I'm getting off here." },
  { en: "prepare", de: "vorbereiten", deExample: "Ich bereite das Essen vor.", enExample: "I'm preparing the food." },
  { en: "turn on", de: "anmachen", deExample: "Mach bitte das Licht an.", enExample: "Please turn on the light." },
  { en: "turn off", de: "ausmachen", deExample: "Mach den Fernseher aus.", enExample: "Turn off the TV." },
  { en: "fill out", de: "ausfüllen", deExample: "Ich fülle das Formular aus.", enExample: "I'm filling out the form." },
  { en: "look up", de: "nachschlagen", deExample: "Ich schlage das Wort nach.", enExample: "I'm looking up the word." },
  { en: "try on", de: "anprobieren", deExample: "Kann ich das anprobieren?", enExample: "Can I try this on?" },
  { en: "clean up", de: "saubermachen", deExample: "Wir machen die Küche sauber.", enExample: "We're cleaning up the kitchen." },
  { en: "hang up", de: "aufhängen", deExample: "Häng deinen Mantel auf.", enExample: "Hang up your coat." },
  { en: "put on", de: "anziehen", deExample: "Ich ziehe meine Jacke an.", enExample: "I'm putting on my jacket." },
  { en: "take off", de: "ausziehen", deExample: "Zieh die Schuhe aus!", enExample: "Take off your shoes!" },
  { en: "write down", de: "aufschreiben", deExample: "Schreib die Nummer auf.", enExample: "Write down the number." },
  { en: "listen", de: "zuhören", deExample: "Hör mir bitte zu.", enExample: "Please listen to me." },
  { en: "pack", de: "einpacken", deExample: "Ich packe meinen Koffer ein.", enExample: "I'm packing my suitcase." },
  { en: "unpack", de: "auspacken", deExample: "Wir packen die Geschenke aus.", enExample: "We're unpacking the gifts." },
  { en: "throw away", de: "wegwerfen", deExample: "Wirf das nicht weg!", enExample: "Don't throw that away!" },
];

function separableVerbItems(): VocabularyItem[] {
  return separableVerbData.map((item) => ({
    english: item.en,
    german: item.de,
    pronunciation: stressify(item.de),
    germanExample: item.deExample,
    englishExample: item.enExample,
    category: "separable verbs",
  }));
}

// Additional A1 vocabulary categories
const basicWords = `
family|Familie|der/die
friend|Freund|der
mother|Mutter|die
father|Vater|der
sister|Schwester|die
brother|Bruder|der
child|Kind|das
baby|Baby|das
husband|Ehemann|der
wife|Ehefrau|die
son|Sohn|der
daughter|Tochter|die
grandfather|Großvater|der
grandmother|Großmutter|die
uncle|Onkel|der
aunt|Tante|die
cousin|Cousin|der
food|Essen|das
bread|Brot|das
water|Wasser|das
milk|Milch|die
coffee|Kaffee|der
tea|Tee|der
sugar|Zucker|der
salt|Salz|das
meat|Fleisch|das
fish|Fisch|der
chicken|Hähnchen|das
egg|Ei|das
cheese|Käse|der
butter|Butter|die
rice|Reis|der
pasta|Nudeln|die
apple|Apfel|der
banana|Banane|die
orange|Orange|die
lemon|Zitrone|die
tomato|Tomate|die
potato|Kartoffel|die
carrot|Karotte|die
onion|Zwiebel|die
salad|Salat|der
soup|Suppe|die
cake|Kuchen|der
chocolate|Schokolade|die
ice cream|Eis|das
beer|Bier|das
wine|Wein|der
juice|Saft|der
restaurant|Restaurant|das
kitchen|Küche|die
plate|Teller|der
cup|Tasse|die
glass|Glas|das
fork|Gabel|die
knife|Messer|das
spoon|Löffel|der
body|Körper|der
head|Kopf|der
hair|Haar|das
eye|Auge|das
ear|Ohr|das
nose|Nase|die
mouth|Mund|der
tooth|Zahn|der
hand|Hand|die
finger|Finger|der
arm|Arm|der
leg|Bein|das
foot|Fuß|der
back|Rücken|der
stomach|Bauch|der
heart|Herz|das
clothes|Kleidung|die
shirt|Hemd|das
dress|Kleid|das
pants|Hose|die
shoes|Schuhe|die
socks|Socken|die
hat|Hut|der
coat|Mantel|der
jacket|Jacke|die
sweater|Pullover|der
skirt|Rock|der
tie|Krawatte|die
glasses|Brille|die
watch|Uhr|die
ring|Ring|der
bag|Tasche|die
color|Farbe|die
white|weiß|
black|schwarz|
red|rot|
blue|blau|
green|grün|
yellow|gelb|
orange|orange|
purple|lila|
pink|rosa|
brown|braun|
gray|grau|
weather|Wetter|das
sun|Sonne|die
rain|Regen|der
snow|Schnee|der
wind|Wind|der
cloud|Wolke|die
hot|heiß|
cold|kalt|
warm|warm|
cool|kühl|
dry|trocken|
wet|nass|
sunny|sonnig|
rainy|regnerisch|
cloudy|bewölkt|
animal|Tier|das
dog|Hund|der
cat|Katze|die
bird|Vogel|der
horse|Pferd|das
cow|Kuh|die
pig|Schwein|das
sheep|Schaf|das
fish|Fisch|der
mouse|Maus|die
transportation|Transport|der
car|Auto|das
bus|Bus|der
train|Zug|der
plane|Flugzeug|das
bike|Fahrrad|das
boat|Boot|das
taxi|Taxi|das
truck|Lastwagen|der
motorcycle|Motorrad|das
feelings|Gefühle|die
happy|glücklich|
sad|traurig|
angry|wütend|
tired|müde|
hungry|hungrig|
thirsty|durstig|
sick|krank|
healthy|gesund|
afraid|ängstlich|
excited|aufgeregt|
surprised|überrascht|
worried|besorgt|
`;

function parseBasicWords(): VocabularyItem[] {
  return basicWords.trim().split('\n')
    .filter(line => line.trim() && !line.includes('|') === false)
    .map(line => {
      const [english, german, article] = line.split('|');
      const germanWord = article ? `${article} ${german}` : german;
      return {
        english: english.trim(),
        german: germanWord.trim(),
        pronunciation: stressify(german.trim()),
        englishExample: `This is ${english.toLowerCase()}.`,
        germanExample: `Das ist ${germanWord.toLowerCase()}.`,
        category: "Basic A1"
      };
    });
}

// Build all extras (targeting 800+ unique words)
export function buildExtraWords(): VocabularyItem[] {
  // Numbers 1..100
  const numbers = Array.from({ length: 100 }, (_, i) => numberItem(i + 1));
  const countries = countryItems();
  const verbs = verbItems();
  const separableVerbs = separableVerbItems();
  const adjs = adjItems();
  const nouns = nounItems();
  const basics = parseBasicWords();

  // Combine and de-duplicate by english+german key
  const map = new Map<string, VocabularyItem>();
  [...numbers, ...countries, ...verbs, ...separableVerbs, ...adjs, ...nouns, ...basics].forEach((item) => {
    const key = `${item.english}|${item.german}`.toLowerCase();
    if (!map.has(key)) map.set(key, item);
  });

  return Array.from(map.values());
}
