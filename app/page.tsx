import { getCurrentUser } from "@/lib/supabase/current-user";

import { AppHeader } from "./app-header";
import { ConverterScreen } from "./converter-screen";

export default async function Home({ searchParams }: PageProps<"/">) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  // "로그인하고 저장" comes back here with ?url=...&save=1.
  const returnUrl = typeof params.url === "string" ? params.url : undefined;

  return (
    <main className="mx-auto flex w-full max-w-180 flex-1 flex-col gap-6 px-4 pt-3">
      <AppHeader user={user} />

      <div>
        <h1 className="mb-1.5 text-[22px] font-semibold tracking-tight text-balance break-keep sm:text-[26px]">
          웹 페이지를 Markdown으로 바꿔 LLM에 바로 넘기세요
        </h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          URL을 붙여넣으면 광고와 메뉴를 걷어낸 본문만 Markdown으로 뽑아
          드립니다.
        </p>
      </div>

      <ConverterScreen
        signedIn={Boolean(user)}
        initialUrl={returnUrl}
        autoSave={Boolean(returnUrl) && params.save === "1"}
      />

      <p className="pt-2 pb-6 text-center text-xs text-muted-foreground">
        저장 버튼을 누른 글만 내 계정에 저장합니다. 프롬프트는 저장하지 않습니다.
      </p>
    </main>
  );
}
