import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Auth callback — handles OAuth redirects and email confirmation
 * Also creates/syncs the Profile row in the database after first login
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const role = (searchParams.get("role") ?? "STUDENT") as "STUDENT" | "TEACHER";
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Upsert profile — create if first login, skip if already exists
      const metaRole = (data.user.user_metadata?.role ?? role) as "STUDENT" | "TEACHER";
      const metaName =
        data.user.user_metadata?.display_name ??
        data.user.user_metadata?.full_name ??
        data.user.email?.split("@")[0] ??
        "User";

      await prisma.profile.upsert({
        where: { id: data.user.id },
        update: {}, // Don't overwrite existing profile data on re-login
        create: {
          id: data.user.id,
          role: metaRole,
          displayName: metaName,
          avatarUrl: data.user.user_metadata?.avatar_url ?? null,
          lastActiveDate: new Date().toISOString().split("T")[0],
        },
      });

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
