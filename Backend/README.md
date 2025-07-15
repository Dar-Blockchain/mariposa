# Mareposa Backend

A Node.js Express API with MongoDB using Mongoose for data modeling.

## 🧠 AI Agent with Memory System

The AI agent now includes a sophisticated **memory system** that maintains conversation context across interactions, providing:

### Memory Features

- **Conversation Continuity**: References previous strategies and recommendations
- **Strategy Evolution**: Tracks changes in user preferences over time
- **Budget Tracking**: Remembers previous investments and allocations
- **Session Management**: Automatic session identification and persistent memory

### Memory Endpoints

- **Strategy Generation**: `POST /api/agent/strategy` - Enhanced with memory context
- **Memory History**: `GET /api/agent/memory?limit=5` - Retrieve conversation history
- **Chat**: `POST /api/agent/chat` - General conversation with AI agent
- **Prices**: `GET /api/agent/prices` - SEI network token prices

### Memory-Enhanced Strategy Example

**Initial Request:**
```json
{
  "message": "I want to invest $1000 in BTC and ETH for long-term holding. Conservative approach."
}
```

**Follow-up Request:**
```json
{
  "message": "I want to add more to my BTC position. Market seems to be dipping."
}
```

**AI Response with Memory Context:**
```json
{
  "analysis": "Based on your previous conservative strategy with $600 BTC and $300 ETH, this dip is a good opportunity to add more BTC while staying within your conservative approach...",
  "userMessage": "Great timing! Since you already have $600 in BTC from our previous strategy, I recommend buying an additional $200-300 BTC to take advantage of the lower prices...",
  "actionPlan": [
    {
      "action": "BUY $250 worth of BTC on current dip for long-term holding",
      "actionType": "BUY",
      "dollarAmount": "$250.00",
      "ref": "BUY_BTC_DIP_1234567891",
      "reasoning": "Adding to existing BTC position during market dip, consistent with previous conservative strategy"
    }
  ],
  "memoryContext": "Previous interactions considered"
}
```

### Memory Data Structure

Each memory entry stores:
- **User Intent**: Original message and extracted parameters
- **Strategy Type**: long_holding, short_trading, or mixed
- **Budget Amount**: Total dollar amount involved
- **Actions**: Detailed buy/sell actions with REF IDs
- **Summary**: AI-generated strategy summary
- **Outcome**: pending, executed, or cancelled

### Testing Memory

Run the memory test to verify functionality:

```bash
node test-memory.js
```

This will test:
- ✅ Memory creation and storage
- ✅ Recent memory retrieval
- ✅ AI context formatting
- ✅ Session isolation
- ✅ Memory cleanup

---

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   cp config/env.example .env
   # Edit .env with your configuration
   ```

3. **Start the Server**
   ```bash
   npm run dev
   ```

4. **Access Swagger Documentation**
   ```
   http://localhost:5000/api-docs
   ```

## 📊 Project Structure

```
Backend/
├── config/
│   ├── database.js          # MongoDB connection
│   ├── env.example          # Environment variables template
│   └── swagger.js           # API documentation setup
├── controllers/
│   ├── aiAgentController.js # AI agent with memory system
│   ├── productController.js # Product management
│   └── userController.js    # User management
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── Memory.js            # Memory/conversation model
│   ├── Product.js           # Product model
│   └── User.js              # User model
├── routes/
│   ├── aiAgentRoutes.js     # AI agent endpoints
│   ├── productRoutes.js     # Product endpoints
│   └── userRoutes.js        # User endpoints
├── examples/
│   └── ai-agent-usage.md    # AI agent usage examples
├── test-memory.js           # Memory functionality test
└── index.js                 # Main application entry point
```

## 🤖 AI Agent Features

### Buy/Sell Strategy Generation
- **Dollar-based recommendations** with specific amounts
- **Buy/sell actions** with unique REF IDs for bot execution
- **Long-term vs short-term** strategy classification
- **Risk assessment** based on user preferences

### Memory System
- **Conversation continuity** across sessions
- **Strategy evolution** tracking
- **Budget awareness** of previous investments
- **Session management** with automatic identification

### Supported Operations
- **BUY**: Purchase recommendations with dollar amounts
- **SELL**: Selling strategies with target prices
- **HOLD**: Long-term holding recommendations
- **REBALANCE**: Portfolio adjustment suggestions

## 🔧 API Endpoints

### AI Agent (with Memory)
- `POST /api/agent/strategy` - Generate buy/sell strategy with memory context
- `GET /api/agent/memory` - Retrieve conversation history
- `POST /api/agent/chat` - Chat with AI agent
- `GET /api/agent/prices` - Get SEI network token prices

### User Management
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User authentication
- `GET /api/users` - Get all users (auth required)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Product Management
- `GET /api/products` - Get all products with pagination
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (auth required)
- `PUT /api/products/:id` - Update product (auth required)
- `DELETE /api/products/:id` - Delete product (auth required)
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/featured` - Get featured products

## 🛡️ Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **JWT** authentication
- **bcrypt** password hashing
- **Input validation** with express-validator
- **Rate limiting** ready for implementation

## 📈 SEI Network Integration

The AI agent specializes in **SEI network DEX trading**:

- **Supported Tokens**: BTC, ETH, SEI, USDC, USDT, DAI
- **Trading Venue**: DEX only (no centralized exchanges)
- **Network**: SEI network exclusively
- **Gas Optimization**: Strategies account for SEI network costs
- **Bot Integration**: REF IDs for automated execution

## 🗄️ Database Models

### Memory Model
- Session-based conversation storage
- Strategy tracking and evolution
- Budget and action history
- Outcome tracking (pending/executed/cancelled)

### User Model
- JWT authentication system
- Secure password hashing
- Role-based access control
- Profile management

### Product Model
- E-commerce features
- Category management
- Featured products
- Inventory tracking

## 🔍 Example Usage

### Memory-Enhanced Strategy Request
```bash
curl -X POST http://localhost:5000/api/agent/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to invest $1000 in BTC and ETH for long-term holding. Conservative approach and can add $200 monthly."
  }'
```

### Follow-up Request (with Memory Context)
```bash
curl -X POST http://localhost:5000/api/agent/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to add more to my BTC position. Market seems to be dipping."
  }'
```

### Check Memory History
```bash
curl "http://localhost:5000/api/agent/memory?limit=5"
```

## 🧪 Testing

### Memory System Test
```bash
node test-memory.js
```

### API Testing
Use the interactive Swagger documentation at `/api-docs` to test all endpoints.

## 📚 Documentation

- **Swagger UI**: `/api-docs` - Interactive API documentation
- **Usage Examples**: `examples/ai-agent-usage.md` - Detailed usage examples
- **Memory Examples**: Shows conversation flow and continuity

## 🚀 Production Deployment

1. **Environment Setup**
   - Set production environment variables
   - Configure MongoDB connection
   - Set up Together AI API key

2. **Security Considerations**
   - Implement rate limiting
   - Set up proper CORS origins
   - Configure session management
   - Set up monitoring and logging

3. **Performance Optimization**
   - Database indexing for memory queries
   - Caching for frequently accessed data
   - Connection pooling for database
   - CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for SEI Network DEX Trading** 