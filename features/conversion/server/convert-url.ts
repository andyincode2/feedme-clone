import { Defuddle } from "defuddle/node";
import { parseHTML } from "linkedom";

import type { ConvertResponse } from "../types";

// Some sites reject requests without a browser-like User-Agent.
const FETCH_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (compatible; FeedMe/0.1; +https://github.com/andyincode2/feedme-clone)",
  accept: "text/html,application/xhtml+xml",
};

export async function convertUrl(
  url: string,
  fetchPage: typeof fetch = fetch
): Promise<ConvertResponse> {
  let html: string;
  try {
    const response = await fetchPage(url, {
      headers: FETCH_HEADERS,
      redirect: "follow",
    });
    if (!response.ok) {
      return { status: "fetch_failed", httpStatus: response.status };
    }
    html = await response.text();
  } catch {
    return { status: "fetch_failed" };
  }

  // linkedom yields no documentElement for a blank body, which defuddle can't read.
  if (!html.trim()) return { status: "empty" };

  const { document } = parseHTML(html);
  const result = await Defuddle(document, url, { markdown: true });
  const content = result.content.trim();
  if (!content) return { status: "empty" };

  return {
    status: "ok",
    article: {
      url,
      title: result.title,
      author: result.author,
      published: result.published,
      site: result.domain || new URL(url).hostname,
      content,
    },
  };
}
