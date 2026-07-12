export interface DictionaryWord {
  word: string;
  type: string;
  translation: string;
  context?: string;
}

export interface TranslationResult {
  original: string;
  translated: string;
  transliteration: string;
  pronunciation: string;
  dictionary: DictionaryWord[];
  explanation?: string;
}

export interface HistoryItem extends TranslationResult {
  id: string;
  timestamp: number;
  bookmarked: boolean;
  audioBase64?: string; // Cache base64 audio offline
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  isLocal: boolean;
  locale?: string;
  style?: string;
}

export interface PresetPhrase {
  english: string;
  urdu: string;
  romanUrdu: string;
  pronunciation: string;
  category: string;
}
