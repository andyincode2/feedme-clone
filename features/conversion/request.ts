import type { ConvertResponse } from "./types";

export async function requestConversion(url: string): Promise<ConvertResponse> {
  try {
    const response = await fetch("/api/convert", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) return { status: "fetch_failed" };
    return (await response.json()) as ConvertResponse;
  } catch {
    return { status: "fetch_failed" };
  }
}
