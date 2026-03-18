"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CustomQuizCard, CustomFlashcard } from "@/types";

// ===== Custom Quiz Decks =====

export async function getQuizDecks() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  return prisma.customQuizDeck.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getSharedQuizDecks() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  return prisma.customQuizDeck.findMany({
    where: { isShared: true, NOT: { ownerId: user.id } },
    include: { owner: { select: { displayName: true, role: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

/** Create or update a deck. Pass id=null to create new; pass DB id to update. */
export async function saveQuizDeck(id: string | null, name: string, cards: CustomQuizCard[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  if (id) {
    const existing = await prisma.customQuizDeck.findUnique({ where: { id } });
    if (existing) {
      if (existing.ownerId !== user.id) throw new Error("Forbidden");
      return prisma.customQuizDeck.update({
        where: { id },
        data: { name, cards: cards as object[] },
      });
    }
    // id was a client-generated temp id — fall through to create
  }

  return prisma.customQuizDeck.create({
    data: { ownerId: user.id, name, cards: cards as object[] },
  });
}

export async function toggleShareQuizDeck(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const deck = await prisma.customQuizDeck.findUnique({ where: { id } });
  if (!deck || deck.ownerId !== user.id) throw new Error("Forbidden");

  return prisma.customQuizDeck.update({
    where: { id },
    data: { isShared: !deck.isShared },
  });
}

export async function deleteQuizDeck(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const deck = await prisma.customQuizDeck.findUnique({ where: { id } });
  if (!deck || deck.ownerId !== user.id) throw new Error("Forbidden");

  return prisma.customQuizDeck.delete({ where: { id } });
}

// ===== Custom Flashcard Decks =====

export async function getFlashcardDecks() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  return prisma.customFlashcardDeck.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getSharedFlashcardDecks() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  return prisma.customFlashcardDeck.findMany({
    where: { isShared: true, NOT: { ownerId: user.id } },
    include: { owner: { select: { displayName: true, role: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

/** Create or update a deck. Pass id=null to create new; pass DB id to update. */
export async function saveFlashcardDeck(id: string | null, name: string, cards: CustomFlashcard[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  if (id) {
    const existing = await prisma.customFlashcardDeck.findUnique({ where: { id } });
    if (existing) {
      if (existing.ownerId !== user.id) throw new Error("Forbidden");
      return prisma.customFlashcardDeck.update({
        where: { id },
        data: { name, cards: cards as object[] },
      });
    }
    // id was a client-generated temp id — fall through to create
  }

  return prisma.customFlashcardDeck.create({
    data: { ownerId: user.id, name, cards: cards as object[] },
  });
}

export async function toggleShareFlashcardDeck(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const deck = await prisma.customFlashcardDeck.findUnique({ where: { id } });
  if (!deck || deck.ownerId !== user.id) throw new Error("Forbidden");

  return prisma.customFlashcardDeck.update({
    where: { id },
    data: { isShared: !deck.isShared },
  });
}

export async function deleteFlashcardDeck(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const deck = await prisma.customFlashcardDeck.findUnique({ where: { id } });
  if (!deck || deck.ownerId !== user.id) throw new Error("Forbidden");

  return prisma.customFlashcardDeck.delete({ where: { id } });
}
