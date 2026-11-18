export type Llm = "ChatGPT" | "Claude";

/**
 * Neither service documents a `?q=` length limit, so stay well under the
 * shortest known truncation (Claude desktop, ~14,000 chars).
 */
export const URL_HANDOFF_LIMIT = 4000;

const NEW_CHAT: Record<Llm, string> = {
  ChatGPT: "https://chatgpt.com/",
  Claude: "https://claude.ai/new",
};

export function handoffText(prompt: string, markdown: string): string {
  return prompt ? `${prompt}\n\n${markdown}` : markdown;
}

export function handoffPlan(
  llm: Llm,
  text: string
): { via: "url" | "clipboard"; href: string } {
  if (text.length > URL_HANDOFF_LIMIT) {
    return { via: "clipboard", href: NEW_CHAT[llm] };
  }
  return { via: "url", href: `${NEW_CHAT[llm]}?q=${encodeURIComponent(text)}` };
}
