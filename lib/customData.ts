import { CustomQuizDeck, CustomFlashcardDeck } from "@/types";

const QUIZ_KEY = "nihongo_custom_quizzes";
const FLASH_KEY = "nihongo_custom_flashcards";

// ===== Custom Quiz Decks =====

export function getCustomQuizDecks(): CustomQuizDeck[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QUIZ_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveCustomQuizDeck(deck: CustomQuizDeck): void {
  const decks = getCustomQuizDecks();
  const idx = decks.findIndex((d) => d.id === deck.id);
  if (idx >= 0) decks[idx] = deck;
  else decks.push(deck);
  localStorage.setItem(QUIZ_KEY, JSON.stringify(decks));
}

export function deleteCustomQuizDeck(id: string): void {
  const decks = getCustomQuizDecks().filter((d) => d.id !== id);
  localStorage.setItem(QUIZ_KEY, JSON.stringify(decks));
}

// ===== Custom Flashcard Decks =====

export function getCustomFlashcardDecks(): CustomFlashcardDeck[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FLASH_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveCustomFlashcardDeck(deck: CustomFlashcardDeck): void {
  const decks = getCustomFlashcardDecks();
  const idx = decks.findIndex((d) => d.id === deck.id);
  if (idx >= 0) decks[idx] = deck;
  else decks.push(deck);
  localStorage.setItem(FLASH_KEY, JSON.stringify(decks));
}

export function deleteCustomFlashcardDeck(id: string): void {
  const decks = getCustomFlashcardDecks().filter((d) => d.id !== id);
  localStorage.setItem(FLASH_KEY, JSON.stringify(decks));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
