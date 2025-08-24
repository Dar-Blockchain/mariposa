# 🦋 Mariposa - AI-Powered Crypto Trading Platform

Mariposa is a comprehensive decentralized AI-powered crypto trading platform built on the SEI blockchain. The platform combines advanced AI agents, smart contract automation, and real-time market data to provide autonomous trading capabilities.

## 🌟 Platform Overview

Mariposa consists of four main components working together:

1. **Frontend** - Next.js web application with modern React UI
2. **Backend** - Express.js API server with AI integration
3. **Market MCP** - Model Context Protocol server for market data
4. **Agent SDK** - TypeScript SDK for SEI blockchain trading operations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │────│     Backend     │────│   Market MCP    │
│   (Next.js)     │    │   (Express)     │    │   (MCP Server)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│   Agent SDK     │──────────────┘
                        │  (Trading SDK)  │
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/mariposa.git
cd mariposa
```

### 2. Environment Setup

Create environment files for each component:

```bash
# Frontend environment
cp .env.local.example .env.local

# Backend environment  
cp Backend/.env.example Backend/.env

# Edit the files with your configuration
```

### 3. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd Backend && npm install

# Install market-mcp dependencies
cd ../market-mcp && npm install

# Install agent-sdk dependencies  
cd ../Backend/agent-sdk && npm install
```

### 4. Start Development Servers

```bash
# Terminal 1: Start Backend
cd Backend
npm run dev

# Terminal 2: Start Frontend
npm run dev

# Terminal 3: Start Market MCP
cd market-mcp
npm run dev
```

Visit `http://localhost:3002` to access the application.

## 📦 Components Overview

### 🎨 Frontend (Next.js Application)

**Location**: Root directory  
**Port**: 3002  
**Framework**: Next.js 14 with TypeScript

#### Key Features:
- **Authentication System**: OTP-based phone authentication
- **Wallet Management**: Crypto wallet creation and management  
- **Trading Dashboard**: Real-time trading interface
- **Agent Management**: Create and manage AI trading agents
- **Pipeline System**: Automated trading pipeline configuration
- **Portfolio Tracking**: Real-time portfolio monitoring

#### Technology Stack:
- **Framework**: Next.js 14, React 18
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: Redux Toolkit with Redux Persist
- **Authentication**: JWT with OTP verification
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form

#### Directory Structure:
```
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Main dashboard
│   └── trading/        # Trading interface
├── components/         # React components
│   ├── ui/            # Base UI components (Radix)
│   ├── auth/          # Auth-related components
│   └── landing/       # Landing page components
├── lib/               # Utilities and configurations
├── hooks/             # Custom React hooks
└── public/            # Static assets
```

#### Key Routes:
- `/` - Landing page
- `/auth` - Authentication flow
- `/dashboard` - Main user dashboard
- `/trading` - Trading interface
- `/agents` - AI agent management
- `/pipeline` - Trading pipeline configuration

---

### ⚙️ Backend (Express.js API)

**Location**: `./Backend`  
**Port**: 5000  
**Framework**: Express.js with Node.js

#### Key Features:
- **User Management**: Registration, authentication, profiles
- **Wallet Service**: Secure crypto wallet operations
- **AI Agent Integration**: AI-powered trading agents
- **Trading Engine**: Execute trades via smart contracts
- **Pipeline System**: Automated trading strategies
- **Real-time Data**: Market data and portfolio updates

#### Technology Stack:
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **AI Integration**: Together AI API
- **Blockchain**: Ethers.js for SEI network
- **Security**: Helmet, CORS, rate limiting

#### Directory Structure:
```
Backend/
├── controllers/        # Route controllers
├── models/            # MongoDB models
├── routes/            # Express routes
├── services/          # Business logic services
├── middleware/        # Custom middleware
├── config/           # Configuration files
└── utils/            # Utility functions
```

#### Key APIs:
- `POST /api/auth/send-otp` - Send OTP for authentication
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/users/profile` - Get user profile
- `POST /api/wallets/create` - Create new wallet
- `GET /api/wallets/balance` - Get wallet balance
- `POST /api/agents/create` - Create AI agent
- `POST /api/pipelines/create` - Create trading pipeline

---

### 📊 Market MCP (Market Context Protocol)

**Location**: `./market-mcp`  
**Port**: 3001  
**Type**: MCP Server

#### Key Features:
- **Real-time Market Data**: Live price feeds and market information
- **Trading Operations**: Execute trades via MCP protocol
- **Data Aggregation**: Aggregate data from multiple sources
- **Context Provision**: Provide market context to AI agents

#### Technology Stack:
- **Framework**: Express.js with TypeScript
- **Protocol**: Model Context Protocol (MCP)
- **Data Sources**: Multiple market data providers
- **Rate Limiting**: Built-in rate limiting

#### MCP Tools Available:
- `get_market_data` - Fetch current market prices
- `get_historical_data` - Get historical price data  
- `execute_trade` - Execute trading operations
- `get_portfolio` - Retrieve portfolio information

---

### 🔧 Agent SDK (Trading SDK)

**Location**: `./Backend/agent-sdk`  
**Package**: `@mariposa-plus/agent-sdk`  
**Version**: 1.0.2

#### Key Features:
- **SEI Network Integration**: Native SEI blockchain support
- **Smart Contract Interaction**: Interact with trading contracts
- **Wallet Management**: Secure wallet operations
- **Trading Operations**: Execute swaps, transfers, and trades
- **Type Safety**: Full TypeScript support

#### Technology Stack:
- **Language**: TypeScript
- **Blockchain**: Ethers.js v5
- **Network**: SEI EVM
- **Math**: BigNumber.js for precision

#### Usage Example:
```typescript
import { SimpleAgent } from '@mariposa-plus/agent-sdk';

const agent = new SimpleAgent({
  privateKey: 'your-private-key',
  rpcUrl: 'https://evm-rpc.arctic-1.seinetwork.io'
});

// Execute a token swap
await agent.swapTokens({
  tokenIn: 'WSEI',
  tokenOut: 'USDC',
  amountIn: '1.0',
  slippage: 0.01
});
```

## 🔐 Environment Configuration

### Frontend (.env.local)

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# JWT Configuration
NEXT_PUBLIC_JWT_SECRET=your-super-secret-jwt-key-here

# App Configuration
NEXT_PUBLIC_APP_NAME=Mariposa
NEXT_PUBLIC_APP_DESCRIPTION=AI-Powered Crypto Trading Platform

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

### Backend (.env)

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/mariposa

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=24h

# AI Configuration
TOGETHER_API_KEY=your-together-ai-api-key-here

# SEI Network Configuration
SEI_RPC_URL=https://evm-rpc.arctic-1.seinetwork.io
SEI_CHAIN_ID=arctic-1
AGENTIC_ROUTER_ADDRESS=0x1234567890123456789012345678901234567890

# Token Addresses (SEI Arctic Testnet)
WSEI_ADDRESS=0xe30fedd158a2e3b13e9badaeabafc5516e95e8c7
USDC_ADDRESS=0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1
USDT_ADDRESS=0x9151434b16b9763660705744891fa906f660ecc5

# Security
WALLET_ENCRYPTION_KEY=change_this_to_a_secure_key_in_production
BCRYPT_SALT_ROUNDS=12
```

## 🛠️ Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
```

#### Backend
```bash
npm run dev          # Start with nodemon
npm start            # Start production server
npm run fix-agent-sdk # Fix agent-sdk issues
```

#### Market MCP
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start            # Start production server
```

#### Agent SDK
```bash
npm run build        # Build TypeScript
npm run dev          # Watch mode development
npm run example      # Run example usage
```

### Development Workflow

1. **Start all services** in development mode
2. **Frontend**: `http://localhost:3002`
3. **Backend API**: `http://localhost:5000`  
4. **Market MCP**: `http://localhost:3001`

### API Documentation

- **Backend API**: `http://localhost:5000/api-docs` (Swagger)
- **Market MCP**: `http://localhost:3001/docs`

## 🧪 Testing

### Backend Testing
```bash
cd Backend
node test-auth.js           # Test authentication
node test-wallet-system.js  # Test wallet functionality
node test-agents.js         # Test AI agents
```

### Agent SDK Testing
```bash
cd Backend/agent-sdk
node test-sdk.js           # Test SDK functionality
npm run example            # Run example usage
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build

# Install backend production dependencies
cd Backend && npm ci --only=production

# Build market-mcp
cd ../market-mcp && npm run build

# Build agent-sdk
cd ../Backend/agent-sdk && npm run build
```

### Environment Setup

1. Set `NODE_ENV=production` in all environment files
2. Configure production database URLs
3. Set secure JWT secrets
4. Configure production RPC URLs
5. Set up proper CORS origins

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connections tested
- [ ] JWT secrets are secure and unique
- [ ] API keys are valid
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] SSL certificates are installed
- [ ] All dependencies are installed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the individual README files in each component directory
- **Issues**: Report bugs and request features via GitHub Issues
- **Discord**: Join our community Discord server (link TBD)

## 🔗 Links

- **Agent SDK NPM Package**: [@mariposa-plus/agent-sdk](https://www.npmjs.com/package/@mariposa-plus/agent-sdk)
- **SEI Network Documentation**: [https://docs.sei.io/](https://docs.sei.io/)
- **Smart Contracts**: See `./smart-contracts/` directory

---

Built with ❤️ by the Mariposa Team