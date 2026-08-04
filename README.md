# mcp-openbeautyfacts

Open Beauty Facts MCP — Open Beauty Facts API (free, no auth, keyless).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `get_product` | Beauty product barcode lookup. Get detailed info for a cosmetics or personal care product by barcode (EAN/UPC) from Open Beauty Facts. Returns product name, brand, categories, ingredients, period-after-opening, labels, and image. Example: get_product("8001090662231") for a shampoo. |
| `search_products` | Search cosmetics and personal care products by name or keyword in Open Beauty Facts. Returns matching beauty products with barcode, name, brand, categories, and image. Useful for finding ingredients and details of shampoos, lotions, makeup, deodorants, and other personal-care items. Example: search_products("shampoo"). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "openbeautyfacts": {
      "url": "https://gateway.pipeworx.io/openbeautyfacts/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Openbeautyfacts data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
