import { getStore } from "@netlify/blobs";

const STORE_NAME = "lasige-charity-poll";
const KEY = "state.json";

const DEFAULT_TOTALS = {
  ajuda_berco: 0,
  animais_rua: 0,
  unicef_pt: 0,
  cruz_vermelha: 0,
  aldeias_sos: 0,
  ajuda_mae: 0,
  spanimais: 0,
  apav: 0
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

async function readState() {
  const store = getStore(STORE_NAME);
  const existing = await store.get(KEY, { type: "json" });
  if (existing) return existing;
  const fresh = {
    pollId: crypto.randomUUID(),
    totals: { ...DEFAULT_TOTALS },
    updatedAt: new Date().toISOString()
  };
  await store.setJSON(KEY, fresh);
  return fresh;
}

async function writeState(state) {
  const store = getStore(STORE_NAME);
  const next = { ...state, updatedAt: new Date().toISOString() };
  await store.setJSON(KEY, next);
  return next;
}

export { DEFAULT_TOTALS, jsonResponse, readState, writeState };
