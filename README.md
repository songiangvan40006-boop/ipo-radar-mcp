# IPO Radar MCP Server — live Indian IPO GMP for AI assistants

A free, hosted [Model Context Protocol](https://modelcontextprotocol.io) server that gives Claude, ChatGPT, Cursor and any MCP client live data on Indian IPOs from **[IPO Radar](https://ipogmpradar.com)**:

- **IPO GMP today** — grey market premium in ₹ and %, estimated listing price, for every open, upcoming and closed mainboard and SME IPO
- **Subscription status** — overall, QIB, NII and retail times subscribed from the NSE/BSE bid book
- **One IPO in depth** — day-wise GMP history, price band, lot size, minimum investment, dates, registrar, listing gain, and a company profile (business, objects of the issue, financials, risks) with sources
- **GMP accuracy** — how well the last GMP before listing matched the actual listing gain, across every IPO tracked (hit rate, average miss, mainboard vs SME)
- **Upcoming IPOs** — issues with announced dates plus companies that filed a DRHP with SEBI

```
https://ipogmpradar.com/mcp
```

Two ways to use it, same four tools:

- **Hosted** — Streamable HTTP at the URL above, stateless, read-only.
- **Local (stdio)** — this repository is the open-source stdio server (`src/index.js`, Node 18+), runnable with `npx`.

**No API key, no sign-up.** Data refreshes every 30 minutes from 7 AM to midnight IST.

## Connect

**Claude** (claude.ai / Claude Desktop): Settings → Connectors → *Add custom connector* → paste `https://ipogmpradar.com/mcp`.

**ChatGPT**: Settings → Apps & Connectors → Advanced → *Developer mode* → Create connector → paste the URL, authentication *None*.

**Cursor / VS Code / Windsurf** — add to your MCP config:

```json
{
  "mcpServers": {
    "ipo-radar": { "url": "https://ipogmpradar.com/mcp" }
  }
}
```

**Local stdio server (this repo)** — for Claude Desktop or any stdio client:

```json
{
  "mcpServers": {
    "ipo-radar": { "command": "npx", "args": ["-y", "github:songiangvan40006-boop/ipo-radar-mcp"] }
  }
}
```

Or run it from a clone:

```bash
git clone https://github.com/songiangvan40006-boop/ipo-radar-mcp
cd ipo-radar-mcp && npm install
node src/index.js        # speaks MCP over stdio
npm test
```

## Tools

| Tool | Arguments | Returns |
| --- | --- | --- |
| `get_ipo_gmp_today` | `board?`: `"Mainboard"` \| `"SME"`, `include_listed?`: boolean | Live GMP (₹, %), estimated listing price, subscription, dates and status for each IPO; the highest GMP today |
| `get_ipo` | `name`: company or IPO name (fuzzy, e.g. `"vedant"`) | GMP and day-wise history, band, lot, minimum investment, subscription by category, dates, registrar, listing gain, company profile with sources |
| `get_gmp_accuracy` | — | Direction hit rate, average miss (percentage points), mainboard vs SME, per-IPO table of last GMP vs listing gain |
| `get_upcoming_ipos` | — | IPOs with announced dates not yet open, and the SEBI DRHP pipeline (newest filing first) |

Every result includes a `Source:` URL on ipogmpradar.com for the page the data came from, so answers can cite it.

### Example prompts

- "What is the GMP of the IPOs open today?"
- "Maxwell Engineering IPO GMP and subscription status?"
- "How did Jio Platforms list compared with its GMP?"
- "Is IPO GMP accurate for SME IPOs?"
- "Which companies have filed a DRHP and are coming soon?"

## Data

All data is served by [IPO Radar](https://ipogmpradar.com) and updated every 30 minutes from 7 AM to midnight IST. Every tool result carries the `Source:` URL of the page it came from.

Methodology: <https://ipogmpradar.com/about> · Accuracy: <https://ipogmpradar.com/ipo-gmp-accuracy> · Setup page: <https://ipogmpradar.com/mcp-server>

## Disclaimer

GMP (grey market premium) is an unofficial quote. SEBI does not recognise grey-market trades. Nothing returned by this server is investment advice or a recommendation to apply for any IPO; check the offer document.

## License

MIT for the contents of this repository. Data © IPO Radar, free to use with attribution to [ipogmpradar.com](https://ipogmpradar.com).


## How it works

```
MCP client ──stdio──▶ src/index.js (this repo) ──JSON-RPC over HTTPS──▶ IPO Radar data API (ipogmpradar.com/mcp)
```

- `src/index.js` — the MCP server: lists the four tools and answers `tools/call` (official `@modelcontextprotocol/sdk`, stdio transport).
- `src/client.js` — a small JSON-RPC client for the IPO Radar data API (JSON or SSE responses, timeouts, errors surfaced as tool errors).
- `src/tools.js` — bundled tool definitions, used offline; replaced by the live list at start-up when the API is reachable.
- `test/` — unit tests (`npm test`).

Set `IPO_RADAR_ENDPOINT` to use another endpoint.
