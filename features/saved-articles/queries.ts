import { createClient } from "@/lib/supabase/server";

import type { ArticleSnapshot } from "./types";

export type SavedArticleSummary = { id: number; title: string; site: string; savedAt: string };
export type SavedArticle = ArticleSnapshot & { id: number; savedAt: string };

/** The signed-in user's saved articles, newest first, without their bodies. */
export async function listSavedArticles(): Promise<SavedArticleSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_articles")
    .select("id, title, site, saved_at")
    .order("saved_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    site: row.site,
    savedAt: row.saved_at,
  }));
}

/** One of the signed-in user's saved articles, or null (missing or someone else's). */
export async function getSavedArticle(id: number): Promise<SavedArticle | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_articles")
    .select("id, url, title, author, published, site, content, saved_at")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const { saved_at, ...rest } = data;
  return { ...rest, savedAt: saved_at };
}
