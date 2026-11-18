"use server";

import { createClient } from "@/lib/supabase/server";

import type { ArticleSnapshot } from "./types";

/** Saves the snapshot, replacing this user's earlier save of the same URL. */
export async function saveArticle(snapshot: ArticleSnapshot): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { ok: false };

  const { error } = await supabase.from("saved_articles").upsert(
    {
      user_id: userId,
      url: snapshot.url,
      title: snapshot.title,
      author: snapshot.author,
      published: snapshot.published,
      site: snapshot.site,
      content: snapshot.content,
      saved_at: new Date().toISOString(),
    },
    { onConflict: "user_id,url" }
  );
  return { ok: !error };
}

export async function isArticleSaved(url: string): Promise<boolean> {
  const supabase = await createClient();
  // RLS limits this to the signed-in user's own rows.
  const { data } = await supabase
    .from("saved_articles")
    .select("id")
    .eq("url", url)
    .maybeSingle();
  return Boolean(data);
}

export async function deleteSavedArticle(id: number): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  // RLS lets this delete only the signed-in user's own row.
  const { data, error } = await supabase
    .from("saved_articles")
    .delete()
    .eq("id", id)
    .select("id");
  return { ok: !error && Boolean(data?.length) };
}
