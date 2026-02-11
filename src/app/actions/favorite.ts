"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function toggleFavorite(formData: FormData) {
  const url = formData.get("url") as string;
  const returnPath = formData.get("return_path") as string;
  if (!url) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 既にお気に入りか確認
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("url", url)
    .single();

  if (existing) {
    // 解除
    await supabase.from("favorites").delete().eq("id", existing.id);
  } else {
    // 追加（記事データをコピー）
    await supabase.from("favorites").insert({
      user_id: user.id,
      title: (formData.get("title") as string) ?? "",
      url,
      source_name: (formData.get("source_name") as string) || null,
      channel_name: (formData.get("channel_name") as string) || null,
      thumbnail_url: (formData.get("thumbnail_url") as string) || null,
      published_at: (formData.get("published_at") as string) || null,
      og_image: (formData.get("og_image") as string) || null,
      og_description: (formData.get("og_description") as string) || null,
    });
  }

  revalidatePath(returnPath || "/");
}

export async function removeFavorite(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("favorites").delete().eq("id", id);

  revalidatePath("/favorites");
}
