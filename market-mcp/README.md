# Market MCP Server

An MCP (Model Context Protocol) server that provides real-time market data from GeckoTerminal API across all supported blockchain networks.

## Features

- **Multi-Network Support**: Access data from 88+ blockchain networks
- **Pool Data**: Get detailed information about liquidity pools
- **Price Data**: Fetch current token prices and OHLCV charts
- **Search**: Find pools by token symbol, address, or pool address
- **Real-time**: Data updated every 1 minute from GeckoTerminal

## Available Tools

1. `get_networks` - Get all supported blockchain networks
2. `get_pool_data` - Get detailed data for a specific pool
3. `get_network_pools` - Get top pools for a specific network  
4. `get_ohlcv_data` - Get OHLCV candlestick data for technical analysis
5. `get_token_prices` - Get current USD prices for multiple tokens
6. `search_pools` - Search pools by token symbol or address

## Installation

```bash
npm install
npm run build
```

## Usage with Claude Desktop

1. Add to your Claude Desktop configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "market-mcp": {
      "command": "node",
      "args": ["C:\\path\\to\\market-mcp\\dist\\index.js"],
      "env": {}
    }
  }
}
```

2. Restart Claude Desktop

3. The server will appear as available tools in Claude Desktop

## Example Usage in Claude Desktop

- "Get all available networks for trading"
- "Find the top ETH/USDC pools"  
- "Show me the price chart for pool 0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
- "Get current prices for WETH and USDC on Ethereum"
- "Search for all PEPE pools on Ethereum"

## API Rate Limits

- Free tier: 30 calls/minute
- Data freshness: 1 minute cache
- Historical data: Up to 6 months

## Supported Networks

Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche, Fantom, Solana, and 80+ more networks.