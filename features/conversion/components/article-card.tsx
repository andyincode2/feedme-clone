import { Fragment, type ReactNode } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { articleMarkdown, metaItems } from "../article";
import type { Article } from "../types";
import { MarkdownView } from "./markdown-view";

/** Title, meta line, an action slot, then the rendered body. */
export function ArticleCard({
  article,
  actions,
  note,
}: {
  article: Article;
  actions: ReactNode;
  /** A line under the meta, such as when a saved copy was made. */
  note?: ReactNode;
}) {
  const items = metaItems(article, articleMarkdown(article).length);

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-1.5 px-4 pt-5 pb-4 sm:px-5">
        <CardTitle>
          <h2 className="text-xl leading-snug font-semibold tracking-tight text-balance break-keep">
            {article.title}
          </h2>
        </CardTitle>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
          {items.map((item, index) => (
            <Fragment key={index}>
              {index > 0 && (
                <span
                  aria-hidden
                  className="size-0.75 rounded-full bg-current opacity-60"
                />
              )}
              {item.href ? (
                <a
                  href={item.href}
                  title={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-3 wrap-anywhere"
                >
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
            </Fragment>
          ))}
        </div>
        {note && <p className="text-[13px] text-muted-foreground">{note}</p>}
      </CardHeader>
      <Separator />
      {actions}
      <Separator />
      <MarkdownView markdown={article.content} />
    </Card>
  );
}
