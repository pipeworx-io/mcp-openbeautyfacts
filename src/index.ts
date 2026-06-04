interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Open Beauty Facts MCP — Open Beauty Facts API (free, no auth, keyless).
 *
 * Open database of cosmetics and personal-care products, searchable by
 * barcode. The cosmetics sibling of Open Food Facts.
 *
 * Tools:
 * - get_product: beauty product barcode lookup — ingredients, brand, labels
 * - search_products: search cosmetics / personal care products by name
 */


const BASE_URL = 'https://world.openbeautyfacts.org';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

// --- Raw API types ---

type RawProduct = {
  code?: string | null;
  product_name?: string | null;
  brands?: string | null;
  categories?: string | null;
  ingredients_text?: string | null;
  periods_after_opening?: string | null;
  labels?: string | null;
  countries?: string | null;
  image_url?: string | null;
  image_small_url?: string | null;
  quantity?: string | null;
};

type ProductResponse = {
  status?: number | null;
  product?: RawProduct | null;
};

type SearchResponse = {
  count?: number | null;
  products?: RawProduct[] | null;
};

// --- Tool definitions ---

const tools: McpToolExport['tools'] = [
  {
    name: 'get_product',
    description:
      'Beauty product barcode lookup. Get detailed info for a cosmetics or personal care product by barcode (EAN/UPC) from Open Beauty Facts. Returns product name, brand, categories, ingredients, period-after-opening, labels, and image. Example: get_product("8001090662231") for a shampoo.',
    inputSchema: {
      type: 'object',
      properties: {
        barcode: { type: 'string', description: 'Product barcode (EAN-13 or UPC-A, e.g., "8001090662231")' },
      },
      required: ['barcode'],
    },
  },
  {
    name: 'search_products',
    description:
      'Search cosmetics and personal care products by name or keyword in Open Beauty Facts. Returns matching beauty products with barcode, name, brand, categories, and image. Useful for finding ingredients and details of shampoos, lotions, makeup, deodorants, and other personal-care items. Example: search_products("shampoo").',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Product name or keyword (e.g., "shampoo", "lipstick")' },
        page_size: { type: 'number', description: 'Number of results to return (default: 20, max: 50)' },
      },
      required: ['query'],
    },
  },
];

// --- callTool dispatcher ---

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_product':
      return getProduct(args.barcode as string);
    case 'search_products':
      return searchProducts(args.query as string, args.page_size as number | undefined);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// --- Tool implementations ---

async function getProduct(barcode: string) {
  const res = await fetch(`${BASE_URL}/api/v2/product/${encodeURIComponent(barcode)}.json`, {
    headers: { 'User-Agent': UA },
  });
  if (!res.ok) {
    return { error: res.status, message: (await res.text()).slice(0, 500) };
  }

  const data = (await res.json()) as ProductResponse;
  if (data.status === 0) {
    return { error: 'not_found', barcode };
  }

  const p = data.product ?? {};
  return {
    barcode,
    name: p.product_name,
    brands: p.brands,
    categories: p.categories,
    ingredients_text: p.ingredients_text,
    periods_after_opening: p.periods_after_opening,
    labels: p.labels,
    countries: p.countries,
    image: p.image_url,
    quantity: p.quantity,
  };
}

async function searchProducts(query: string, pageSize?: number) {
  const count = Math.min(Math.max(1, pageSize ?? 20), 50);
  const params = new URLSearchParams({
    search_terms: query,
    json: '1',
    page_size: String(count),
  });

  const res = await fetch(`${BASE_URL}/cgi/search.pl?${params}`, {
    headers: { 'User-Agent': UA },
  });
  if (!res.ok) {
    return { error: res.status, message: (await res.text()).slice(0, 500) };
  }

  const data = (await res.json()) as SearchResponse;
  return {
    count: data.count ?? 0,
    products: (data.products ?? []).map((p) => ({
      barcode: p.code,
      name: p.product_name,
      brands: p.brands,
      categories: p.categories,
      image: p.image_small_url,
    })),
  };
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
