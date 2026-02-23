"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createChannel(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name?.trim()) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("channels")
    .insert({ name: name.trim(), user_id: user.id })
    .select("id")
    .single();

  revalidatePath("/");

  if (data) {
    redirect(`/channels/${data.id}`);
  }
}

export async function deleteChannel(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("channels").delete().eq("id", id);

  revalidatePath("/");
  redirect("/");
}
