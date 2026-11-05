// Tool definitions, kept here so the server can list them offline. At start-up
// the live list from the API replaces these when it is reachable.

export const TOOLS = [
  {
    name: "get_ipo_gmp_today",
    title: "IPO GMP today",
    description:
      "Live grey market premium (GMP) for Indian IPOs that are open, upcoming or awaiting listing: GMP in rupees and %, estimated listing price, overall subscription, dates, board (Mainboard/SME).",
    inputSchema: {
      type: "object",
      properties: {
        board: { type: "string", enum: ["Mainboard", "SME"], description: "Only this board." },
        include_listed: { type: "boolean", description: "Also return IPOs listed in the last three weeks." },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_ipo",
    title: "One IPO: GMP, subscription, company",
    description:
      "Everything on one Indian IPO by company name: GMP and its day-wise history, price band, lot size, minimum investment, subscription (overall, QIB, NII, retail), dates, registrar, listing gain once listed, and a company profile with sources.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Company or IPO name, e.g. 'Jio Platforms'." } },
      required: ["name"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_gmp_accuracy",
    title: "Is IPO GMP accurate?",
    description:
      "How well the last GMP before listing predicted the actual listing gain for every Indian IPO listed since 2023: direction hit rate, median and mean miss, mainboard vs SME, by period and market regime.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_upcoming_ipos",
    title: "Upcoming IPOs and the SEBI pipeline",
    description:
      "Indian IPOs with announced dates that have not opened yet, plus mainboard companies that filed a DRHP with SEBI (newest filing first).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];
