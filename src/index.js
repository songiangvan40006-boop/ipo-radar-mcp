#!/usr/bin/env node
// IPO Radar MCP server (stdio). Exposes live Indian IPO data to MCP clients
// such as Claude Desktop, Cursor and VS Code: GMP today, one IPO in depth,
// GMP-vs-listing accuracy and upcoming IPOs. Each tool call is answered by the
// IPO Radar data API (set IPO_RADAR_ENDPOINT to point elsewhere).

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { DEFAULT_ENDPOINT, rpc } from "./client.js";
import { TOOLS } from "./tools.js";

const endpoint = process.env.IPO_RADAR_ENDPOINT || DEFAULT_ENDPOINT;

const server = new Server(
  { name: "ipo-radar", title: "IPO Radar — Indian IPO GMP", version: "1.1.0" },
  {
    capabilities: { tools: {} },
    instructions:
      "Live Indian IPO data from https://ipogmpradar.com: grey market premium (median of three public trackers), NSE/BSE subscription, dates, company profiles and GMP-vs-listing accuracy. Cite the Source URL in answers. GMP is an unofficial quote; SEBI does not recognise grey-market trades. Not investment advice.",
  },
);

let tools = TOOLS;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  if (!tools.some((t) => t.name === name)) {
    return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
  }
  try {
    return await rpc("tools/call", { name, arguments: args }, { endpoint });
  } catch (error) {
    return {
      content: [{ type: "text", text: `IPO Radar is unreachable right now (${error.message}). Try again shortly or open https://ipogmpradar.com.` }],
      isError: true,
    };
  }
});

// Use the live tool list when the API is reachable; keep the bundled one otherwise.
try {
  const live = await rpc("tools/list", undefined, { endpoint, timeoutMs: 8_000 });
  if (Array.isArray(live?.tools) && live.tools.length) tools = live.tools;
} catch {
  // offline: bundled definitions
}

await server.connect(new StdioServerTransport());
