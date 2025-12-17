import { jsonResponse, readState, writeState, DEFAULT_TOTALS } from "./_shared.mjs";

export default async function (req) {
  if (req.method !== "POST") return jsonResponse({ error: "Method Not Allowed" }, 405);

  let body = null;
  try { body = await req.json(); } catch {}
  const id = body?.id;

  if (!id || !(id in DEFAULT_TOTALS)) {
    return jsonResponse({ error: "Invalid charity id" }, 400);
  }

  const state = await readState();
  const totals = { ...DEFAULT_TOTALS, ...(state.totals || {}) };
  totals[id] = Number(totals[id] || 0) + 1;

  const next = await writeState({ ...state, totals });
  return jsonResponse(next);
}
