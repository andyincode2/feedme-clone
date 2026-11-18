import { convertUrl } from "@/features/conversion/server";

export async function POST(request: Request) {
  const { url } = (await request.json()) as { url?: unknown };
  if (typeof url !== "string") {
    return Response.json({ error: "url is required" }, { status: 400 });
  }
  return Response.json(await convertUrl(url));
}
