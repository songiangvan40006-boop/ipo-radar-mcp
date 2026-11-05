import { test } from "node:test";
import assert from "node:assert/strict";
import { rpc } from "../src/client.js";
import { TOOLS } from "../src/tools.js";

const fake = (body, type = "application/json", status = 200) => async () =>
  new Response(body, { status, headers: { "content-type": type } });

test("parses a JSON-RPC result", async () => {
  const result = await rpc("tools/list", undefined, { fetchImpl: fake(JSON.stringify({ jsonrpc: "2.0", id: 1, result: { tools: [] } })) });
  assert.deepEqual(result, { tools: [] });
});

test("parses a single SSE frame", async () => {
  const sse = `event: message\ndata: ${JSON.stringify({ jsonrpc: "2.0", id: 1, result: { ok: true } })}\n\n`;
  assert.deepEqual(await rpc("x", undefined, { fetchImpl: fake(sse, "text/event-stream") }), { ok: true });
});

test("surfaces JSON-RPC and HTTP errors", async () => {
  await assert.rejects(rpc("x", undefined, { fetchImpl: fake(JSON.stringify({ error: { message: "bad" } })) }), /bad/);
  await assert.rejects(rpc("x", undefined, { fetchImpl: fake("", "text/plain", 503) }), /503/);
});

test("bundled tools are complete", () => {
  assert.deepEqual(TOOLS.map((t) => t.name), ["get_ipo_gmp_today", "get_ipo", "get_gmp_accuracy", "get_upcoming_ipos"]);
  for (const t of TOOLS) assert.equal(t.inputSchema.type, "object");
});
