import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Flum</h1>
        <div className="mb-8">
          {user.user_metadata.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="avatar"
              className="mx-auto mb-4 h-16 w-16 rounded-full"
            />
          )}
          <p className="text-lg">
            {user.user_metadata.user_name ?? user.email}
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-foreground/20 px-6 py-3 hover:bg-foreground/5"
          >
            ログアウト
          </button>
        </form>
      </div>
    </div>
  );
}
