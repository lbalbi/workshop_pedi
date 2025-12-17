import { jsonResponse, writeState, DEFAULT_TOTALS } from "./_shared.mjs";

export default async function (req) {
  if (req.method !== "POST") return jsonResponse({ error: "Method Not Allowed" }, 405);

  let body = null;
  try { body = await req.json(); } catch {}
  const password = body?.password || "";

  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || password !== expected) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const nextState = await writeState({
    pollId: crypto.randomUUID(),
    totals: { ...DEFAULT_TOTALS }
  });

  return jsonResponse(nextState);
}
