// Talks to the IPO Radar data API: the hosted MCP endpoint at ipogmpradar.com,
// which answers stateless JSON-RPC over HTTP (Streamable HTTP, JSON responses).
// The data pipeline (GMP trackers, NSE/BSE subscription, archive of 1,200+
// listed IPOs) runs there; this package exposes it to local stdio clients.

export const DEFAULT_ENDPOINT = "https://ipogmpradar.com/mcp";

let nextId = 1;

export async function rpc(method, params, { endpoint = DEFAULT_ENDPOINT, timeoutMs = 30_000, fetchImpl = fetch } = {}) {
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "user-agent": "ipo-radar-mcp (stdio)",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, ...(params ? { params } : {}) }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`IPO Radar API returned HTTP ${response.status}`);
  const type = response.headers.get("content-type") ?? "";
  const text = await response.text();
  // Accept a single SSE "data:" frame as well as plain JSON.
  const json = JSON.parse(type.includes("text/event-stream") ? text.split("\n").find((l) => l.startsWith("data:"))?.slice(5) ?? "{}" : text);
  if (json.error) throw new Error(json.error.message ?? "IPO Radar API error");
  return json.result;
}
