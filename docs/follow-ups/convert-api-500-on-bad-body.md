# `/api/convert` returns 500 instead of 400 for a malformed body

**Symptom**: POSTing an empty or non-JSON body to `/api/convert` returns 500 rather than the 400 `url is required` response, and any unexpected exception during extraction also surfaces as 500.

**Observed evidence**: Code review of `app/api/convert/route.ts:4`: `await request.json()` is unguarded, and so is the `convertUrl` call. The app's own client always sends `{"url": ...}`, and `features/conversion/request.ts` maps any non-OK response to the "페이지를 가져오지 못했습니다" state, so the screen still shows an error. One real extraction crash (blank response body) was found and fixed in `convert-url.ts`.

**Suspected cause**: No error handling at the route boundary.

**What was tried**: Nothing changed. The spec puts hardening beyond its acceptance criteria out of scope.

**Proposed next step**: `curl -X POST localhost:3000/api/convert -d ''` to reproduce, then catch the JSON parse in the route and return 400. Decide separately whether extraction exceptions should map to `{ status: "empty" }`.
