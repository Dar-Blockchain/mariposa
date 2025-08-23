# SEI Network Agent SDK

A comprehensive TypeScript SDK for creating autonomous trading agents on the SEI Network. This SDK provides a clean interface for interacting with the AgenticRouter contract, managing wallets, executing swaps, and handling transactions.

## Features

- 🤖 **Autonomous Agent Management** - Create and manage trading agents with private keys and addresses
- 💰 **Wallet Integration** - Full wallet management with balance tracking and USD valuations
- 🔄 **Token Swaps** - Execute swaps through the AgenticRouter contract with automatic fee handling
- 📊 **Market Data** - Real-time price feeds and market data integration
- 🔐 **Transaction Signing** - Secure transaction signing and broadcasting
- 📈 **Portfolio Management** - Track and rebalance token portfolios
- 🎯 **Event-Driven Architecture** - Real-time events for all agent operations

## Installation

```bash
npm install @mariposa-plus/agent-sdk
```

## Why Simplified Dependencies?

This SDK uses **stable, battle-tested dependencies** to avoid compatibility issues:

- ✅ **ethers v5.7.2** - Stable, well-tested Ethereum library
- ✅ **bignumber.js** - Reliable decimal precision 
- ✅ **axios** - Simple HTTP client
- ❌ **No complex Cosmos/SEI libraries** - Avoids version conflicts
- ❌ **No Jest/testing frameworks** - Keeps it lightweight

This approach eliminates the common dependency conflicts you mentioned!

## Security First

**⚠️ IMPORTANT: Never hardcode private keys in your code!**

The Agent SDK requires a private key to be passed directly to the constructor for maximum security and flexibility. Here are secure ways to provide the private key:

```typescript
// Option 1: Function parameter (recommended for applications)
function createAgent(privateKey: string, address: string) {
  return new Agent({ privateKey, address, /* other config */ });
}

// Option 2: Secure environment loading (for servers)
import * as fs from 'fs';
const privateKey = fs.readFileSync('/secure/path/to/key', 'utf8').trim();

// Option 3: Hardware wallet or key management service
const privateKey = await keyManagementService.getKey('agent-key-id');

// Option 4: Runtime input (for development only)
const privateKey = await promptSecurely('Enter private key:');
```

## Quick Start

### 1. Initialize an Agent

```typescript
import { SimpleAgent, Utils } from '@mariposa/agent-sdk';

// IMPORTANT: Private key should be passed securely (not hardcoded)
const privateKey = getPrivateKeySecurely(); // Your secure method to get private key
const address = '0xYourAddress...'; // Your Ethereum-compatible address

// Configure your agent (simplified configuration)
const agentConfig = {
  privateKey: privateKey, // Pass directly to constructor
  address: address,
  rpcUrl: 'https://evm-rpc.arctic-1.seinetwork.io', // SEI EVM RPC
  chainId: 'arctic-1',
  contractAddresses: {
    agenticRouter: '0x1234...', // AgenticRouter contract address
    wsei: '0x5678...',          // Wrapped SEI address
    usdc: '0x9abc...',          // USDC address
  }
};

// Create and initialize the agent
const agent = new SimpleAgent(agentConfig);
await agent.initialize();

console.log(`🤖 Agent initialized for address: ${agent.getAddress()}`);
```

### 2. Check Balance

```typescript
// Get current wallet balance
const balance = await agent.getBalance();

console.log('💰 Wallet Balance:');
console.log(`Total USD Value: $${balance.totalUsdValue.toFixed(2)}`);

balance.balances.forEach(token => {
  console.log(`${token.symbol}: ${token.amount.toFixed(6)} ($${token.usdValue.toFixed(2)})`);
});

// Get specific token balance
const seiBalance = await agent.getTokenBalance('SEI');
if (seiBalance) {
  console.log(`SEI Balance: ${seiBalance.amount.toFixed(6)}`);
}
```

### 3. Execute Token Swaps

```typescript
// Swap SEI for USDC
const swapResult = await agent.swapSeiToToken({
  tokenOut: agentConfig.contractAddresses.usdc,
  amountIn: new BigNumber('10'), // 10 SEI
  slippageTolerance: 5, // 5% slippage tolerance
  recipient: agent.getAddress() // Optional, defaults to agent address
});

console.log(`🔄 Swap completed:`);
console.log(`Amount In: ${swapResult.amountIn.toFixed(6)} SEI`);
console.log(`Amount Out: ${swapResult.amountOut.toFixed(6)} USDC`);
console.log(`Transaction Hash: ${swapResult.txHash}`);

// Swap USDC for another token
const tokenSwapResult = await agent.swapTokenToToken({
  tokenIn: agentConfig.contractAddresses.usdc,
  tokenOut: '0xOtherTokenAddress...',
  amountIn: new BigNumber('100'), // 100 USDC
  slippageTolerance: 3
});

// Swap token back to SEI
const seiSwapResult = await agent.swapTokenToSei({
  tokenIn: agentConfig.contractAddresses.usdc,
  amountIn: new BigNumber('50'), // 50 USDC
  slippageTolerance: 5
});
```

### 4. Transfer Tokens

```typescript
// Transfer tokens with automatic fee handling
const transferResult = await agent.transferWithFee({
  token: agentConfig.contractAddresses.usdc,
  to: 'sei1recipient...',
  amount: new BigNumber('100'), // 100 USDC
  memo: 'Payment for services'
});

// Transfer native SEI with fee handling
const seiTransferResult = await agent.transferSeiWithFee({
  to: 'sei1recipient...',
  amount: new BigNumber('5'), // 5 SEI
  memo: 'SEI payment'
});

console.log(`💸 Transfer completed: ${transferResult.txHash}`);
```

### 5. Market Data and Pricing

```typescript
// Get current market data
const marketData = await agent.getMarketData();
console.log(`SEI Price: $${marketData.seiPrice.toFixed(4)}`);

// Get specific token price
const usdcPrice = await agent.getTokenPrice('USDC');
console.log(`USDC Price: $${usdcPrice.toFixed(4)}`);

// Monitor price updates
agent.on('priceUpdated', (data) => {
  console.log('📈 Price updated:', data);
});
```

### 6. Event Handling

```typescript
// Listen to agent events
agent.on('initialized', (data) => {
  console.log('🚀 Agent initialized:', data);
});

agent.on('swapExecuted', (result) => {
  console.log('🔄 Swap executed:', result);
});

agent.on('balanceUpdated', (balance) => {
  console.log('💰 Balance updated:', balance);
});

agent.on('transferCompleted', (result) => {
  console.log('💸 Transfer completed:', result);
});

agent.on('error', (error) => {
  console.error('❌ Agent error:', error);
});

agent.on('networkStatusChanged', (status) => {
  console.log('🌐 Network status changed:', status);
});
```

### 7. Advanced Contract Interactions

```typescript
// Execute custom contract calls
const contractResult = await agent.executeContract({
  contractAddress: 'sei1contract...',
  method: 'customMethod',
  args: ['arg1', 'arg2'],
  value: new BigNumber('1') // Optional SEI amount to send
});

// Query contract state (read-only)
const contractState = await agent.queryContract('sei1contract...', {
  get_config: {}
});

// Estimate transaction fees
const feeEstimate = await agent.estimateFee(transactionData);
console.log(`Estimated fee: ${feeEstimate.totalFee.toFixed(6)} SEI`);
```

## Configuration

### Network Configuration

```typescript
import { SUPPORTED_NETWORKS } from '@mariposa/agent-sdk';

// Available networks
const networks = {
  mainnet: SUPPORTED_NETWORKS.mainnet,
  testnet: SUPPORTED_NETWORKS.testnet,
  devnet: SUPPORTED_NETWORKS.devnet
};

// Custom network configuration
const customNetwork = {
  name: 'Custom SEI Network',
  chainId: 'custom-1',
  rpcEndpoint: 'https://custom-rpc.sei.io',
  restEndpoint: 'https://custom-rest.sei.io',
  explorer: 'https://custom-explorer.sei.io'
};
```

### Gas Settings

```typescript
const gasSettings = {
  gasPrice: '0.1usei',      // Gas price in usei
  gasLimit: 500000,         // Maximum gas limit
  gasAdjustment: 1.5        // Gas adjustment multiplier
};

// Update gas settings after initialization
agent.updateGasSettings({
  gasPrice: '0.15usei',
  gasLimit: 600000
});
```

### Contract Addresses

```typescript
const contractAddresses = {
  agenticRouter: '0x...', // AgenticRouter contract (required)
  swapRouter: '0x...',    // Sailor Swap Router (required)
  factory: '0x...',       // Sailor Factory (required)
  wsei: '0x...',          // Wrapped SEI (required)
  usdc: '0x...',          // USDC token (required)
  // Add other token addresses as needed
  customToken: '0x...'
};
```

## Error Handling

```typescript
import { ErrorCodes } from '@mariposa/agent-sdk';

try {
  await agent.swapSeiToToken({
    tokenOut: tokenAddress,
    amountIn: new BigNumber('100'),
    slippageTolerance: 5
  });
} catch (error) {
  switch (error.code) {
    case ErrorCodes.INSUFFICIENT_BALANCE:
      console.error('❌ Insufficient balance for swap');
      break;
    case ErrorCodes.SLIPPAGE_EXCEEDED:
      console.error('❌ Slippage tolerance exceeded');
      break;
    case ErrorCodes.POOL_NOT_FOUND:
      console.error('❌ Trading pool not found');
      break;
    case ErrorCodes.TRANSACTION_FAILED:
      console.error('❌ Transaction failed:', error.details);
      break;
    default:
      console.error('❌ Unknown error:', error.message);
  }
}
```

## Utility Functions

```typescript
import { Utils } from '@mariposa/agent-sdk';

// Convert values to BigNumber
const amount = Utils.toBigNumber('123.456');

// Format amounts for display
const formatted = Utils.formatAmount(amount, 2); // "123.46"

// Convert between token units and display units
const tokenUnits = Utils.toTokenUnits(new BigNumber('1'), 18); // 1e18
const displayUnits = Utils.fromTokenUnits(tokenUnits, 18); // 1

// Calculate slippage
const minAmount = Utils.calculateSlippage(amount, 5); // 5% slippage

// Address validation
const isValidSei = Utils.isValidSeiAddress('sei1abcdef...');
const isValidEth = Utils.isValidEthAddress('0x1234...');

// Retry with exponential backoff
const result = await Utils.retry(async () => {
  return await someFailingOperation();
}, 3, 1000); // 3 retries, 1 second base delay
```

## Best Practices

### 1. Error Handling
Always wrap agent operations in try-catch blocks and handle specific error codes.

### 2. Balance Validation
Check balances before executing swaps or transfers to avoid failed transactions.

### 3. Slippage Settings
Use appropriate slippage tolerance based on market conditions and token liquidity.

### 4. Gas Management
Monitor gas prices and adjust settings based on network congestion.

### 5. Event Monitoring
Use event listeners to track agent operations and respond to state changes.

### 6. Resource Cleanup
Always call `agent.disconnect()` when shutting down to clean up resources.

```typescript
// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔌 Shutting down agent...');
  await agent.disconnect();
  process.exit(0);
});
```

### 7. Secure Private Key Management
**Critical: Never hardcode private keys!** Use these secure patterns:

```typescript
// ✅ SECURE: Function parameter
function createTradingAgent(privateKey: string, address: string) {
  return new Agent({ 
    privateKey, 
    address, 
    network: SUPPORTED_NETWORKS.testnet,
    // ... other config
  });
}

// ✅ SECURE: Environment-based factory
async function createAgent(env: 'dev' | 'prod') {
  const credentials = env === 'prod' 
    ? await loadFromSecureVault() 
    : await promptForCredentials();
    
  return new Agent({ 
    privateKey: credentials.privateKey,
    address: credentials.address,
    // ... other config
  });
}

// ❌ INSECURE: Never do this!
const agent = new Agent({
  privateKey: 'hardcoded-key', // NEVER!
  // ...
});
```

## AgenticRouter Contract Integration

The SDK integrates with the AgenticRouter smart contract to provide:

- **Automated Fee Handling** - Platform fees are automatically swapped to stablecoins
- **Optimal Routing** - Multi-hop swaps through the best available pools
- **Slippage Protection** - Built-in slippage validation and protection
- **Pool Discovery** - Automatic detection of liquidity pools and fee tiers
- **Gas Optimization** - Optimized transaction construction for lower gas costs

### Contract Methods Available

- `swapSeiToToken` - Swap native SEI for any token
- `swapTokenToToken` - Swap between any two tokens
- `swapTokenToSei` - Swap any token back to SEI
- `transferWithFee` - Transfer tokens with automatic fee handling
- `nativeTransferWithFee` - Transfer SEI with automatic fee handling

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- GitHub Issues: [https://github.com/mariposa/agent-sdk/issues](https://github.com/mariposa/agent-sdk/issues)
- Documentation: [https://docs.mariposa.com](https://docs.mariposa.com)
- Discord: [https://discord.gg/mariposa](https://discord.gg/mariposa) 