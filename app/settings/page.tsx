import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/features/auth";
import { ProfileForm } from "@/features/profile";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  // Authorize from the server-verified token, not from client state.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/auth/login?next=/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", claims.sub)
    .single();

  return (
    <main className="mx-auto flex w-full max-w-180 flex-1 flex-col gap-6 px-4 pt-3 pb-10">
      <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm", className: "self-start" })}>
        <ArrowLeftIcon data-icon="inline-start" />
        FeedMe
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">설정</h1>
      <Card>
        <CardHeader>
          <CardTitle>프로필</CardTitle>
          <CardDescription>{claims.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <ProfileForm displayName={profile?.display_name ?? ""} />
          <div>
            <LogoutButton />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
