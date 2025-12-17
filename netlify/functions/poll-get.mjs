import { jsonResponse, readState } from "./_shared.mjs";

export default async function () {
  const state = await readState();
  return jsonResponse(state);
}
