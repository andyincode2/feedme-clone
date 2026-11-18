import Link from "next/link";
import { redirect } from "next/navigation";
import { BookmarkIcon, LinkIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { DeleteSavedArticle, formatSavedDate } from "@/features/saved-articles";
import { listSavedArticles } from "@/features/saved-articles/server";
import { getCurrentUser } from "@/lib/supabase/current-user";

import { AppHeader } from "../app-header";

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/saved");
  const articles = await listSavedArticles();

  return (
    <main className="mx-auto flex w-full max-w-180 flex-1 flex-col gap-6 px-4 pt-3 pb-10">
      <AppHeader user={user} current="saved" />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-semibold tracking-tight sm:text-2xl">저장한 글</h1>
          {articles.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              {articles.length}개 · 최근에 저장한 순서
            </p>
          )}
        </div>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <LinkIcon data-icon="inline-start" />새 글 변환하기
        </Link>
      </div>

      {articles.length === 0 ? (
        <Empty className="border p-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookmarkIcon />
            </EmptyMedia>
            <EmptyTitle>아직 저장한 글이 없습니다</EmptyTitle>
            <EmptyDescription>
              변환한 글에서 <b>저장</b>을 누르면 여기에 모입니다. 원문이 바뀌거나 사라져도
              저장한 때의 내용 그대로 다시 볼 수 있습니다.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" render={<Link href="/" />} nativeButton={false}>
              글 변환하러 가기
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <ul className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          {articles.map((article) => (
            <li
              key={article.id}
              className="flex items-center gap-3 border-t py-3.5 pr-2 pl-4 first:border-t-0 hover:bg-muted/60 sm:pl-5"
            >
              <Link href={`/saved/${article.id}`} className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="line-clamp-2 text-[15px] leading-snug font-medium break-keep wrap-anywhere">
                  {article.title}
                </span>
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
                  <span>{article.site}</span>
                  <span aria-hidden className="size-0.75 rounded-full bg-current opacity-60" />
                  <span>{formatSavedDate(article.savedAt)} 저장</span>
                </span>
              </Link>
              <DeleteSavedArticle id={article.id} title={article.title} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
