"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/** Get the currently authenticated user's profile from DB */
export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return prisma.profile.findUnique({ where: { id: user.id } });
}

/** Sign out the current user */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

/** Update display name or avatar */
export async function updateProfile(data: { displayName?: string; avatarUrl?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  return prisma.profile.update({
    where: { id: user.id },
    data: {
      ...(data.displayName && { displayName: data.displayName }),
      ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
    },
  });
}
