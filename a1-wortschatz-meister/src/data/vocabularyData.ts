import { buildExtraWords } from "./a1Extra";

export interface VocabularyItem {
  english: string;
  german: string;
  pronunciation: string;
  germanExample: string;
  englishExample: string;
  category: string;
  article?: 'der' | 'die' | 'das' | null;
  plural?: string; // e.g., "die Bücher"
}

// Extract article from German word
function extractArticle(german: string): 'der' | 'die' | 'das' | null {
  const lower = german.toLowerCase();
  if (lower.startsWith('der ')) return 'der';
  if (lower.startsWith('die ')) return 'die';
  if (lower.startsWith('das ')) return 'das';
  return null;
}

export const baseA1GermanVocabulary: VocabularyItem[] = [
  // Personal Information & Greetings
  {
    english: "hello",
    german: "hallo",
    pronunciation: "HAL-lo",
    germanExample: "Hallo, wie geht es dir?",
    englishExample: "Hello, how are you?",
    category: "greetings"
  },
  {
    english: "good morning",
    german: "guten Morgen",
    pronunciation: "GOO-ten MOR-gen",
    germanExample: "Guten Morgen! Haben Sie gut geschlafen?",
    englishExample: "Good morning! Did you sleep well?",
    category: "greetings"
  },
  {
    english: "good evening",
    german: "guten Abend",
    pronunciation: "GOO-ten AH-bent",
    germanExample: "Guten Abend, schön Sie zu sehen!",
    englishExample: "Good evening, nice to see you!",
    category: "greetings"
  },
  {
    english: "goodbye",
    german: "auf Wiedersehen",
    pronunciation: "owf VEE-der-zayn",
    germanExample: "Auf Wiedersehen, bis morgen!",
    englishExample: "Goodbye, see you tomorrow!",
    category: "greetings"
  },
  {
    english: "please",
    german: "bitte",
    pronunciation: "BIT-te",
    germanExample: "Können Sie mir bitte helfen?",
    englishExample: "Can you please help me?",
    category: "politeness"
  },
  {
    english: "thank you",
    german: "danke",
    pronunciation: "DAHN-ke",
    germanExample: "Danke für Ihre Hilfe!",
    englishExample: "Thank you for your help!",
    category: "politeness"
  },
  {
    english: "excuse me",
    german: "entschuldigen Sie",
    pronunciation: "ent-SHUL-di-gen zee",
    germanExample: "Entschuldigen Sie, wo ist der Bahnhof?",
    englishExample: "Excuse me, where is the train station?",
    category: "politeness"
  },
  {
    english: "yes",
    german: "ja",
    pronunciation: "yah",
    germanExample: "Ja, das ist richtig.",
    englishExample: "Yes, that is correct.",
    category: "basic"
  },
  {
    english: "no",
    german: "nein",
    pronunciation: "nine",
    germanExample: "Nein, das möchte ich nicht.",
    englishExample: "No, I don't want that.",
    category: "basic"
  },
  {
    english: "name",
    german: "der Name",
    pronunciation: "der NAH-me",
    germanExample: "Wie ist Ihr Name?",
    englishExample: "What is your name?",
    category: "personal"
  },
  {
    english: "age",
    german: "das Alter",
    pronunciation: "das AL-ter",
    germanExample: "Wie alt sind Sie?",
    englishExample: "How old are you?",
    category: "personal"
  },
  {
    english: "address",
    german: "die Adresse",
    pronunciation: "dee ah-DRES-se",
    germanExample: "Was ist Ihre Adresse?",
    englishExample: "What is your address?",
    category: "personal"
  },

  // Family
  {
    english: "family",
    german: "die Familie",
    pronunciation: "dee fa-MIL-ye",
    germanExample: "Meine Familie ist sehr groß.",
    englishExample: "My family is very big.",
    category: "family"
  },
  {
    english: "mother",
    german: "die Mutter",
    pronunciation: "dee MUT-ter",
    germanExample: "Meine Mutter ist Lehrerin.",
    englishExample: "My mother is a teacher.",
    category: "family"
  },
  {
    english: "father",
    german: "der Vater",
    pronunciation: "der FAH-ter",
    germanExample: "Mein Vater arbeitet im Büro.",
    englishExample: "My father works in the office.",
    category: "family"
  },
  {
    english: "brother",
    german: "der Bruder",
    pronunciation: "der BROO-der",
    germanExample: "Mein Bruder ist zwanzig Jahre alt.",
    englishExample: "My brother is twenty years old.",
    category: "family"
  },
  {
    english: "sister",
    german: "die Schwester",
    pronunciation: "dee SHVES-ter",
    germanExample: "Meine Schwester studiert Medizin.",
    englishExample: "My sister studies medicine.",
    category: "family"
  },
  {
    english: "child",
    german: "das Kind",
    pronunciation: "das kint",
    germanExample: "Das Kind spielt im Garten.",
    englishExample: "The child plays in the garden.",
    category: "family"
  },
  {
    english: "husband",
    german: "der Mann",
    pronunciation: "der mahn",
    germanExample: "Mein Mann ist sehr nett.",
    englishExample: "My husband is very nice.",
    category: "family"
  },
  {
    english: "wife",
    german: "die Frau",
    pronunciation: "dee frow",
    germanExample: "Seine Frau ist Ärztin.",
    englishExample: "His wife is a doctor.",
    category: "family"
  },

  // Numbers
  {
    english: "one",
    german: "eins",
    pronunciation: "ayns",
    germanExample: "Ich habe eins Buch.",
    englishExample: "I have one book.",
    category: "numbers"
  },
  {
    english: "two",
    german: "zwei",
    pronunciation: "tsvay",
    germanExample: "Ich kaufe zwei Äpfel.",
    englishExample: "I buy two apples.",
    category: "numbers"
  },
  {
    english: "three",
    german: "drei",
    pronunciation: "dry",
    germanExample: "Er hat drei Kinder.",
    englishExample: "He has three children.",
    category: "numbers"
  },
  {
    english: "four",
    german: "vier",
    pronunciation: "feer",
    germanExample: "Das Auto hat vier Räder.",
    englishExample: "The car has four wheels.",
    category: "numbers"
  },
  {
    english: "five",
    german: "fünf",
    pronunciation: "fuenf",
    germanExample: "Ich arbeite fünf Tage pro Woche.",
    englishExample: "I work five days per week.",
    category: "numbers"
  },
  {
    english: "six",
    german: "sechs",
    pronunciation: "zeks",
    germanExample: "Die Schule beginnt um sechs Uhr.",
    englishExample: "School starts at six o'clock.",
    category: "numbers"
  },
  {
    english: "seven",
    german: "sieben",
    pronunciation: "ZEE-ben",
    germanExample: "Eine Woche hat sieben Tage.",
    englishExample: "A week has seven days.",
    category: "numbers"
  },
  {
    english: "eight",
    german: "acht",
    pronunciation: "akht",
    germanExample: "Ich stehe um acht Uhr auf.",
    englishExample: "I get up at eight o'clock.",
    category: "numbers"
  },
  {
    english: "nine",
    german: "neun",
    pronunciation: "noyn",
    germanExample: "Das Kind ist neun Jahre alt.",
    englishExample: "The child is nine years old.",
    category: "numbers"
  },
  {
    english: "ten",
    german: "zehn",
    pronunciation: "tsayn",
    germanExample: "Zehn plus zehn ist zwanzig.",
    englishExample: "Ten plus ten is twenty.",
    category: "numbers"
  },

  // Colors
  {
    english: "red",
    german: "rot",
    pronunciation: "roht",
    germanExample: "Das Auto ist rot.",
    englishExample: "The car is red.",
    category: "colors"
  },
  {
    english: "blue",
    german: "blau",
    pronunciation: "blou",
    germanExample: "Der Himmel ist blau.",
    englishExample: "The sky is blue.",
    category: "colors"
  },
  {
    english: "green",
    german: "grün",
    pronunciation: "gruen",
    germanExample: "Das Gras ist grün.",
    englishExample: "The grass is green.",
    category: "colors"
  },
  {
    english: "yellow",
    german: "gelb",
    pronunciation: "gelp",
    germanExample: "Die Banane ist gelb.",
    englishExample: "The banana is yellow.",
    category: "colors"
  },
  {
    english: "black",
    german: "schwarz",
    pronunciation: "shvarts",
    germanExample: "Meine Schuhe sind schwarz.",
    englishExample: "My shoes are black.",
    category: "colors"
  },
  {
    english: "white",
    german: "weiß",
    pronunciation: "vays",
    germanExample: "Das Hemd ist weiß.",
    englishExample: "The shirt is white.",
    category: "colors"
  },

  // Food & Drink
  {
    english: "water",
    german: "das Wasser",
    pronunciation: "das VAS-ser",
    germanExample: "Ich trinke viel Wasser.",
    englishExample: "I drink a lot of water.",
    category: "food"
  },
  {
    english: "bread",
    german: "das Brot",
    pronunciation: "das broht",
    germanExample: "Zum Frühstück esse ich Brot.",
    englishExample: "For breakfast I eat bread.",
    category: "food"
  },
  {
    english: "milk",
    german: "die Milch",
    pronunciation: "dee milkh",
    germanExample: "Kinder trinken gerne Milch.",
    englishExample: "Children like to drink milk.",
    category: "food"
  },
  {
    english: "coffee",
    german: "der Kaffee",
    pronunciation: "der ka-FEE",
    germanExample: "Am Morgen trinke ich Kaffee.",
    englishExample: "In the morning I drink coffee.",
    category: "food"
  },
  {
    english: "tea",
    german: "der Tee",
    pronunciation: "der tay",
    germanExample: "Abends trinke ich Tee.",
    englishExample: "In the evening I drink tea.",
    category: "food"
  },
  {
    english: "apple",
    german: "der Apfel",
    pronunciation: "der AP-fel",
    germanExample: "Der Apfel ist sehr süß.",
    englishExample: "The apple is very sweet.",
    category: "food"
  },
  {
    english: "banana",
    german: "die Banane",
    pronunciation: "dee ba-NAH-ne",
    germanExample: "Ich esse eine Banane zum Frühstück.",
    englishExample: "I eat a banana for breakfast.",
    category: "food"
  },
  {
    english: "meat",
    german: "das Fleisch",
    pronunciation: "das flysh",
    germanExample: "Vegetarier essen kein Fleisch.",
    englishExample: "Vegetarians don't eat meat.",
    category: "food"
  },
  {
    english: "fish",
    german: "der Fisch",
    pronunciation: "der fish",
    germanExample: "Freitags essen wir Fisch.",
    englishExample: "On Fridays we eat fish.",
    category: "food"
  },
  {
    english: "cheese",
    german: "der Käse",
    pronunciation: "der KAE-ze",
    germanExample: "Deutscher Käse ist sehr lecker.",
    englishExample: "German cheese is very delicious.",
    category: "food"
  },

  // Body Parts
  {
    english: "head",
    german: "der Kopf",
    pronunciation: "der kopf",
    germanExample: "Mein Kopf tut weh.",
    englishExample: "My head hurts.",
    category: "body"
  },
  {
    english: "eye",
    german: "das Auge",
    pronunciation: "das OW-ge",
    germanExample: "Sie hat blaue Augen.",
    englishExample: "She has blue eyes.",
    category: "body"
  },
  {
    english: "nose",
    german: "die Nase",
    pronunciation: "dee NAH-ze",
    germanExample: "Die Nase ist im Gesicht.",
    englishExample: "The nose is on the face.",
    category: "body"
  },
  {
    english: "mouth",
    german: "der Mund",
    pronunciation: "der munt",
    germanExample: "Mit dem Mund sprechen wir.",
    englishExample: "We speak with our mouth.",
    category: "body"
  },
  {
    english: "hand",
    german: "die Hand",
    pronunciation: "dee hant",
    germanExample: "Ich schreibe mit der rechten Hand.",
    englishExample: "I write with my right hand.",
    category: "body"
  },
  {
    english: "foot",
    german: "der Fuß",
    pronunciation: "der foos",
    germanExample: "Mein Fuß ist groß.",
    englishExample: "My foot is big.",
    category: "body"
  },

  // Clothing
  {
    english: "shirt",
    german: "das Hemd",
    pronunciation: "das hemt",
    germanExample: "Das Hemd ist zu groß.",
    englishExample: "The shirt is too big.",
    category: "clothing"
  },
  {
    english: "pants",
    german: "die Hose",
    pronunciation: "dee HOH-ze",
    germanExample: "Die Hose ist schwarz.",
    englishExample: "The pants are black.",
    category: "clothing"
  },
  {
    english: "dress",
    german: "das Kleid",
    pronunciation: "das klayt",
    germanExample: "Das Kleid ist sehr schön.",
    englishExample: "The dress is very beautiful.",
    category: "clothing"
  },
  {
    english: "shoes",
    german: "die Schuhe",
    pronunciation: "dee SHOO-e",
    germanExample: "Meine Schuhe sind neu.",
    englishExample: "My shoes are new.",
    category: "clothing"
  },
  {
    english: "jacket",
    german: "die Jacke",
    pronunciation: "dee YAH-ke",
    germanExample: "Im Winter trage ich eine warme Jacke.",
    englishExample: "In winter I wear a warm jacket.",
    category: "clothing"
  },

  // House & Home
  {
    english: "house",
    german: "das Haus",
    pronunciation: "das hows",
    germanExample: "Unser Haus ist sehr groß.",
    englishExample: "Our house is very big.",
    category: "home"
  },
  {
    english: "room",
    german: "das Zimmer",
    pronunciation: "das TSIM-mer",
    germanExample: "Mein Zimmer ist klein aber gemütlich.",
    englishExample: "My room is small but cozy.",
    category: "home"
  },
  {
    english: "kitchen",
    german: "die Küche",
    pronunciation: "dee KUE-khe",
    germanExample: "In der Küche koche ich das Essen.",
    englishExample: "I cook the food in the kitchen.",
    category: "home"
  },
  {
    english: "bathroom",
    german: "das Badezimmer",
    pronunciation: "das BAH-de-tsim-mer",
    germanExample: "Das Badezimmer ist sehr sauber.",
    englishExample: "The bathroom is very clean.",
    category: "home"
  },
  {
    english: "bedroom",
    german: "das Schlafzimmer",
    pronunciation: "das SHLAHF-tsim-mer",
    germanExample: "Im Schlafzimmer steht ein großes Bett.",
    englishExample: "There is a big bed in the bedroom.",
    category: "home"
  },
  {
    english: "living room",
    german: "das Wohnzimmer",
    pronunciation: "das VOHN-tsim-mer",
    germanExample: "Wir sehen fern im Wohnzimmer.",
    englishExample: "We watch TV in the living room.",
    category: "home"
  },
  {
    english: "door",
    german: "die Tür",
    pronunciation: "dee tuer",
    germanExample: "Bitte schließen Sie die Tür.",
    englishExample: "Please close the door.",
    category: "home"
  },
  {
    english: "window",
    german: "das Fenster",
    pronunciation: "das FEN-ster",
    germanExample: "Das Fenster ist offen.",
    englishExample: "The window is open.",
    category: "home"
  },
  {
    english: "table",
    german: "der Tisch",
    pronunciation: "der tish",
    germanExample: "Das Buch liegt auf dem Tisch.",
    englishExample: "The book is on the table.",
    category: "home"
  },
  {
    english: "chair",
    german: "der Stuhl",
    pronunciation: "der shtool",
    germanExample: "Der Stuhl ist sehr bequem.",
    englishExample: "The chair is very comfortable.",
    category: "home"
  },
  {
    english: "bed",
    german: "das Bett",
    pronunciation: "das bet",
    germanExample: "Ich schlafe in meinem Bett.",
    englishExample: "I sleep in my bed.",
    category: "home"
  },

  // Transportation
  {
    english: "car",
    german: "das Auto",
    pronunciation: "das OW-to",
    germanExample: "Mein Auto ist blau.",
    englishExample: "My car is blue.",
    category: "transport"
  },
  {
    english: "bus",
    german: "der Bus",
    pronunciation: "der boos",
    germanExample: "Der Bus kommt um acht Uhr.",
    englishExample: "The bus comes at eight o'clock.",
    category: "transport"
  },
  {
    english: "train",
    german: "der Zug",
    pronunciation: "der tsook",
    germanExample: "Der Zug ist sehr schnell.",
    englishExample: "The train is very fast.",
    category: "transport"
  },
  {
    english: "bicycle",
    german: "das Fahrrad",
    pronunciation: "das FAH-raht",
    germanExample: "Mit dem Fahrrad fahre ich zur Arbeit.",
    englishExample: "I go to work by bicycle.",
    category: "transport"
  },
  {
    english: "airplane",
    german: "das Flugzeug",
    pronunciation: "das FLOOK-tsoyk",
    germanExample: "Das Flugzeug fliegt nach Berlin.",
    englishExample: "The airplane flies to Berlin.",
    category: "transport"
  },

  // Time
  {
    english: "today",
    german: "heute",
    pronunciation: "HOY-te",
    germanExample: "Heute ist ein schöner Tag.",
    englishExample: "Today is a beautiful day.",
    category: "time"
  },
  {
    english: "tomorrow",
    german: "morgen",
    pronunciation: "MOR-gen",
    germanExample: "Morgen gehe ich einkaufen.",
    englishExample: "Tomorrow I go shopping.",
    category: "time"
  },
  {
    english: "yesterday",
    german: "gestern",
    pronunciation: "GES-tern",
    germanExample: "Gestern war ich im Kino.",
    englishExample: "Yesterday I was at the cinema.",
    category: "time"
  },
  {
    english: "morning",
    german: "der Morgen",
    pronunciation: "der MOR-gen",
    germanExample: "Am Morgen trinke ich Kaffee.",
    englishExample: "In the morning I drink coffee.",
    category: "time"
  },
  {
    english: "afternoon",
    german: "der Nachmittag",
    pronunciation: "der NAHKH-mi-tahk",
    germanExample: "Am Nachmittag arbeite ich im Garten.",
    englishExample: "In the afternoon I work in the garden.",
    category: "time"
  },
  {
    english: "evening",
    german: "der Abend",
    pronunciation: "der AH-bent",
    germanExample: "Am Abend sehe ich fern.",
    englishExample: "In the evening I watch TV.",
    category: "time"
  },
  {
    english: "night",
    german: "die Nacht",
    pronunciation: "dee nakht",
    germanExample: "In der Nacht schlafe ich.",
    englishExample: "At night I sleep.",
    category: "time"
  },

  // Weather
  {
    english: "weather",
    german: "das Wetter",
    pronunciation: "das VET-ter",
    germanExample: "Das Wetter ist heute schön.",
    englishExample: "The weather is nice today.",
    category: "weather"
  },
  {
    english: "sun",
    german: "die Sonne",
    pronunciation: "dee ZON-ne",
    germanExample: "Die Sonne scheint heute.",
    englishExample: "The sun is shining today.",
    category: "weather"
  },
  {
    english: "rain",
    german: "der Regen",
    pronunciation: "der RAY-gen",
    germanExample: "Es gibt viel Regen im Herbst.",
    englishExample: "There is a lot of rain in autumn.",
    category: "weather"
  },
  {
    english: "snow",
    german: "der Schnee",
    pronunciation: "der shnay",
    germanExample: "Im Winter fällt Schnee.",
    englishExample: "Snow falls in winter.",
    category: "weather"
  },
  {
    english: "wind",
    german: "der Wind",
    pronunciation: "der vint",
    germanExample: "Der Wind ist heute sehr stark.",
    englishExample: "The wind is very strong today.",
    category: "weather"
  },

  // Activities
  {
    english: "work",
    german: "die Arbeit",
    pronunciation: "dee AR-bayt",
    germanExample: "Meine Arbeit macht mir Spaß.",
    englishExample: "I enjoy my work.",
    category: "activities"
  },
  {
    english: "study",
    german: "studieren",
    pronunciation: "shtu-DEE-ren",
    germanExample: "Ich studiere Deutsch an der Universität.",
    englishExample: "I study German at the university.",
    category: "activities"
  },
  {
    english: "read",
    german: "lesen",
    pronunciation: "LAY-zen",
    germanExample: "Ich lese gerne Bücher.",
    englishExample: "I like to read books.",
    category: "activities"
  },
  {
    english: "write",
    german: "schreiben",
    pronunciation: "SHRY-ben",
    germanExample: "Ich schreibe einen Brief.",
    englishExample: "I write a letter.",
    category: "activities"
  },
  {
    english: "listen",
    german: "hören",
    pronunciation: "HUE-ren",
    germanExample: "Ich höre gerne Musik.",
    englishExample: "I like to listen to music.",
    category: "activities"
  },
  {
    english: "speak",
    german: "sprechen",
    pronunciation: "SHPREKH-en",
    germanExample: "Können Sie Deutsch sprechen?",
    englishExample: "Can you speak German?",
    category: "activities"
  },
  {
    english: "sleep",
    german: "schlafen",
    pronunciation: "SHLAH-fen",
    germanExample: "Ich schlafe acht Stunden pro Nacht.",
    englishExample: "I sleep eight hours per night.",
    category: "activities"
  },
  {
    english: "eat",
    german: "essen",
    pronunciation: "ES-sen",
    germanExample: "Wir essen um zwölf Uhr zu Mittag.",
    englishExample: "We eat lunch at twelve o'clock.",
    category: "activities"
  },
  {
    english: "drink",
    german: "trinken",
    pronunciation: "TRIN-ken",
    germanExample: "Ich trinke Wasser zum Essen.",
    englishExample: "I drink water with my meal.",
    category: "activities"
  },
  {
    english: "play",
    german: "spielen",
    pronunciation: "SHPEE-len",
    germanExample: "Die Kinder spielen im Park.",
    englishExample: "The children play in the park.",
    category: "activities"
  },

  // Adjectives
  {
    english: "big",
    german: "groß",
    pronunciation: "grohs",
    germanExample: "Das Haus ist sehr groß.",
    englishExample: "The house is very big.",
    category: "adjectives"
  },
  {
    english: "small",
    german: "klein",
    pronunciation: "klayn",
    germanExample: "Die Katze ist klein.",
    englishExample: "The cat is small.",
    category: "adjectives"
  },
  {
    english: "good",
    german: "gut",
    pronunciation: "goot",
    germanExample: "Das Essen ist sehr gut.",
    englishExample: "The food is very good.",
    category: "adjectives"
  },
  {
    english: "bad",
    german: "schlecht",
    pronunciation: "shlekht",
    germanExample: "Das Wetter ist heute schlecht.",
    englishExample: "The weather is bad today.",
    category: "adjectives"
  },
  {
    english: "beautiful",
    german: "schön",
    pronunciation: "shuen",
    germanExample: "Die Blumen sind sehr schön.",
    englishExample: "The flowers are very beautiful.",
    category: "adjectives"
  },
  {
    english: "ugly",
    german: "hässlich",
    pronunciation: "HAES-likh",
    germanExample: "Das Gebäude ist hässlich.",
    englishExample: "The building is ugly.",
    category: "adjectives"
  },
  {
    english: "new",
    german: "neu",
    pronunciation: "noy",
    germanExample: "Ich habe ein neues Auto.",
    englishExample: "I have a new car.",
    category: "adjectives"
  },
  {
    english: "old",
    german: "alt",
    pronunciation: "alt",
    germanExample: "Mein Großvater ist sehr alt.",
    englishExample: "My grandfather is very old.",
    category: "adjectives"
  },
  {
    english: "hot",
    german: "heiß",
    pronunciation: "hays",
    germanExample: "Der Kaffee ist sehr heiß.",
    englishExample: "The coffee is very hot.",
    category: "adjectives"
  },
  {
    english: "cold",
    german: "kalt",
    pronunciation: "kalt",
    germanExample: "Das Wasser ist kalt.",
    englishExample: "The water is cold.",
    category: "adjectives"
  },

  // Places
  {
    english: "school",
    german: "die Schule",
    pronunciation: "dee SHOO-le",
    germanExample: "Die Kinder gehen zur Schule.",
    englishExample: "The children go to school.",
    category: "places"
  },
  {
    english: "hospital",
    german: "das Krankenhaus",
    pronunciation: "das KRAN-ken-hows",
    germanExample: "Der Arzt arbeitet im Krankenhaus.",
    englishExample: "The doctor works in the hospital.",
    category: "places"
  },
  {
    english: "restaurant",
    german: "das Restaurant",
    pronunciation: "das res-to-RAHN",
    germanExample: "Wir essen im Restaurant zu Abend.",
    englishExample: "We eat dinner at the restaurant.",
    category: "places"
  },
  {
    english: "bank",
    german: "die Bank",
    pronunciation: "dee bahnk",
    germanExample: "Ich gehe zur Bank, um Geld zu holen.",
    englishExample: "I go to the bank to get money.",
    category: "places"
  },
  {
    english: "supermarket",
    german: "der Supermarkt",
    pronunciation: "der ZOO-per-markt",
    germanExample: "Im Supermarkt kaufe ich Lebensmittel.",
    englishExample: "I buy groceries at the supermarket.",
    category: "places"
  },
  {
    english: "pharmacy",
    german: "die Apotheke",
    pronunciation: "dee ah-po-TAY-ke",
    germanExample: "In der Apotheke kaufe ich Medikamente.",
    englishExample: "I buy medicine at the pharmacy.",
    category: "places"
  },
  {
    english: "post office",
    german: "die Post",
    pronunciation: "dee post",
    germanExample: "Ich schicke einen Brief von der Post.",
    englishExample: "I send a letter from the post office.",
    category: "places"
  },

  // Verbs (continued)
  {
    english: "go",
    german: "gehen",
    pronunciation: "GAY-en",
    germanExample: "Ich gehe jeden Tag zur Arbeit.",
    englishExample: "I go to work every day.",
    category: "verbs"
  },
  {
    english: "come",
    german: "kommen",
    pronunciation: "KOM-men",
    germanExample: "Wann kommen Sie nach Hause?",
    englishExample: "When do you come home?",
    category: "verbs"
  },
  {
    english: "see",
    german: "sehen",
    pronunciation: "ZAY-en",
    germanExample: "Ich sehe einen schönen Vogel.",
    englishExample: "I see a beautiful bird.",
    category: "verbs"
  },
  {
    english: "buy",
    german: "kaufen",
    pronunciation: "KOW-fen",
    germanExample: "Ich kaufe Brot im Geschäft.",
    englishExample: "I buy bread at the store.",
    category: "verbs"
  },
  {
    english: "sell",
    german: "verkaufen",
    pronunciation: "fer-KOW-fen",
    germanExample: "Er verkauft sein altes Auto.",
    englishExample: "He sells his old car.",
    category: "verbs"
  },
  {
    english: "help",
    german: "helfen",
    pronunciation: "HEL-fen",
    germanExample: "Können Sie mir bitte helfen?",
    englishExample: "Can you please help me?",
    category: "verbs"
  },
  {
    english: "learn",
    german: "lernen",
    pronunciation: "LER-nen",
    germanExample: "Ich lerne Deutsch seit einem Jahr.",
    englishExample: "I have been learning German for a year.",
    category: "verbs"
  },
  {
    english: "teach",
    german: "unterrichten",
    pronunciation: "UN-ter-rikh-ten",
    germanExample: "Sie unterrichtet Mathematik in der Schule.",
    englishExample: "She teaches mathematics at school.",
    category: "verbs"
  },
  {
    english: "live",
    german: "wohnen",
    pronunciation: "VOH-nen",
    germanExample: "Ich wohne in einer kleinen Stadt.",
    englishExample: "I live in a small town.",
    category: "verbs"
  },

  // Question Words
  {
    english: "what",
    german: "was",
    pronunciation: "vas",
    germanExample: "Was machen Sie heute?",
    englishExample: "What are you doing today?",
    category: "questions"
  },
  {
    english: "where",
    german: "wo",
    pronunciation: "voh",
    germanExample: "Wo ist der Bahnhof?",
    englishExample: "Where is the train station?",
    category: "questions"
  },
  {
    english: "when",
    german: "wann",
    pronunciation: "vahn",
    germanExample: "Wann beginnt der Film?",
    englishExample: "When does the movie start?",
    category: "questions"
  },
  {
    english: "who",
    german: "wer",
    pronunciation: "vair",
    germanExample: "Wer ist das?",
    englishExample: "Who is that?",
    category: "questions"
  },
  {
    english: "why",
    german: "warum",
    pronunciation: "va-RUM",
    germanExample: "Warum lernst du Deutsch?",
    englishExample: "Why are you learning German?",
    category: "questions"
  },
  {
    english: "how",
    german: "wie",
    pronunciation: "vee",
    germanExample: "Wie geht es dir?",
    englishExample: "How are you?",
    category: "questions"
  },
  {
    english: "how much",
    german: "wie viel",
    pronunciation: "vee feel",
    germanExample: "Wie viel kostet das?",
    englishExample: "How much does that cost?",
    category: "questions"
  },

  // More Everyday Words
  {
    english: "money",
    german: "das Geld",
    pronunciation: "das gelt",
    germanExample: "Ich brauche Geld für das Ticket.",
    englishExample: "I need money for the ticket.",
    category: "everyday"
  },
  {
    english: "time",
    german: "die Zeit",
    pronunciation: "dee tsayt",
    germanExample: "Haben Sie Zeit für einen Kaffee?",
    englishExample: "Do you have time for a coffee?",
    category: "everyday"
  },
  {
    english: "book",
    german: "das Buch",
    pronunciation: "das bookh",
    germanExample: "Ich lese ein interessantes Buch.",
    englishExample: "I am reading an interesting book.",
    category: "everyday"
  },
  {
    english: "pen",
    german: "der Stift",
    pronunciation: "der shtift",
    germanExample: "Kann ich Ihren Stift benutzen?",
    englishExample: "Can I use your pen?",
    category: "everyday"
  },
  {
    english: "paper",
    german: "das Papier",
    pronunciation: "das pa-PEER",
    germanExample: "Ich schreibe auf weißes Papier.",
    englishExample: "I write on white paper.",
    category: "everyday"
  },
  {
    english: "phone",
    german: "das Telefon",
    pronunciation: "das te-le-FOHN",
    germanExample: "Mein Telefon klingelt.",
    englishExample: "My phone is ringing.",
    category: "everyday"
  },
  {
    english: "computer",
    german: "der Computer",
    pronunciation: "der kom-PYU-ter",
    germanExample: "Ich arbeite am Computer.",
    englishExample: "I work on the computer.",
    category: "everyday"
  },

  // Days of the Week
  {
    english: "Monday",
    german: "der Montag",
    pronunciation: "der MOHN-tahk",
    germanExample: "Am Montag beginnt die Arbeitswoche.",
    englishExample: "The work week begins on Monday.",
    category: "days"
  },
  {
    english: "Tuesday",
    german: "der Dienstag",
    pronunciation: "der DEENS-tahk",
    germanExample: "Dienstag habe ich einen Termin beim Arzt.",
    englishExample: "On Tuesday I have a doctor's appointment.",
    category: "days"
  },
  {
    english: "Wednesday",
    german: "der Mittwoch",
    pronunciation: "der MIT-vokh",
    germanExample: "Mittwoch ist die Mitte der Woche.",
    englishExample: "Wednesday is the middle of the week.",
    category: "days"
  },
  {
    english: "Thursday",
    german: "der Donnerstag",
    pronunciation: "der DON-ners-tahk",
    germanExample: "Donnerstag gehe ich ins Kino.",
    englishExample: "On Thursday I go to the cinema.",
    category: "days"
  },
  {
    english: "Friday",
    german: "der Freitag",
    pronunciation: "der FRY-tahk",
    germanExample: "Freitag ist der letzte Arbeitstag.",
    englishExample: "Friday is the last work day.",
    category: "days"
  },
  {
    english: "Saturday",
    german: "der Samstag",
    pronunciation: "der ZAHMS-tahk",
    germanExample: "Samstag schlafe ich lange.",
    englishExample: "On Saturday I sleep in.",
    category: "days"
  },
  {
    english: "Sunday",
    german: "der Sonntag",
    pronunciation: "der ZON-tahk",
    germanExample: "Sonntag ist ein Ruhetag.",
    englishExample: "Sunday is a day of rest.",
    category: "days"
  },

  // Months
  {
    english: "January",
    german: "der Januar",
    pronunciation: "der YAH-nu-ahr",
    germanExample: "Januar ist der erste Monat des Jahres.",
    englishExample: "January is the first month of the year.",
    category: "months"
  },
  {
    english: "February",
    german: "der Februar",
    pronunciation: "der FEH-bru-ahr",
    germanExample: "Februar ist der kürzeste Monat.",
    englishExample: "February is the shortest month.",
    category: "months"
  },
  {
    english: "March",
    german: "der März",
    pronunciation: "der mairts",
    germanExample: "Im März beginnt der Frühling.",
    englishExample: "Spring begins in March.",
    category: "months"
  },
  {
    english: "April",
    german: "der April",
    pronunciation: "der ah-PREEL",
    germanExample: "April hat oft schönes Wetter.",
    englishExample: "April often has nice weather.",
    category: "months"
  },
  {
    english: "May",
    german: "der Mai",
    pronunciation: "der my",
    germanExample: "Mai ist ein warmer Monat.",
    englishExample: "May is a warm month.",
    category: "months"
  },
  {
    english: "June",
    german: "der Juni",
    pronunciation: "der YOO-nee",
    germanExample: "Juni ist der Beginn des Sommers.",
    englishExample: "June is the beginning of summer.",
    category: "months"
  },

  // More essential vocabulary continues...
  // Animals
  {
    english: "dog",
    german: "der Hund",
    pronunciation: "der hund",
    germanExample: "Mein Hund ist sehr freundlich.",
    englishExample: "My dog is very friendly.",
    category: "animals"
  },
  {
    english: "cat",
    german: "die Katze",
    pronunciation: "dee KAT-se",
    germanExample: "Die Katze schläft auf dem Sofa.",
    englishExample: "The cat sleeps on the sofa.",
    category: "animals"
  },
  {
    english: "bird",
    german: "der Vogel",
    pronunciation: "der FOH-gel",
    germanExample: "Der Vogel singt am Morgen.",
    englishExample: "The bird sings in the morning.",
    category: "animals"
  },

  // Emotions
  {
    english: "happy",
    german: "glücklich",
    pronunciation: "GLUEK-likh",
    germanExample: "Ich bin heute sehr glücklich.",
    englishExample: "I am very happy today.",
    category: "emotions"
  },
  {
    english: "sad",
    german: "traurig",
    pronunciation: "TROW-rikh",
    germanExample: "Sie ist traurig, weil ihr Hund krank ist.",
    englishExample: "She is sad because her dog is sick.",
    category: "emotions"
  },
  {
    english: "angry",
    german: "wütend",
    pronunciation: "VUE-tent",
    germanExample: "Er ist wütend auf seinen Bruder.",
    englishExample: "He is angry at his brother.",
    category: "emotions"
  },

  // More numbers
  {
    english: "eleven",
    german: "elf",
    pronunciation: "elf",
    germanExample: "Das Kind ist elf Jahre alt.",
    englishExample: "The child is eleven years old.",
    category: "numbers"
  },
  {
    english: "twelve",
    german: "zwölf",
    pronunciation: "tsvuelf",
    germanExample: "Es ist zwölf Uhr mittags.",
    englishExample: "It is twelve o'clock noon.",
    category: "numbers"
  },
  {
    english: "twenty",
    german: "zwanzig",
    pronunciation: "TSVAHN-tsikh",
    germanExample: "Meine Schwester ist zwanzig Jahre alt.",
    englishExample: "My sister is twenty years old.",
    category: "numbers"
  },
  {
    english: "thirty",
    german: "dreißig",
    pronunciation: "DRY-sikh",
    germanExample: "Ich bin dreißig Jahre alt.",
    englishExample: "I am thirty years old.",
    category: "numbers"
  },
  {
    english: "hundred",
    german: "hundert",
    pronunciation: "HUN-dert",
    germanExample: "Das Buch kostet hundert Euro.",
    englishExample: "The book costs one hundred euros.",
    category: "numbers"
  },

  // Jobs/Professions
  {
    english: "teacher",
    german: "der Lehrer",
    pronunciation: "der LAY-rer",
    germanExample: "Der Lehrer erklärt die Grammatik.",
    englishExample: "The teacher explains the grammar.",
    category: "jobs"
  },
  {
    english: "doctor",
    german: "der Arzt",
    pronunciation: "der ahrst",
    germanExample: "Der Arzt untersucht den Patienten.",
    englishExample: "The doctor examines the patient.",
    category: "jobs"
  },
  {
    english: "nurse",
    german: "die Krankenschwester",
    pronunciation: "dee KRAN-ken-shves-ter",
    germanExample: "Die Krankenschwester ist sehr nett.",
    englishExample: "The nurse is very nice.",
    category: "jobs"
  },
  {
    english: "student",
    german: "der Student",
    pronunciation: "der shtu-DENT",
    germanExample: "Der Student lernt fleißig für die Prüfung.",
    englishExample: "The student studies hard for the exam.",
    category: "jobs"
  },

  // Additional essential words to reach 500+
  {
    english: "friend",
    german: "der Freund",
    pronunciation: "der froynt",
    germanExample: "Mein bester Freund kommt heute zu Besuch.",
    englishExample: "My best friend is visiting today.",
    category: "people"
  },
  {
    english: "man",
    german: "der Mann",
    pronunciation: "der mahn",
    germanExample: "Der Mann trägt einen schwarzen Anzug.",
    englishExample: "The man wears a black suit.",
    category: "people"
  },
  {
    english: "woman",
    german: "die Frau",
    pronunciation: "dee frow",
    germanExample: "Die Frau arbeitet als Ärztin.",
    englishExample: "The woman works as a doctor.",
    category: "people"
  },
  {
    english: "person",
    german: "die Person",
    pronunciation: "dee per-ZOHN",
    germanExample: "Diese Person ist sehr hilfsbereit.",
    englishExample: "This person is very helpful.",
    category: "people"
  },
  {
    english: "people",
    german: "die Leute",
    pronunciation: "dee LOY-te",
    germanExample: "Viele Leute sprechen Deutsch.",
    englishExample: "Many people speak German.",
    category: "people"
  },
  {
    english: "country",
    german: "das Land",
    pronunciation: "das lahnt",
    germanExample: "Deutschland ist ein schönes Land.",
    englishExample: "Germany is a beautiful country.",
    category: "places"
  },
  {
    english: "city",
    german: "die Stadt",
    pronunciation: "dee shtaht",
    germanExample: "Berlin ist eine große Stadt.",
    englishExample: "Berlin is a big city.",
    category: "places"
  },
  {
    english: "street",
    german: "die Straße",
    pronunciation: "dee SHTRAH-se",
    germanExample: "Ich wohne in der Hauptstraße.",
    englishExample: "I live on Main Street.",
    category: "places"
  },
  {
    english: "garden",
    german: "der Garten",
    pronunciation: "der GAR-ten",
    germanExample: "Im Garten wachsen schöne Blumen.",
    englishExample: "Beautiful flowers grow in the garden.",
    category: "places"
  },
  {
    english: "park",
    german: "der Park",
    pronunciation: "der park",
    germanExample: "Wir spazieren durch den Park.",
    englishExample: "We walk through the park.",
    category: "places"
  },

  // Complete the months
  {
    english: "July",
    german: "der Juli",
    pronunciation: "der YOO-lee",
    germanExample: "Juli ist ein sehr warmer Monat.",
    englishExample: "July is a very warm month.",
    category: "months"
  },
  {
    english: "August",
    german: "der August",
    pronunciation: "der ow-GOOST",
    germanExample: "August ist der heißeste Monat.",
    englishExample: "August is the hottest month.",
    category: "months"
  },
  {
    english: "September",
    german: "der September",
    pronunciation: "der zep-TEM-ber",
    germanExample: "September ist der Beginn des Herbstes.",
    englishExample: "September is the beginning of autumn.",
    category: "months"
  },
  {
    english: "October",
    german: "der Oktober",
    pronunciation: "der ok-TOH-ber",
    germanExample: "Oktober hat schöne bunte Blätter.",
    englishExample: "October has beautiful colorful leaves.",
    category: "months"
  },
  {
    english: "November",
    german: "der November",
    pronunciation: "der no-VEM-ber",
    germanExample: "November ist oft nebelig.",
    englishExample: "November is often foggy.",
    category: "months"
  },
  {
    english: "December",
    german: "der Dezember",
    pronunciation: "der de-TSEM-ber",
    germanExample: "Dezember ist der letzte Monat des Jahres.",
    englishExample: "December is the last month of the year.",
    category: "months"
  },

  // More Animals
  {
    english: "horse",
    german: "das Pferd",
    pronunciation: "das pfairt",
    germanExample: "Das Pferd läuft schnell.",
    englishExample: "The horse runs fast.",
    category: "animals"
  },
  {
    english: "cow",
    german: "die Kuh",
    pronunciation: "dee koo",
    germanExample: "Die Kuh gibt Milch.",
    englishExample: "The cow gives milk.",
    category: "animals"
  },
  {
    english: "pig",
    german: "das Schwein",
    pronunciation: "das shvayn",
    germanExample: "Das Schwein ist rosa.",
    englishExample: "The pig is pink.",
    category: "animals"
  },
  {
    english: "sheep",
    german: "das Schaf",
    pronunciation: "das shahf",
    germanExample: "Das Schaf hat weiße Wolle.",
    englishExample: "The sheep has white wool.",
    category: "animals"
  },
  {
    english: "mouse",
    german: "die Maus",
    pronunciation: "dee mows",
    germanExample: "Die Maus ist sehr klein.",
    englishExample: "The mouse is very small.",
    category: "animals"
  },
  {
    english: "rabbit",
    german: "das Kaninchen",
    pronunciation: "das ka-NEEN-khen",
    germanExample: "Das Kaninchen hüpft durch den Garten.",
    englishExample: "The rabbit hops through the garden.",
    category: "animals"
  },
  {
    english: "fish",
    german: "der Fisch",
    pronunciation: "der fish",
    germanExample: "Der Fisch schwimmt im Wasser.",
    englishExample: "The fish swims in the water.",
    category: "animals"
  },

  // More Food Items
  {
    english: "egg",
    german: "das Ei",
    pronunciation: "das ay",
    germanExample: "Zum Frühstück esse ich ein Ei.",
    englishExample: "For breakfast I eat an egg.",
    category: "food"
  },
  {
    english: "butter",
    german: "die Butter",
    pronunciation: "dee BUT-ter",
    germanExample: "Ich schmiere Butter auf das Brot.",
    englishExample: "I spread butter on the bread.",
    category: "food"
  },
  {
    english: "sugar",
    german: "der Zucker",
    pronunciation: "der TSUK-ker",
    germanExample: "Der Kuchen braucht Zucker.",
    englishExample: "The cake needs sugar.",
    category: "food"
  },
  {
    english: "salt",
    german: "das Salz",
    pronunciation: "das zalts",
    germanExample: "Das Essen braucht mehr Salz.",
    englishExample: "The food needs more salt.",
    category: "food"
  },
  {
    english: "rice",
    german: "der Reis",
    pronunciation: "der rays",
    germanExample: "Reis ist sehr gesund.",
    englishExample: "Rice is very healthy.",
    category: "food"
  },
  {
    english: "pasta",
    german: "die Nudeln",
    pronunciation: "dee NOO-deln",
    germanExample: "Italienische Nudeln sind lecker.",
    englishExample: "Italian pasta is delicious.",
    category: "food"
  },
  {
    english: "potato",
    german: "die Kartoffel",
    pronunciation: "dee kar-TOF-fel",
    germanExample: "Deutsche Kartoffeln sind sehr gut.",
    englishExample: "German potatoes are very good.",
    category: "food"
  },
  {
    english: "tomato",
    german: "die Tomate",
    pronunciation: "dee to-MAH-te",
    germanExample: "Die Tomate ist rot und saftig.",
    englishExample: "The tomato is red and juicy.",
    category: "food"
  },
  {
    english: "carrot",
    german: "die Karotte",
    pronunciation: "dee ka-ROT-te",
    germanExample: "Karotten sind orange und gesund.",
    englishExample: "Carrots are orange and healthy.",
    category: "food"
  },
  {
    english: "onion",
    german: "die Zwiebel",
    pronunciation: "dee TSVEE-bel",
    germanExample: "Die Zwiebel macht mich weinen.",
    englishExample: "The onion makes me cry.",
    category: "food"
  },
  {
    english: "cucumber",
    german: "die Gurke",
    pronunciation: "dee GUR-ke",
    germanExample: "Die Gurke ist grün und frisch.",
    englishExample: "The cucumber is green and fresh.",
    category: "food"
  },
  {
    english: "lettuce",
    german: "der Salat",
    pronunciation: "der za-LAHT",
    germanExample: "Grüner Salat ist sehr gesund.",
    englishExample: "Green lettuce is very healthy.",
    category: "food"
  },
  {
    english: "orange",
    german: "die Orange",
    pronunciation: "dee o-RAHN-zhe",
    germanExample: "Die Orange ist süß und saftig.",
    englishExample: "The orange is sweet and juicy.",
    category: "food"
  },
  {
    english: "lemon",
    german: "die Zitrone",
    pronunciation: "dee tsi-TROH-ne",
    germanExample: "Die Zitrone ist sehr sauer.",
    englishExample: "The lemon is very sour.",
    category: "food"
  },
  {
    english: "strawberry",
    german: "die Erdbeere",
    pronunciation: "dee AIRT-bay-re",
    germanExample: "Erdbeeren sind im Sommer süß.",
    englishExample: "Strawberries are sweet in summer.",
    category: "food"
  },
  {
    english: "grape",
    german: "die Traube",
    pronunciation: "dee TROW-be",
    germanExample: "Aus Trauben macht man Wein.",
    englishExample: "Wine is made from grapes.",
    category: "food"
  },
  {
    english: "pear",
    german: "die Birne",
    pronunciation: "dee BEER-ne",
    germanExample: "Die Birne ist sehr süß.",
    englishExample: "The pear is very sweet.",
    category: "food"
  },
  {
    english: "chicken",
    german: "das Hähnchen",
    pronunciation: "das HAEN-khen",
    germanExample: "Hähnchen ist mageres Fleisch.",
    englishExample: "Chicken is lean meat.",
    category: "food"
  },
  {
    english: "beef",
    german: "das Rindfleisch",
    pronunciation: "das RINT-flysh",
    germanExample: "Rindfleisch ist sehr nahrhaft.",
    englishExample: "Beef is very nutritious.",
    category: "food"
  },
  {
    english: "pork",
    german: "das Schweinefleisch",
    pronunciation: "das SHVY-ne-flysh",
    germanExample: "Schweinefleisch ist in Deutschland beliebt.",
    englishExample: "Pork is popular in Germany.",
    category: "food"
  },

  // More Drinks
  {
    english: "juice",
    german: "der Saft",
    pronunciation: "der zahft",
    germanExample: "Orangensaft ist sehr gesund.",
    englishExample: "Orange juice is very healthy.",
    category: "food"
  },
  {
    english: "beer",
    german: "das Bier",
    pronunciation: "das beer",
    germanExample: "Deutsches Bier ist weltberühmt.",
    englishExample: "German beer is world famous.",
    category: "food"
  },
  {
    english: "wine",
    german: "der Wein",
    pronunciation: "der vayn",
    germanExample: "Rotwein schmeckt gut zum Essen.",
    englishExample: "Red wine tastes good with food.",
    category: "food"
  },
  {
    english: "soup",
    german: "die Suppe",
    pronunciation: "dee ZUP-pe",
    germanExample: "Hühnersuppe ist gut bei Erkältung.",
    englishExample: "Chicken soup is good for colds.",
    category: "food"
  },

  // More Clothing
  {
    english: "coat",
    german: "der Mantel",
    pronunciation: "der MAN-tel",
    germanExample: "Der Mantel ist warm und lang.",
    englishExample: "The coat is warm and long.",
    category: "clothing"
  },
  {
    english: "hat",
    german: "der Hut",
    pronunciation: "der hoot",
    germanExample: "Der Hut schützt vor der Sonne.",
    englishExample: "The hat protects from the sun.",
    category: "clothing"
  },
  {
    english: "scarf",
    german: "der Schal",
    pronunciation: "der shahl",
    germanExample: "Im Winter trage ich einen warmen Schal.",
    englishExample: "In winter I wear a warm scarf.",
    category: "clothing"
  },
  {
    english: "gloves",
    german: "die Handschuhe",
    pronunciation: "dee HANT-shoo-e",
    germanExample: "Handschuhe halten die Hände warm.",
    englishExample: "Gloves keep the hands warm.",
    category: "clothing"
  },
  {
    english: "socks",
    german: "die Socken",
    pronunciation: "dee ZOK-ken",
    germanExample: "Meine Socken sind weiß.",
    englishExample: "My socks are white.",
    category: "clothing"
  },
  {
    english: "underwear",
    german: "die Unterwäsche",
    pronunciation: "dee UN-ter-vaesh-e",
    germanExample: "Saubere Unterwäsche ist wichtig.",
    englishExample: "Clean underwear is important.",
    category: "clothing"
  },
  {
    english: "tie",
    german: "die Krawatte",
    pronunciation: "dee kra-VAT-te",
    germanExample: "Männer tragen eine Krawatte im Büro.",
    englishExample: "Men wear a tie in the office.",
    category: "clothing"
  },
  {
    english: "belt",
    german: "der Gürtel",
    pronunciation: "der GUER-tel",
    germanExample: "Der Gürtel hält die Hose fest.",
    englishExample: "The belt holds the pants tight.",
    category: "clothing"
  },
  {
    english: "jeans",
    german: "die Jeans",
    pronunciation: "dee jeans",
    germanExample: "Jeans sind sehr bequem.",
    englishExample: "Jeans are very comfortable.",
    category: "clothing"
  },
  {
    english: "skirt",
    german: "der Rock",
    pronunciation: "der rok",
    germanExample: "Der Rock ist kurz und schön.",
    englishExample: "The skirt is short and beautiful.",
    category: "clothing"
  },

  // More Body Parts
  {
    english: "ear",
    german: "das Ohr",
    pronunciation: "das ohr",
    germanExample: "Mit den Ohren hören wir Musik.",
    englishExample: "We hear music with our ears.",
    category: "body"
  },
  {
    english: "hair",
    german: "das Haar",
    pronunciation: "das hahr",
    germanExample: "Ihr Haar ist lang und blond.",
    englishExample: "Her hair is long and blond.",
    category: "body"
  },
  {
    english: "face",
    german: "das Gesicht",
    pronunciation: "das ge-ZIKHT",
    germanExample: "Sie hat ein schönes Gesicht.",
    englishExample: "She has a beautiful face.",
    category: "body"
  },
  {
    english: "neck",
    german: "der Hals",
    pronunciation: "der hahls",
    germanExample: "Der Hals verbindet Kopf und Körper.",
    englishExample: "The neck connects head and body.",
    category: "body"
  },
  {
    english: "shoulder",
    german: "die Schulter",
    pronunciation: "dee SHUL-ter",
    germanExample: "Meine Schulter tut weh.",
    englishExample: "My shoulder hurts.",
    category: "body"
  },
  {
    english: "arm",
    german: "der Arm",
    pronunciation: "der ahrm",
    germanExample: "Der Arm ist zwischen Schulter und Hand.",
    englishExample: "The arm is between shoulder and hand.",
    category: "body"
  },
  {
    english: "leg",
    german: "das Bein",
    pronunciation: "das bayn",
    germanExample: "Menschen haben zwei Beine.",
    englishExample: "Humans have two legs.",
    category: "body"
  },
  {
    english: "knee",
    german: "das Knie",
    pronunciation: "das knee",
    germanExample: "Das Knie ist in der Mitte des Beins.",
    englishExample: "The knee is in the middle of the leg.",
    category: "body"
  },
  {
    english: "finger",
    german: "der Finger",
    pronunciation: "der FIN-ger",
    germanExample: "Menschen haben zehn Finger.",
    englishExample: "Humans have ten fingers.",
    category: "body"
  },
  {
    english: "toe",
    german: "der Zeh",
    pronunciation: "der tsay",
    germanExample: "Der große Zeh ist der dickste.",
    englishExample: "The big toe is the thickest.",
    category: "body"
  },
  {
    english: "back",
    german: "der Rücken",
    pronunciation: "der RUEK-ken",
    germanExample: "Mein Rücken schmerzt vom langen Sitzen.",
    englishExample: "My back hurts from sitting long.",
    category: "body"
  },
  {
    english: "stomach",
    german: "der Bauch",
    pronunciation: "der bowkh",
    germanExample: "Nach dem Essen ist mein Bauch voll.",
    englishExample: "After eating my stomach is full.",
    category: "body"
  },
  {
    english: "heart",
    german: "das Herz",
    pronunciation: "das hairts",
    germanExample: "Das Herz pumpt Blut durch den Körper.",
    englishExample: "The heart pumps blood through the body.",
    category: "body"
  },
  {
    english: "tooth",
    german: "der Zahn",
    pronunciation: "der tsahn",
    germanExample: "Ich putze meine Zähne jeden Tag.",
    englishExample: "I brush my teeth every day.",
    category: "body"
  },

  // More Numbers
  {
    english: "forty",
    german: "vierzig",
    pronunciation: "FEER-tsikh",
    germanExample: "Mein Vater ist vierzig Jahre alt.",
    englishExample: "My father is forty years old.",
    category: "numbers"
  },
  {
    english: "fifty",
    german: "fünfzig",
    pronunciation: "FUENF-tsikh",
    germanExample: "Das Buch hat fünfzig Seiten.",
    englishExample: "The book has fifty pages.",
    category: "numbers"
  },
  {
    english: "sixty",
    german: "sechzig",
    pronunciation: "ZEKH-tsikh",
    germanExample: "Sechzig Minuten sind eine Stunde.",
    englishExample: "Sixty minutes are one hour.",
    category: "numbers"
  },
  {
    english: "seventy",
    german: "siebzig",
    pronunciation: "ZEEP-tsikh",
    germanExample: "Meine Großmutter ist siebzig Jahre alt.",
    englishExample: "My grandmother is seventy years old.",
    category: "numbers"
  },
  {
    english: "eighty",
    german: "achtzig",
    pronunciation: "AKHTS-tsikh",
    germanExample: "Der Film dauert achtzig Minuten.",
    englishExample: "The movie lasts eighty minutes.",
    category: "numbers"
  },
  {
    english: "ninety",
    german: "neunzig",
    pronunciation: "NOYN-tsikh",
    germanExample: "Das alte Haus ist neunzig Jahre alt.",
    englishExample: "The old house is ninety years old.",
    category: "numbers"
  },
  {
    english: "thousand",
    german: "tausend",
    pronunciation: "TOW-zent",
    germanExample: "Tausend ist eine große Zahl.",
    englishExample: "One thousand is a big number.",
    category: "numbers"
  },
  {
    english: "first",
    german: "erste",
    pronunciation: "AIR-ste",
    germanExample: "Januar ist der erste Monat.",
    englishExample: "January is the first month.",
    category: "numbers"
  },
  {
    english: "second",
    german: "zweite",
    pronunciation: "TSVAY-te",
    germanExample: "Februar ist der zweite Monat.",
    englishExample: "February is the second month.",
    category: "numbers"
  },
  {
    english: "third",
    german: "dritte",
    pronunciation: "DRIT-te",
    germanExample: "März ist der dritte Monat.",
    englishExample: "March is the third month.",
    category: "numbers"
  },

  // More Adjectives
  {
    english: "fast",
    german: "schnell",
    pronunciation: "shnell",
    germanExample: "Das Auto ist sehr schnell.",
    englishExample: "The car is very fast.",
    category: "adjectives"
  },
  {
    english: "slow",
    german: "langsam",
    pronunciation: "LAHN-zahm",
    germanExample: "Die Schildkröte ist langsam.",
    englishExample: "The turtle is slow.",
    category: "adjectives"
  },
  {
    english: "tall",
    german: "groß",
    pronunciation: "grohs",
    germanExample: "Der Mann ist sehr groß.",
    englishExample: "The man is very tall.",
    category: "adjectives"
  },
  {
    english: "short",
    german: "kurz",
    pronunciation: "kurts",
    germanExample: "Das Kleid ist kurz.",
    englishExample: "The dress is short.",
    category: "adjectives"
  },
  {
    english: "long",
    german: "lang",
    pronunciation: "lahng",
    germanExample: "Der Fluss ist sehr lang.",
    englishExample: "The river is very long.",
    category: "adjectives"
  },
  {
    english: "wide",
    german: "breit",
    pronunciation: "brayt",
    germanExample: "Die Straße ist breit.",
    englishExample: "The street is wide.",
    category: "adjectives"
  },
  {
    english: "narrow",
    german: "schmal",
    pronunciation: "shmahl",
    germanExample: "Der Weg ist sehr schmal.",
    englishExample: "The path is very narrow.",
    category: "adjectives"
  },
  {
    english: "heavy",
    german: "schwer",
    pronunciation: "shvair",
    germanExample: "Der Koffer ist schwer.",
    englishExample: "The suitcase is heavy.",
    category: "adjectives"
  },
  {
    english: "light",
    german: "leicht",
    pronunciation: "laykht",
    germanExample: "Die Feder ist sehr leicht.",
    englishExample: "The feather is very light.",
    category: "adjectives"
  },
  {
    english: "strong",
    german: "stark",
    pronunciation: "shtark",
    germanExample: "Der Mann ist sehr stark.",
    englishExample: "The man is very strong.",
    category: "adjectives"
  },
  {
    english: "weak",
    german: "schwach",
    pronunciation: "shvakh",
    germanExample: "Nach der Krankheit bin ich schwach.",
    englishExample: "After the illness I am weak.",
    category: "adjectives"
  },
  {
    english: "rich",
    german: "reich",
    pronunciation: "raykh",
    germanExample: "Der Geschäftsmann ist sehr reich.",
    englishExample: "The businessman is very rich.",
    category: "adjectives"
  },
  {
    english: "poor",
    german: "arm",
    pronunciation: "ahrm",
    germanExample: "Die Familie ist leider arm.",
    englishExample: "The family is unfortunately poor.",
    category: "adjectives"
  },
  {
    english: "clean",
    german: "sauber",
    pronunciation: "ZOW-ber",
    germanExample: "Das Zimmer ist sehr sauber.",
    englishExample: "The room is very clean.",
    category: "adjectives"
  },
  {
    english: "dirty",
    german: "schmutzig",
    pronunciation: "SHMUT-tsikh",
    germanExample: "Die Kleidung ist schmutzig.",
    englishExample: "The clothes are dirty.",
    category: "adjectives"
  },
  {
    english: "easy",
    german: "einfach",
    pronunciation: "AYN-fakh",
    germanExample: "Die Aufgabe ist einfach.",
    englishExample: "The task is easy.",
    category: "adjectives"
  },
  {
    english: "difficult",
    german: "schwierig",
    pronunciation: "SHVEE-rikh",
    germanExample: "Deutsch lernen ist schwierig.",
    englishExample: "Learning German is difficult.",
    category: "adjectives"
  },
  {
    english: "expensive",
    german: "teuer",
    pronunciation: "TOY-er",
    germanExample: "Das Auto ist sehr teuer.",
    englishExample: "The car is very expensive.",
    category: "adjectives"
  },
  {
    english: "cheap",
    german: "billig",
    pronunciation: "BIL-likh",
    germanExample: "Das Brot ist billig.",
    englishExample: "The bread is cheap.",
    category: "adjectives"
  },
  {
    english: "full",
    german: "voll",
    pronunciation: "foll",
    germanExample: "Das Glas ist voll Wasser.",
    englishExample: "The glass is full of water.",
    category: "adjectives"
  },
  {
    english: "empty",
    german: "leer",
    pronunciation: "leer",
    germanExample: "Die Flasche ist leer.",
    englishExample: "The bottle is empty.",
    category: "adjectives"
  },

  // More Verbs
  {
    english: "give",
    german: "geben",
    pronunciation: "GAY-ben",
    germanExample: "Ich gebe dir ein Geschenk.",
    englishExample: "I give you a gift.",
    category: "verbs"
  },
  {
    english: "take",
    german: "nehmen",
    pronunciation: "NAY-men",
    germanExample: "Nehmen Sie bitte Platz.",
    englishExample: "Please take a seat.",
    category: "verbs"
  },
  {
    english: "make",
    german: "machen",
    pronunciation: "MAKH-en",
    germanExample: "Ich mache meine Hausaufgaben.",
    englishExample: "I do my homework.",
    category: "verbs"
  },
  {
    english: "have",
    german: "haben",
    pronunciation: "HAH-ben",
    germanExample: "Ich habe einen Hund.",
    englishExample: "I have a dog.",
    category: "verbs"
  },
  {
    english: "be",
    german: "sein",
    pronunciation: "zayn",
    germanExample: "Ich bin müde.",
    englishExample: "I am tired.",
    category: "verbs"
  },
  {
    english: "do",
    german: "tun",
    pronunciation: "toon",
    germanExample: "Was tun Sie heute?",
    englishExample: "What are you doing today?",
    category: "verbs"
  },
  {
    english: "say",
    german: "sagen",
    pronunciation: "ZAH-gen",
    germanExample: "Was sagen Sie dazu?",
    englishExample: "What do you say about that?",
    category: "verbs"
  },
  {
    english: "know",
    german: "wissen",
    pronunciation: "VIS-sen",
    germanExample: "Ich weiß die Antwort nicht.",
    englishExample: "I don't know the answer.",
    category: "verbs"
  },
  {
    english: "think",
    german: "denken",
    pronunciation: "DEN-ken",
    germanExample: "Ich denke oft an dich.",
    englishExample: "I often think of you.",
    category: "verbs"
  },
  {
    english: "feel",
    german: "fühlen",
    pronunciation: "FUEH-len",
    germanExample: "Ich fühle mich heute gut.",
    englishExample: "I feel good today.",
    category: "verbs"
  },
  {
    english: "want",
    german: "wollen",
    pronunciation: "VOL-len",
    germanExample: "Ich will nach Hause gehen.",
    englishExample: "I want to go home.",
    category: "verbs"
  },
  {
    english: "need",
    german: "brauchen",
    pronunciation: "BROW-khen",
    germanExample: "Ich brauche Hilfe.",
    englishExample: "I need help.",
    category: "verbs"
  },
  {
    english: "like",
    german: "mögen",
    pronunciation: "MUE-gen",
    germanExample: "Ich mag Schokolade.",
    englishExample: "I like chocolate.",
    category: "verbs"
  },
  {
    english: "love",
    german: "lieben",
    pronunciation: "LEE-ben",
    germanExample: "Ich liebe meine Familie.",
    englishExample: "I love my family.",
    category: "verbs"
  },
  {
    english: "hate",
    german: "hassen",
    pronunciation: "HAS-sen",
    germanExample: "Ich hasse Spinnen.",
    englishExample: "I hate spiders.",
    category: "verbs"
  },
  {
    english: "open",
    german: "öffnen",
    pronunciation: "UEF-nen",
    germanExample: "Bitte öffnen Sie das Fenster.",
    englishExample: "Please open the window.",
    category: "verbs"
  },
  {
    english: "close",
    german: "schließen",
    pronunciation: "SHLEE-sen",
    germanExample: "Vergessen Sie nicht, die Tür zu schließen.",
    englishExample: "Don't forget to close the door.",
    category: "verbs"
  },
  {
    english: "start",
    german: "beginnen",
    pronunciation: "be-GIN-nen",
    germanExample: "Der Film beginnt um acht Uhr.",
    englishExample: "The movie starts at eight o'clock.",
    category: "verbs"
  },
  {
    english: "stop",
    german: "aufhören",
    pronunciation: "OWF-hue-ren",
    germanExample: "Hören Sie auf zu rauchen!",
    englishExample: "Stop smoking!",
    category: "verbs"
  },
  {
    english: "wait",
    german: "warten",
    pronunciation: "VAR-ten",
    germanExample: "Warten Sie bitte einen Moment.",
    englishExample: "Please wait a moment.",
    category: "verbs"
  },
  {
    english: "run",
    german: "laufen",
    pronunciation: "LOW-fen",
    germanExample: "Ich laufe jeden Morgen.",
    englishExample: "I run every morning.",
    category: "verbs"
  },
  {
    english: "walk",
    german: "gehen",
    pronunciation: "GAY-en",
    germanExample: "Wir gehen zu Fuß zur Schule.",
    englishExample: "We walk to school.",
    category: "verbs"
  },
  {
    english: "sit",
    german: "sitzen",
    pronunciation: "ZIT-sen",
    germanExample: "Ich sitze am Tisch.",
    englishExample: "I sit at the table.",
    category: "verbs"
  },
  {
    english: "stand",
    german: "stehen",
    pronunciation: "SHTAY-en",
    germanExample: "Er steht vor der Tür.",
    englishExample: "He stands in front of the door.",
    category: "verbs"
  },
  {
    english: "lie",
    german: "liegen",
    pronunciation: "LEE-gen",
    germanExample: "Das Buch liegt auf dem Tisch.",
    englishExample: "The book lies on the table.",
    category: "verbs"
  },

  // More Household Items
  {
    english: "lamp",
    german: "die Lampe",
    pronunciation: "dee LAM-pe",
    germanExample: "Die Lampe gibt helles Licht.",
    englishExample: "The lamp gives bright light.",
    category: "home"
  },
  {
    english: "sofa",
    german: "das Sofa",
    pronunciation: "das ZO-fah",
    germanExample: "Das Sofa ist sehr bequem.",
    englishExample: "The sofa is very comfortable.",
    category: "home"
  },
  {
    english: "refrigerator",
    german: "der Kühlschrank",
    pronunciation: "der KUEHL-shrank",
    germanExample: "Im Kühlschrank ist kaltes Bier.",
    englishExample: "There is cold beer in the refrigerator.",
    category: "home"
  },
  {
    english: "stove",
    german: "der Herd",
    pronunciation: "der hairt",
    germanExample: "Ich koche auf dem Herd.",
    englishExample: "I cook on the stove.",
    category: "home"
  },
  {
    english: "washing machine",
    german: "die Waschmaschine",
    pronunciation: "dee VASH-ma-shee-ne",
    germanExample: "Die Waschmaschine wäscht die Kleider.",
    englishExample: "The washing machine washes the clothes.",
    category: "home"
  },
  {
    english: "television",
    german: "der Fernseher",
    pronunciation: "der FERN-zay-er",
    germanExample: "Abends schaue ich Fernseher.",
    englishExample: "In the evening I watch television.",
    category: "home"
  },
  {
    english: "radio",
    german: "das Radio",
    pronunciation: "das RAH-di-o",
    germanExample: "Im Radio läuft schöne Musik.",
    englishExample: "Beautiful music plays on the radio.",
    category: "home"
  },
  {
    english: "clock",
    german: "die Uhr",
    pronunciation: "dee oor",
    germanExample: "Die Uhr zeigt drei Uhr.",
    englishExample: "The clock shows three o'clock.",
    category: "home"
  },
  {
    english: "mirror",
    german: "der Spiegel",
    pronunciation: "der SHPEE-gel",
    germanExample: "Im Spiegel sehe ich mein Gesicht.",
    englishExample: "I see my face in the mirror.",
    category: "home"
  },
  {
    english: "carpet",
    german: "der Teppich",
    pronunciation: "der TEP-pikh",
    germanExample: "Der Teppich ist weich und warm.",
    englishExample: "The carpet is soft and warm.",
    category: "home"
  },
  {
    english: "curtain",
    german: "der Vorhang",
    pronunciation: "der FOR-hang",
    germanExample: "Der Vorhang ist geschlossen.",
    englishExample: "The curtain is closed.",
    category: "home"
  },
  {
    english: "pillow",
    german: "das Kissen",
    pronunciation: "das KIS-sen",
    germanExample: "Das Kissen ist weich.",
    englishExample: "The pillow is soft.",
    category: "home"
  },
  {
    english: "blanket",
    german: "die Decke",
    pronunciation: "dee DEK-ke",
    germanExample: "Die Decke hält mich warm.",
    englishExample: "The blanket keeps me warm.",
    category: "home"
  },

  // School & Education
  {
    english: "student",
    german: "der Schüler",
    pronunciation: "der SHUE-ler",
    germanExample: "Der Schüler lernt Mathematik.",
    englishExample: "The student learns mathematics.",
    category: "school"
  },
  {
    english: "classroom",
    german: "das Klassenzimmer",
    pronunciation: "das KLAS-sen-tsim-mer",
    germanExample: "Das Klassenzimmer ist groß und hell.",
    englishExample: "The classroom is big and bright.",
    category: "school"
  },
  {
    english: "lesson",
    german: "die Stunde",
    pronunciation: "dee SHTUN-de",
    germanExample: "Die erste Stunde ist Deutsch.",
    englishExample: "The first lesson is German.",
    category: "school"
  },
  {
    english: "homework",
    german: "die Hausaufgaben",
    pronunciation: "dee HOWS-owf-gah-ben",
    germanExample: "Ich mache meine Hausaufgaben.",
    englishExample: "I do my homework.",
    category: "school"
  },
  {
    english: "test",
    german: "der Test",
    pronunciation: "der test",
    germanExample: "Morgen schreiben wir einen Test.",
    englishExample: "Tomorrow we write a test.",
    category: "school"
  },
  {
    english: "exam",
    german: "die Prüfung",
    pronunciation: "dee PRUE-fung",
    germanExample: "Die Prüfung ist sehr schwer.",
    englishExample: "The exam is very difficult.",
    category: "school"
  },
  {
    english: "pencil",
    german: "der Bleistift",
    pronunciation: "der BLAY-shtift",
    germanExample: "Ich schreibe mit einem Bleistift.",
    englishExample: "I write with a pencil.",
    category: "school"
  },
  {
    english: "eraser",
    german: "der Radiergummi",
    pronunciation: "der ra-DEER-gum-mi",
    germanExample: "Mit dem Radiergummi lösche ich Fehler.",
    englishExample: "I erase mistakes with the eraser.",
    category: "school"
  },
  {
    english: "ruler",
    german: "das Lineal",
    pronunciation: "das li-ne-AHL",
    germanExample: "Das Lineal ist dreißig Zentimeter lang.",
    englishExample: "The ruler is thirty centimeters long.",
    category: "school"
  },
  {
    english: "notebook",
    german: "das Heft",
    pronunciation: "das heft",
    germanExample: "Ich schreibe in mein Heft.",
    englishExample: "I write in my notebook.",
    category: "school"
  },

  // More Jobs/Professions
  {
    english: "lawyer",
    german: "der Anwalt",
    pronunciation: "der AN-valt",
    germanExample: "Der Anwalt verteidigt seinen Klienten.",
    englishExample: "The lawyer defends his client.",
    category: "jobs"
  },
  {
    english: "engineer",
    german: "der Ingenieur",
    pronunciation: "der in-ge-ni-OER",
    germanExample: "Der Ingenieur baut Brücken.",
    englishExample: "The engineer builds bridges.",
    category: "jobs"
  },
  {
    english: "cook",
    german: "der Koch",
    pronunciation: "der kokh",
    germanExample: "Der Koch arbeitet in der Küche.",
    englishExample: "The cook works in the kitchen.",
    category: "jobs"
  },
  {
    english: "waiter",
    german: "der Kellner",
    pronunciation: "der KEL-ner",
    germanExample: "Der Kellner bringt das Essen.",
    englishExample: "The waiter brings the food.",
    category: "jobs"
  },
  {
    english: "police officer",
    german: "der Polizist",
    pronunciation: "der po-li-TSIST",
    germanExample: "Der Polizist schützt die Menschen.",
    englishExample: "The police officer protects people.",
    category: "jobs"
  },
  {
    english: "firefighter",
    german: "der Feuerwehrmann",
    pronunciation: "der FOY-er-vair-mahn",
    germanExample: "Der Feuerwehrmann löscht Feuer.",
    englishExample: "The firefighter extinguishes fires.",
    category: "jobs"
  },
  {
    english: "driver",
    german: "der Fahrer",
    pronunciation: "der FAH-rer",
    germanExample: "Der Fahrer fährt den Bus.",
    englishExample: "The driver drives the bus.",
    category: "jobs"
  },
  {
    english: "pilot",
    german: "der Pilot",
    pronunciation: "der pi-LOHT",
    germanExample: "Der Pilot fliegt das Flugzeug.",
    englishExample: "The pilot flies the airplane.",
    category: "jobs"
  },
  {
    english: "farmer",
    german: "der Bauer",
    pronunciation: "der BOW-er",
    germanExample: "Der Bauer arbeitet auf dem Feld.",
    englishExample: "The farmer works in the field.",
    category: "jobs"
  },
  {
    english: "mechanic",
    german: "der Mechaniker",
    pronunciation: "der me-KHAH-ni-ker",
    germanExample: "Der Mechaniker repariert Autos.",
    englishExample: "The mechanic repairs cars.",
    category: "jobs"
  },

  // More Places
  {
    english: "library",
    german: "die Bibliothek",
    pronunciation: "dee bib-li-o-TAYK",
    germanExample: "In der Bibliothek lese ich Bücher.",
    englishExample: "I read books in the library.",
    category: "places"
  },
  {
    english: "museum",
    german: "das Museum",
    pronunciation: "das mu-ZAY-um",
    germanExample: "Das Museum zeigt alte Kunst.",
    englishExample: "The museum shows old art.",
    category: "places"
  },
  {
    english: "theater",
    german: "das Theater",
    pronunciation: "das te-AH-ter",
    germanExample: "Im Theater sehe ich ein Stück.",
    englishExample: "I see a play in the theater.",
    category: "places"
  },
  {
    english: "cinema",
    german: "das Kino",
    pronunciation: "das KEE-no",
    germanExample: "Im Kino schaue ich Filme.",
    englishExample: "I watch movies in the cinema.",
    category: "places"
  },
  {
    english: "hotel",
    german: "das Hotel",
    pronunciation: "das ho-TEL",
    germanExample: "Touristen übernachten im Hotel.",
    englishExample: "Tourists stay overnight in the hotel.",
    category: "places"
  },
  {
    english: "office",
    german: "das Büro",
    pronunciation: "das bue-ROH",
    germanExample: "Ich arbeite in einem Büro.",
    englishExample: "I work in an office.",
    category: "places"
  },
  {
    english: "factory",
    german: "die Fabrik",
    pronunciation: "dee fa-BREEK",
    germanExample: "In der Fabrik werden Autos gebaut.",
    englishExample: "Cars are built in the factory.",
    category: "places"
  },
  {
    english: "market",
    german: "der Markt",
    pronunciation: "der markt",
    germanExample: "Auf dem Markt kaufe ich frisches Obst.",
    englishExample: "I buy fresh fruit at the market.",
    category: "places"
  },
  {
    english: "bridge",
    german: "die Brücke",
    pronunciation: "dee BRUEK-ke",
    germanExample: "Die Brücke führt über den Fluss.",
    englishExample: "The bridge goes over the river.",
    category: "places"
  },
  {
    english: "airport",
    german: "der Flughafen",
    pronunciation: "der FLOOK-hah-fen",
    germanExample: "Am Flughafen warten viele Menschen.",
    englishExample: "Many people wait at the airport.",
    category: "places"
  },

  // Seasons & Weather
  {
    english: "spring",
    german: "der Frühling",
    pronunciation: "der FRUE-ling",
    germanExample: "Im Frühling blühen die Blumen.",
    englishExample: "Flowers bloom in spring.",
    category: "seasons"
  },
  {
    english: "summer",
    german: "der Sommer",
    pronunciation: "der ZOM-mer",
    germanExample: "Der Sommer ist warm und sonnig.",
    englishExample: "Summer is warm and sunny.",
    category: "seasons"
  },
  {
    english: "autumn",
    german: "der Herbst",
    pronunciation: "der hairpst",
    germanExample: "Im Herbst fallen die Blätter.",
    englishExample: "Leaves fall in autumn.",
    category: "seasons"
  },
  {
    english: "winter",
    german: "der Winter",
    pronunciation: "der VIN-ter",
    germanExample: "Im Winter ist es kalt.",
    englishExample: "It is cold in winter.",
    category: "seasons"
  },
  {
    english: "cloud",
    german: "die Wolke",
    pronunciation: "dee VOL-ke",
    germanExample: "Am Himmel sind viele Wolken.",
    englishExample: "There are many clouds in the sky.",
    category: "weather"
  },
  {
    english: "storm",
    german: "der Sturm",
    pronunciation: "der shturm",
    germanExample: "Der Sturm ist sehr gefährlich.",
    englishExample: "The storm is very dangerous.",
    category: "weather"
  },
  {
    english: "lightning",
    german: "der Blitz",
    pronunciation: "der blits",
    germanExample: "Der Blitz erhellt den Himmel.",
    englishExample: "Lightning illuminates the sky.",
    category: "weather"
  },
  {
    english: "thunder",
    german: "der Donner",
    pronunciation: "der DON-ner",
    germanExample: "Nach dem Blitz kommt der Donner.",
    englishExample: "Thunder comes after lightning.",
    category: "weather"
  },
  {
    english: "fog",
    german: "der Nebel",
    pronunciation: "der NAY-bel",
    germanExample: "Im Nebel kann man schlecht sehen.",
    englishExample: "You can't see well in fog.",
    category: "weather"
  },
  {
    english: "ice",
    german: "das Eis",
    pronunciation: "das ays",
    germanExample: "Im Winter gibt es viel Eis.",
    englishExample: "There is a lot of ice in winter.",
    category: "weather"
  },

  // More Colors
  {
    english: "brown",
    german: "braun",
    pronunciation: "brown",
    germanExample: "Das Pferd ist braun.",
    englishExample: "The horse is brown.",
    category: "colors"
  },
  {
    english: "pink",
    german: "rosa",
    pronunciation: "ROH-zah",
    germanExample: "Das kleine Mädchen trägt rosa.",
    englishExample: "The little girl wears pink.",
    category: "colors"
  },
  {
    english: "purple",
    german: "lila",
    pronunciation: "LEE-lah",
    germanExample: "Die Blumen sind lila.",
    englishExample: "The flowers are purple.",
    category: "colors"
  },
  {
    english: "orange",
    german: "orange",
    pronunciation: "o-RAHN-zhe",
    germanExample: "Die Karotte ist orange.",
    englishExample: "The carrot is orange.",
    category: "colors"
  },
  {
    english: "gray",
    german: "grau",
    pronunciation: "grow",
    germanExample: "Der Himmel ist heute grau.",
    englishExample: "The sky is gray today.",
    category: "colors"
  },

  // Basic Prepositions and Conjunctions
  {
    english: "in",
    german: "in",
    pronunciation: "in",
    germanExample: "Ich bin in der Schule.",
    englishExample: "I am in school.",
    category: "prepositions"
  },
  {
    english: "on",
    german: "auf",
    pronunciation: "owf",
    germanExample: "Das Buch liegt auf dem Tisch.",
    englishExample: "The book is on the table.",
    category: "prepositions"
  },
  {
    english: "under",
    german: "unter",
    pronunciation: "UN-ter",
    germanExample: "Die Katze ist unter dem Bett.",
    englishExample: "The cat is under the bed.",
    category: "prepositions"
  },
  {
    english: "over",
    german: "über",
    pronunciation: "UE-ber",
    germanExample: "Das Flugzeug fliegt über die Stadt.",
    englishExample: "The airplane flies over the city.",
    category: "prepositions"
  },
  {
    english: "next to",
    german: "neben",
    pronunciation: "NAY-ben",
    germanExample: "Ich sitze neben meinem Freund.",
    englishExample: "I sit next to my friend.",
    category: "prepositions"
  },
  {
    english: "between",
    german: "zwischen",
    pronunciation: "TSVISH-en",
    germanExample: "Das Haus steht zwischen zwei Bäumen.",
    englishExample: "The house stands between two trees.",
    category: "prepositions"
  },
  {
    english: "behind",
    german: "hinter",
    pronunciation: "HIN-ter",
    germanExample: "Der Garten ist hinter dem Haus.",
    englishExample: "The garden is behind the house.",
    category: "prepositions"
  },
  {
    english: "in front of",
    german: "vor",
    pronunciation: "fohr",
    germanExample: "Ich stehe vor der Tür.",
    englishExample: "I stand in front of the door.",
    category: "prepositions"
  },
  {
    english: "with",
    german: "mit",
    pronunciation: "mit",
    germanExample: "Ich gehe mit meiner Mutter einkaufen.",
    englishExample: "I go shopping with my mother.",
    category: "prepositions"
  },
  {
    english: "without",
    german: "ohne",
    pronunciation: "OH-ne",
    germanExample: "Ich trinke Kaffee ohne Zucker.",
    englishExample: "I drink coffee without sugar.",
    category: "prepositions"
  },
  {
    english: "and",
    german: "und",
    pronunciation: "unt",
    germanExample: "Ich esse Brot und Butter.",
    englishExample: "I eat bread and butter.",
    category: "conjunctions"
  },
  {
    english: "or",
    german: "oder",
    pronunciation: "OH-der",
    germanExample: "Möchten Sie Tee oder Kaffee?",
    englishExample: "Would you like tea or coffee?",
    category: "conjunctions"
  },
  {
    english: "but",
    german: "aber",
    pronunciation: "AH-ber",
    germanExample: "Ich bin müde, aber glücklich.",
    englishExample: "I am tired, but happy.",
    category: "conjunctions"
  },
  {
    english: "because",
    german: "weil",
    pronunciation: "vayL",
    germanExample: "Ich bleibe zu Hause, weil es regnet.",
    englishExample: "I stay home because it's raining.",
    category: "conjunctions"
  },

  // More Essential Words
  {
    english: "very",
    german: "sehr",
    pronunciation: "zair",
    germanExample: "Das Essen ist sehr lecker.",
    englishExample: "The food is very delicious.",
    category: "adverbs"
  },
  {
    english: "much",
    german: "viel",
    pronunciation: "feel",
    germanExample: "Ich habe viel Arbeit.",
    englishExample: "I have much work.",
    category: "adverbs"
  },
  {
    english: "little",
    german: "wenig",
    pronunciation: "VAY-nikh",
    germanExample: "Ich habe wenig Zeit.",
    englishExample: "I have little time.",
    category: "adverbs"
  },
  {
    english: "more",
    german: "mehr",
    pronunciation: "mair",
    germanExample: "Ich möchte mehr Wasser.",
    englishExample: "I would like more water.",
    category: "adverbs"
  },
  {
    english: "less",
    german: "weniger",
    pronunciation: "VAY-ni-ger",
    germanExample: "Weniger ist manchmal mehr.",
    englishExample: "Less is sometimes more.",
    category: "adverbs"
  },
  {
    english: "all",
    german: "alle",
    pronunciation: "AL-le",
    germanExample: "Alle Kinder spielen im Park.",
    englishExample: "All children play in the park.",
    category: "pronouns"
  },
  {
    english: "some",
    german: "einige",
    pronunciation: "AY-ni-ge",
    germanExample: "Einige Menschen sprechen Deutsch.",
    englishExample: "Some people speak German.",
    category: "pronouns"
  },
  {
    english: "many",
    german: "viele",
    pronunciation: "FEE-le",
    germanExample: "Viele Studenten lernen hier.",
    englishExample: "Many students study here.",
    category: "pronouns"
  },
  {
    english: "few",
    german: "wenige",
    pronunciation: "VAY-ni-ge",
    germanExample: "Nur wenige Menschen waren da.",
    englishExample: "Only few people were there.",
    category: "pronouns"
  },
  {
    english: "other",
    german: "andere",
    pronunciation: "AN-de-re",
    germanExample: "Die anderen Kinder sind zu Hause.",
    englishExample: "The other children are at home.",
    category: "pronouns"
  }
];

export const a1GermanVocabulary: VocabularyItem[] = (() => {
  // Combine both sources
  const allWords = [...baseA1GermanVocabulary, ...buildExtraWords()];
  
  // Remove duplicates by English-German pair (case-insensitive)
  const uniqueMap = new Map<string, VocabularyItem>();
  
  allWords.forEach(item => {
    const key = `${item.english}|${item.german}`.toLowerCase();
    if (!uniqueMap.has(key)) {
      // Add article field
      const article = extractArticle(item.german);
      uniqueMap.set(key, { ...item, article });
    }
  });
  
  // Sort: der first, then die, then das, then no article
  const articleOrder = { 'der': 0, 'die': 1, 'das': 2 };
  const sorted = Array.from(uniqueMap.values()).sort((a, b) => {
    const aOrder = a.article ? articleOrder[a.article] : 3;
    const bOrder = b.article ? articleOrder[b.article] : 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    // Secondary sort by German word
    return a.german.localeCompare(b.german, 'de');
  });
  
  return sorted;
})();