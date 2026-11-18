import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

// Signed-out visitors to these paths go to login and come back afterwards.
// Pages still verify the user on the server; this is only the redirect.
const PROTECTED_PATHS = ["/settings", "/saved"];

export async function proxy(request: NextRequest) {
  return await updateSession(request, PROTECTED_PATHS);
}

export const config = {
  matcher: [
    // Every path except static assets and images.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
