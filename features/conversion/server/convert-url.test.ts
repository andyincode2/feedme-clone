// @vitest-environment node
import { describe, expect, it } from "vitest";

import { convertUrl } from "./convert-url";

const ARTICLE_HTML = `<!doctype html>
<html lang="en">
<head>
  <title>Use the saw, fear the saw</title>
  <meta name="author" content="Steph Ango">
  <meta property="og:site_name" content="Steph Ango">
  <meta property="article:published_time" content="2024-03-01T00:00:00Z">
</head>
<body>
  <nav><a href="/">Home</a> <a href="/about">About</a></nav>
  <article>
    <h1>Use the saw, fear the saw</h1>
    <p>A saw is a useful tool. It can cut through wood quickly and precisely, which makes it valuable for building furniture and houses.</p>
    <h2>Respect the tool</h2>
    <p>But a saw is also dangerous. If you are careless, it can hurt you badly. The same tool that builds can also destroy, so treat it with care.</p>
    <ul><li>Keep your hands clear of the blade while it is moving, even when you feel confident.</li><li>Wear eye protection every time, because sawdust and splinters fly in unpredictable directions.</li></ul>
    <p>Software tools are similar. Powerful automation can save hours of work, and a careless command can delete a week of it in a second.</p>
  </article>
  <footer>Copyright</footer>
</body>
</html>`;

const EMPTY_HTML = `<!doctype html><html><head><title></title></head><body></body></html>`;

function respondWith(body: string, status = 200): typeof fetch {
  return async () =>
    new Response(body, { status, headers: { "content-type": "text/html" } });
}

describe("convertUrl", () => {
  it("본문을 Markdown으로 추출하고 제목과 저자를 함께 돌려준다", async () => {
    const result = await convertUrl(
      "https://stephango.com/saw",
      respondWith(ARTICLE_HTML)
    );

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.article.title).toBe("Use the saw, fear the saw");
    expect(result.article.author).toBe("Steph Ango");
    expect(result.article.url).toBe("https://stephango.com/saw");
    expect(result.article.content).toContain("## Respect the tool");
    expect(result.article.content).toContain("- Keep your hands clear of the blade");
    expect(result.article.content).not.toContain("About");
  });

  it("4xx/5xx 응답이면 가져오기 실패로 돌려준다", async () => {
    const result = await convertUrl(
      "https://example.com/missing",
      respondWith("<html><body>Not found</body></html>", 404)
    );

    expect(result).toEqual({ status: "fetch_failed", httpStatus: 404 });
  });

  it("네트워크 오류면 가져오기 실패로 돌려준다", async () => {
    const failingFetch: typeof fetch = async () => {
      throw new TypeError("fetch failed");
    };

    const result = await convertUrl("https://unreachable.invalid/", failingFetch);

    expect(result).toEqual({ status: "fetch_failed" });
  });

  it("가져왔지만 추출된 본문이 비어 있으면 본문 없음으로 돌려준다", async () => {
    const result = await convertUrl(
      "https://example.com/blank",
      respondWith(EMPTY_HTML)
    );

    expect(result).toEqual({ status: "empty" });
  });

  it("응답 본문이 아예 비어 있어도 본문 없음으로 돌려준다", async () => {
    const result = await convertUrl(
      "https://httpbin.org/status/200",
      respondWith("")
    );

    expect(result).toEqual({ status: "empty" });
  });
});
