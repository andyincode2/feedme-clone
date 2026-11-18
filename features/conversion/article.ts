import type { Article } from "./types";

export function isWebUrl(value: string): boolean {
  return /^https?:\/\/\S+/i.test(value);
}

/** The Markdown we hand off: a title heading and source line above the body. */
export function articleMarkdown(article: Article): string {
  return `# ${article.title}\n\n출처: ${article.url}\n\n${article.content}`;
}

export function markdownFilename(article: Article): string {
  const base = article.title
    .replace(/[\\/:*?"<>|]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${base || new URL(article.url).hostname}.md`;
}

function formatPublished(published: string): string {
  const date = published.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!date) return published;
  return `${date[1]}년 ${Number(date[2])}월 ${Number(date[3])}일`;
}

export type MetaItem = { label: string; href?: string };

export function metaItems(article: Article, charCount: number): MetaItem[] {
  const items: MetaItem[] = [
    { label: article.author },
    { label: formatPublished(article.published) },
    { label: article.site, href: article.url },
    { label: `${charCount.toLocaleString("ko-KR")}자` },
  ];
  return items.filter((item) => item.label);
}
