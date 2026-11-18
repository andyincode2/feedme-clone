# Copy and long LLM handoff do nothing visible when the clipboard write is refused

**Symptom**: If `navigator.clipboard.writeText` rejects (permission refused, document not focused, insecure origin), **복사하기** shows no toast and no "복사했습니다" state, and **ChatGPT/Claude로 열기** on a >4,000-char payload opens no tab and shows no message. Both surface only as an unhandled promise rejection.

**Observed evidence**: Code review of `features/export/export-panel.tsx:51` (`copy`) and `:80` (`open`, clipboard branch): both `await` the write with no `catch`. Not reproduced: in headless Chrome 158 against `bun --bun run dev` on localhost, the write succeeded every time from a user click.

**Suspected cause**: Missing rejection handling around the two `writeText` calls.

**What was tried**: Nothing changed; the spec's acceptance criteria and the ordinary path (secure origin, user click) pass.

**Proposed next step**: Reproduce by serving over a plain-HTTP LAN address or denying clipboard permission, then wrap both calls in `try/catch` and show an error toast. The spec leaves the failure copy open, so confirm the wording with the user before shipping.
