import { createClient } from "./server";

export type CurrentUser = { id: string; email: string; displayName: string | null };

/** The signed-in user from the server-verified token, or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", claims.sub)
    .maybeSingle();
  return {
    id: claims.sub,
    email: claims.email ?? "",
    displayName: profile?.display_name ?? null,
  };
}
