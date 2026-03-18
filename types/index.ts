export type WritingSystem = "hiragana" | "katakana";

export interface Character {
  kana: string;
  romaji: string;
  group: string;
  type: WritingSystem;
}

export interface VocabItem {
  japanese: string;
  reading: string;
  meaning: string;
  topic: string;
  level: number;
}

export interface QuizQuestion {
  id: string;
  type: "kana-to-romaji" | "romaji-to-kana" | "vocab-meaning" | "vocab-reading";
  prompt: string;
  answer: string;
  choices: string[];
}

export interface LessonUnit {
  id: string;
  title: string;
  subtitle: string;
  type: "hiragana" | "katakana" | "vocabulary" | "quiz";
  level: number;
  xp: number;
  icon: string;
  topicKey?: string;
}

export interface UserProgress {
  completedLessons: string[];
  totalXP: number;
  streak: number;
  lastActiveDate: string;
}

// ===== Custom Quiz =====
export interface CustomQuizCard {
  id: string;
  prompt: string; // What is shown as question
  answer: string; // Correct answer
}

export interface CustomQuizDeck {
  id: string;
  name: string;
  cards: CustomQuizCard[];
  isShared?: boolean;
  createdAt: string;
  ownerName?: string; // Populated for shared/library decks
}

// ===== Custom Flashcard =====
export interface CustomFlashcard {
  id: string;
  front: string; // Japanese / term
  back: string; // Meaning / definition
  reading?: string; // Optional phonetic reading
}

export interface CustomFlashcardDeck {
  id: string;
  name: string;
  cards: CustomFlashcard[];
  isShared?: boolean;
  createdAt: string;
  ownerName?: string; // Populated for shared/library decks
}
