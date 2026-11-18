"use server";

import { refresh } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = { status: "idle" | "saved" | "error"; message?: string };

export async function updateDisplayName(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { status: "error", message: "로그인이 필요합니다." };

  const displayName = String(formData.get("displayName") ?? "").trim();
  // RLS limits this update to the signed-in user's own row.
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName || null, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) return { status: "error", message: "저장하지 못했습니다. 다시 시도해 주세요." };

  refresh();
  return { status: "saved" };
}
