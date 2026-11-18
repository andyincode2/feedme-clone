# `.md` download may fail in Firefox or Safari

**Symptom**: Suspected: **.md 다운로드** may produce no file, or a failed download, in browsers that start the download after `link.click()` returns, while the "파일을 내려받았습니다" toast still shows.

**Observed evidence**: Code review of `features/export/export-panel.tsx:66`: `URL.revokeObjectURL(href)` runs right after `link.click()`. Not reproduced: in headless Chrome 158 the file `Use-the-saw,-fear-the-saw.md` was saved with the expected content. Firefox and Safari were not available in this environment.

**Suspected cause**: The blob URL is revoked before an asynchronous download reads it.

**What was tried**: Nothing changed; Chrome downloads correctly.

**Proposed next step**: Click **.md 다운로드** in Firefox and Safari. If either fails, defer the revoke (for example `setTimeout(() => URL.revokeObjectURL(href))`) and recheck all three browsers.
