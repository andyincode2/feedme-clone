export type Article = {
  url: string;
  title: string;
  author: string;
  published: string;
  /** Domain of the page, shown as a link to the original. */
  site: string;
  /** Extracted body as Markdown, without the title heading. */
  content: string;
};

export type ConvertResponse =
  | { status: "ok"; article: Article }
  | { status: "fetch_failed"; httpStatus?: number }
  | { status: "empty" };
