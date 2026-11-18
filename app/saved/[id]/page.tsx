import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, ExternalLinkIcon, FileQuestionIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ArticleCard, articleMarkdown, markdownFilename } from "@/features/conversion";
import { ExportPanel } from "@/features/export";
import { DeleteSavedArticle, formatSavedAt } from "@/features/saved-articles";
import { getSavedArticle } from "@/features/saved-articles/server";
import { getCurrentUser } from "@/lib/supabase/current-user";

import { AppHeader } from "../../app-header";

export default async function SavedArticlePage({ params }: PageProps<"/saved/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login?next=/saved/${encodeURIComponent(id)}`);
  const article = /^\d+$/.test(id) ? await getSavedArticle(Number(id)) : null;

  const back = (
    <Link
      href="/saved"
      className={buttonVariants({ variant: "ghost", size: "sm", className: "self-start" })}
    >
      <ArrowLeftIcon data-icon="inline-start" />
      저장한 글
    </Link>
  );

  return (
    <main className="mx-auto flex w-full max-w-180 flex-1 flex-col gap-6 px-4 pt-3 pb-10">
      <AppHeader user={user} />

      {!article ? (
        <Empty className="border p-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestionIcon />
            </EmptyMedia>
            <EmptyTitle>찾을 수 없는 글입니다</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>{back}</EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {back}
            <div className="flex items-center gap-1">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <ExternalLinkIcon data-icon="inline-start" />
                원문 열기
              </a>
              <DeleteSavedArticle id={article.id} title={article.title} afterDelete="/saved" showLabel />
            </div>
          </div>
          <ArticleCard
            article={article}
            note={`${formatSavedAt(article.savedAt)}에 저장한 내용입니다`}
            actions={
              <ExportPanel
                markdown={articleMarkdown(article)}
                filename={markdownFilename(article)}
              />
            }
          />
        </>
      )}
    </main>
  );
}
