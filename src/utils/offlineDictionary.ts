import { PresetPhrase, TranslationResult } from '../types';

export const OFFLINE_CATEGORIES = [
  'Common Greetings',
  'Travel & Directions',
  'Dining & Shopping',
  'Survival & Emergency',
  'Simple Questions',
];

export const PRESET_PHRASES: PresetPhrase[] = [
  // Greetings
  {
    english: "Hello",
    urdu: "ہیلو / السلام علیکم",
    romanUrdu: "As-salamu alaykum",
    pronunciation: "Uh-suh-laam-o-uh-lay-kum",
    category: "Common Greetings"
  },
  {
    english: "How are you?",
    urdu: "آپ کیسے ہیں؟",
    romanUrdu: "Aap kaise hain?",
    pronunciation: "Aap kay-say hain?",
    category: "Common Greetings"
  },
  {
    english: "Nice to meet you",
    urdu: "آپ سے مل کر خوشی ہوئی",
    romanUrdu: "Aap se mil kar khushi hui",
    pronunciation: "Aap say mil kur khoo-shee hoo-ee",
    category: "Common Greetings"
  },
  {
    english: "Thank you",
    urdu: "شکریہ",
    romanUrdu: "Shukriya",
    pronunciation: "Shook-ree-yah",
    category: "Common Greetings"
  },
  {
    english: "Good morning",
    urdu: "صبح بخیر",
    romanUrdu: "Subah bakhair",
    pronunciation: "Soo-buh buh-khair",
    category: "Common Greetings"
  },
  {
    english: "Goodbye",
    urdu: "خدا حافظ",
    romanUrdu: "Khuda hafiz",
    pronunciation: "Khoo-da hah-fiz",
    category: "Common Greetings"
  },
  {
    english: "Please",
    urdu: "براہ کرم",
    romanUrdu: "Baraye meharbani / Please",
    pronunciation: "Buh-ray-ay meh-r-bah-nee",
    category: "Common Greetings"
  },

  // Travel
  {
    english: "Where is the airport?",
    urdu: "ہوائی اڈہ کہاں ہے؟",
    romanUrdu: "Hawai adda kahan hai?",
    pronunciation: "Huh-waa-ee ud-dah kuh-haan hai?",
    category: "Travel & Directions"
  },
  {
    english: "Where is the bathroom?",
    urdu: "غسل خانہ کہاں ہے؟",
    romanUrdu: "Ghusl khana kahan hai?",
    pronunciation: "Ghoo-sul khah-nah kuh-haan hai?",
    category: "Travel & Directions"
  },
  {
    english: "Stop here",
    urdu: "یہاں رکیں",
    romanUrdu: "Yahan rukain",
    pronunciation: "Yuh-haan roo-kain",
    category: "Travel & Directions"
  },
  {
    english: "I am lost",
    urdu: "میں راستہ بھول گیا ہوں",
    romanUrdu: "Mein rasta bhool gaya hoon",
    pronunciation: "Mayn raas-tah bhool guh-ya hoon",
    category: "Travel & Directions"
  },
  {
    english: "Take me to the hotel",
    urdu: "مجھے ہوٹل لے جائیں",
    romanUrdu: "Mujhe hotel le jayen",
    pronunciation: "Moo-jay ho-tel lay jaa-yen",
    category: "Travel & Directions"
  },

  // Dining & Shopping
  {
    english: "How much is this?",
    urdu: "یہ کتنے کا ہے؟",
    romanUrdu: "Yeh kitne ka hai?",
    pronunciation: "Yeh kit-nay ka hai?",
    category: "Dining & Shopping"
  },
  {
    english: "I want water",
    urdu: "مجھے پانی چاہیے",
    romanUrdu: "Mujhe paani chahiye",
    pronunciation: "Moo-jay paa-nee chah-hee-ay",
    category: "Dining & Shopping"
  },
  {
    english: "Do you have food?",
    urdu: "کیا آپ کے پاس کھانا ہے؟",
    romanUrdu: "Kya aap ke paas khana hai?",
    pronunciation: "Kyah aap kay paas khah-nah hai?",
    category: "Dining & Shopping"
  },
  {
    english: "The food is delicious",
    urdu: "کھانا بہت مزیدار ہے",
    romanUrdu: "Khana bohat mazedar hai",
    pronunciation: "Khah-nah boh-hut muh-zay-dar hai",
    category: "Dining & Shopping"
  },
  {
    english: "Give me the bill",
    urdu: "مجھے بل دے دیں",
    romanUrdu: "Mujhe bill de dain",
    pronunciation: "Moo-jay bill day dain",
    category: "Dining & Shopping"
  },

  // Survival
  {
    english: "Help me",
    urdu: "میری مدد کریں",
    romanUrdu: "Meri madad karain",
    pronunciation: "May-ree muh-dud kuh-rain",
    category: "Survival & Emergency"
  },
  {
    english: "I need a doctor",
    urdu: "مجھے ڈاکٹر کی ضرورت ہے",
    romanUrdu: "Mujhe doctor ki zaroorat hai",
    pronunciation: "Moo-jay doc-tur kee zuh-roo-rut hai",
    category: "Survival & Emergency"
  },
  {
    english: "Call the police",
    urdu: "پولیس کو بلائیں",
    romanUrdu: "Police ko bulayen",
    pronunciation: "Po-leece ko boo-laa-yen",
    category: "Survival & Emergency"
  },
  {
    english: "I am not feeling well",
    urdu: "میری طبعیت ٹھیک نہیں ہے",
    romanUrdu: "Meri tabiyat theek nahi hai",
    pronunciation: "May-ree tuh-bee-yut theek nuh-hee hai",
    category: "Survival & Emergency"
  },

  // Simple questions
  {
    english: "What is your name?",
    urdu: "آپ کا نام کیا ہے؟",
    romanUrdu: "Aap ka naam kya hai?",
    pronunciation: "Aap ka naam kyah hai?",
    category: "Simple Questions"
  },
  {
    english: "What time is it?",
    urdu: "کیا وقت ہوا ہے؟",
    romanUrdu: "Kya waqt hua hai?",
    pronunciation: "Kyah wuq-t hoo-ah hai?",
    category: "Simple Questions"
  },
  {
    english: "Do you speak English?",
    urdu: "کیا آپ انگریزی بولتے ہیں؟",
    romanUrdu: "Kya aap angrezi bolte hain?",
    pronunciation: "Kyah aap ung-ray-zee bol-tay hain?",
    category: "Simple Questions"
  },
  {
    english: "Yes",
    urdu: "جی ہاں",
    romanUrdu: "Ji haan",
    pronunciation: "Jee haan",
    category: "Simple Questions"
  },
  {
    english: "No",
    urdu: "جی نہیں",
    romanUrdu: "Ji nahi",
    pronunciation: "Jee nuh-hee",
    category: "Simple Questions"
  },
];

// Curated offline word database for keyword translation
export const OFFLINE_DICTIONARY: Record<string, { urdu: string; roman: string; pron: string; type: string }> = {
  "hello": { urdu: "السلام علیکم", roman: "As-salamu alaykum", pron: "Uh-suh-laam-o-uh-lay-kum", type: "interjection" },
  "water": { urdu: "پانی", roman: "Paani", pron: "Paa-nee", type: "noun" },
  "food": { urdu: "کھانا", roman: "Khana", pron: "Khah-nah", type: "noun" },
  "hotel": { urdu: "ہوٹل", roman: "Hotel", pron: "Ho-tel", type: "noun" },
  "doctor": { urdu: "ڈاکٹر", roman: "Doctor", pron: "Doc-tur", type: "noun" },
  "police": { urdu: "پولیس", roman: "Police", pron: "Po-leece", type: "noun" },
  "airport": { urdu: "ہوائی اڈہ", roman: "Hawai adda", pron: "Huh-waa-ee ud-dah", type: "noun" },
  "name": { urdu: "نام", roman: "Naam", pron: "Naam", type: "noun" },
  "time": { urdu: "وقت", roman: "Waqt", pron: "Wuq-t", type: "noun" },
  "english": { urdu: "انگریزی", roman: "Angrezi", pron: "Ung-ray-zee", type: "noun" },
  "car": { urdu: "گاڑی", roman: "Gaari", pron: "Gaa-ree", type: "noun" },
  "house": { urdu: "گھر", roman: "Ghar", pron: "Ghur", type: "noun" },
  "friend": { urdu: "دوست", roman: "Dost", pron: "Doh-st", type: "noun" },
  "love": { urdu: "محبت", roman: "Mohabbat", pron: "Mo-hub-but", type: "noun" },
  "yes": { urdu: "جی ہاں", roman: "Ji haan", pron: "Jee haan", type: "adverb" },
  "no": { urdu: "جی نہیں", roman: "Ji nahi", pron: "Jee nuh-hee", type: "adverb" },
  "where": { urdu: "کہاں", roman: "Kahan", pron: "Kuh-haan", type: "pronoun" },
  "what": { urdu: "کیا", roman: "Kya", pron: "Kyah", type: "pronoun" },
  "how": { urdu: "کیسے", roman: "Kaise", pron: "Kay-say", type: "adverb" },
  "thank you": { urdu: "شکریہ", roman: "Shukriya", pron: "Shook-ree-yah", type: "phrase" },
  "please": { urdu: "براہ کرم", roman: "Baraye meharbani", pron: "Buh-ray-ay meh-r-bah-nee", type: "adverb" },
  "good": { urdu: "اچھا", roman: "Acha", pron: "Uh-chah", type: "adjective" },
  "bad": { urdu: "برا", roman: "Bura", pron: "Boo-rah", type: "adjective" },
  "happy": { urdu: "خوش", roman: "Khush", pron: "Khoosh", type: "adjective" },
  "sad": { urdu: "اداس", roman: "Udaas", pron: "Oo-daas", type: "adjective" },
};

/**
 * Normalizes input text by removing trailing punctuation, double spaces, and converting to lower case.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Searches the offline dictionary to translate phrases and build words-by-words descriptions.
 */
export function translateOffline(text: string): TranslationResult {
  const normalized = normalizeText(text);

  // 1. Look for direct matches in our preset phrase list
  const directMatch = PRESET_PHRASES.find(
    (p) => normalizeText(p.english) === normalized
  );

  if (directMatch) {
    // Generate word dictionary details
    const words = normalized.split(" ");
    const dictionaryEntries = words
      .map((w) => {
        const entry = OFFLINE_DICTIONARY[w];
        if (entry) {
          return {
            word: w,
            type: entry.type,
            translation: entry.urdu,
            context: "Conversational Context",
          };
        }
        return null;
      })
      .filter((e) => e !== null) as any[];

    return {
      original: text,
      translated: directMatch.urdu,
      transliteration: directMatch.romanUrdu,
      pronunciation: directMatch.pronunciation,
      dictionary: dictionaryEntries.length > 0 ? dictionaryEntries : [
        { word: normalized, type: "phrase", translation: directMatch.urdu, context: "Direct phrase match" }
      ],
      explanation: "Translated using offline quick-phrase database (Exact Match).",
    };
  }

  // 2. Look for word-by-word matches
  const words = normalized.split(" ");
  const translatedWords: string[] = [];
  const transliteratedWords: string[] = [];
  const pronunciationWords: string[] = [];
  const dictionaryEntries: any[] = [];

  for (const word of words) {
    const entry = OFFLINE_DICTIONARY[word];
    if (entry) {
      translatedWords.push(entry.urdu);
      transliteratedWords.push(entry.roman);
      pronunciationWords.push(entry.pron);
      dictionaryEntries.push({
        word: word,
        type: entry.type,
        translation: entry.urdu,
        context: "Literal Translation",
      });
    } else {
      // Keep original word if no translation is found
      translatedWords.push(`[${word}]`);
      transliteratedWords.push(word);
      pronunciationWords.push(word);
    }
  }

  // Check if we translated at least something
  const translationSuccessCount = dictionaryEntries.length;

  if (translationSuccessCount > 0) {
    return {
      original: text,
      translated: translatedWords.join(" "),
      transliteration: transliteratedWords.join(" "),
      pronunciation: pronunciationWords.join(" - "),
      dictionary: dictionaryEntries,
      explanation: `Translated offline word-by-word (${translationSuccessCount}/${words.length} words matched). For complex sentences, connect to the internet for advanced AI translation.`,
    };
  }

  // 3. Absolute fallback when nothing is found
  return {
    original: text,
    translated: "ترجمہ دستیاب نہیں ہے (آف لائن)",
    transliteration: "Tarjuma dastyab nahi hai",
    pronunciation: "Tur-joo-mah dus-tyaab nuh-hee hai",
    dictionary: [],
    explanation: "You are currently offline. This text could not be matched with any offline words or phrases. Please try phrases like 'Hello', 'How are you?', 'Where is the bathroom?', or reconnect to the internet for full AI translations.",
  };
}
