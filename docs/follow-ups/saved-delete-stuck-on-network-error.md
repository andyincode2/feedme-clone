# Delete dialog can stay disabled if the delete request throws

**Symptom**: Suspected: if the `deleteSavedArticle` server action throws (for example the network drops mid-request), the confirmation dialog's **취소** and **삭제** buttons stay disabled and no error toast appears.

**Observed evidence**: Code review of `features/saved-articles/components/delete-saved-article.tsx`: `confirm()` sets `deleting` back to `false` only after `await deleteSavedArticle(id)` resolves, with no `try/finally`. Not reproduced: on localhost the action always resolved, and a real double-click on **삭제** produced a single "삭제했습니다" toast.

**Suspected cause**: A rejected server-action promise skips the code that resets `deleting` and shows the error toast.

**What was tried**: Nothing changed; every acceptance criterion and the ordinary path pass.

**Proposed next step**: Reproduce by stopping the dev server (or going offline in DevTools) after opening the dialog, then press **삭제**. If the buttons stay disabled, wrap the call in `try/finally` and show the existing "삭제하지 못했습니다" toast on failure.
