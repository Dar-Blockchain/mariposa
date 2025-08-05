const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  agentUuid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  avatarName: {
    type: String,
    maxlength: 100,
    default: ''
  },
  role: {
    type: String,
    maxlength: 100,
    default: 'Trading Agent'
  },
  hederaAccountId: {
    type: String,
    index: true,
    sparse: true
  },
  hederaPrivateKey: {
    type: String,
    select: false // Don't return this field by default for security
  },
  hederaPublicKey: {
    type: String
  },
  hederaAccountCreationTx: {
    type: String,
    // Transaction ID from account creation
  },
  agentType: {
    type: String,
    enum: ['strategy', 'actions', 'information', 'feedback', 'general'],
    default: 'general',
    index: true
  },
  primaryStrategy: {
    type: String,
    required: false, // Only required for strategy agents
    default: null,
    validate: [
      {
        validator: function(value) {
          // If value is null or undefined, it's always valid (for non-strategy agents)
          if (value == null) {
            return true;
          }
          // If value is provided, it must be a valid enum value
          const validStrategies = ['DCA', 'momentum_trading', 'swing_trading', 'hodl', 'arbitrage', 'scalping', 'memecoin', 'yield_farming', 'spot_trading', 'futures_trading', 'custom'];
          return validStrategies.includes(value);
        },
        message: 'Invalid primary strategy. Must be one of: DCA, momentum_trading, swing_trading, hodl, arbitrage, scalping, memecoin, yield_farming, spot_trading, futures_trading, custom'
      },
      {
        validator: function(value) {
          // If agentType is 'strategy', primaryStrategy is required
          if (this.agentType === 'strategy') {
            return value != null && value !== '';
          }
          // For non-strategy agents, primaryStrategy can be null/undefined
          return true;
        },
        message: 'Primary strategy is required for strategy agents'
      }
    ]
  },
  configuration: {
    // DCA specific settings
    defaultBudget: {
      type: Number,
      default: 500
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'monthly'
    },
    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate'
    },
    preferredTokens: [{
      type: String
    }],
    // Trading specific settings
    maxPositionSize: {
      type: Number,
      default: 1000
    },
    stopLossPercentage: {
      type: Number,
      default: 10
    },
    takeProfitPercentage: {
      type: Number,
      default: 20
    },
    // Custom strategy settings
    customPrompt: {
      type: String,
      maxlength: 1000,
      default: ''
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  canBeginWork: {
    type: Boolean,
    default: false
  },
  totalInteractions: {
    type: Number,
    default: 0
  },
  totalBudgetManaged: {
    type: Number,
    default: 0
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    index: true
  },
  walletAddress: {
    type: String,
    index: true
  },
  currentStrategyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Strategy',
    index: true
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
agentSchema.index({ userId: 1, createdAt: -1 });
agentSchema.index({ userId: 1, primaryStrategy: 1 });

// Update the updatedAt field before saving
agentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to get agent's system prompt based on strategy
agentSchema.methods.getSystemPrompt = function() {
  const basePrompt = `You are a professional cryptocurrency trading and investment expert specializing in DEX strategies on the SEI network.

NETWORK: SEI Network
SUPPORTED TOKENS: BTC, ETH, SEI, USDC, USDT, DAI (stablecoins)
TRADING VENUE: DEX only (no centralized exchanges)
CURRENCY: All amounts in USD ($)
ACTIONS: BUY and SELL only

AGENT CONFIGURATION:
- Agent Name: ${this.name}
- Primary Strategy: ${this.primaryStrategy}
- Risk Tolerance: ${this.configuration.riskTolerance}
- Default Budget: $${this.configuration.defaultBudget}
- Frequency: ${this.configuration.frequency}
- Preferred Tokens: ${this.configuration.preferredTokens.join(', ')}

CRITICAL REQUIREMENTS:
- Always maintain conversation continuity by referencing previous interactions
- Use specific dollar amounts for recommendations
- Reference and build upon previous interactions when available
- Stay true to your ${this.primaryStrategy} strategy approach
- Acknowledge user customizations and preferences
- Compare with previous allocations when user requests changes`;

  let strategySpecificPrompt = '';

  switch (this.primaryStrategy) {
    case 'DCA':
      strategySpecificPrompt = `
PRIMARY STRATEGY: Dollar Cost Averaging (DCA)
FOCUS: Systematic investment approach, buying fixed dollar amounts at regular intervals
APPROACH: 
- Emphasize consistent, regular investments
- Reduce market timing risk through periodic purchases
- Build positions gradually over time
- Focus on long-term accumulation
- Recommend maintaining discipline regardless of market conditions`;
      break;

    case 'momentum_trading':
      strategySpecificPrompt = `
PRIMARY STRATEGY: Momentum Trading
FOCUS: Capitalize on strong price movements and trends
APPROACH:
- Identify tokens with strong upward momentum
- Enter positions on confirmed breakouts
- Use technical indicators for timing
- Set clear profit targets and stop losses
- Focus on short to medium-term trades`;
      break;

    case 'swing_trading':
      strategySpecificPrompt = `
PRIMARY STRATEGY: Swing Trading
FOCUS: Capture price swings over days to weeks
APPROACH:
- Identify support and resistance levels
- Buy near support, sell near resistance
- Use both technical and fundamental analysis
- Hold positions for 3-30 days typically
- Balance risk with profit potential`;
      break;

    case 'hodl':
      strategySpecificPrompt = `
PRIMARY STRATEGY: HODL (Hold On for Dear Life)
FOCUS: Long-term holding regardless of market volatility
APPROACH:
- Emphasize buying and holding quality assets
- Ignore short-term price movements
- Focus on fundamental value
- Recommend large, established cryptocurrencies
- Encourage diamond hands mentality`;
      break;

    case 'arbitrage':
      strategySpecificPrompt = `
PRIMARY STRATEGY: Arbitrage Trading
FOCUS: Profit from price differences across DEX platforms
APPROACH:
- Identify price discrepancies between DEXs
- Execute quick buy/sell combinations
- Consider gas fees and slippage
- Focus on high-volume, liquid tokens
- Emphasize speed and precision`;
      break;

    case 'custom':
      strategySpecificPrompt = `
PRIMARY STRATEGY: Custom Strategy
CUSTOM INSTRUCTIONS: ${this.configuration.customPrompt || 'Follow user-defined trading approach'}
FOCUS: Adapt to user's specific requirements and preferences`;
      break;
  }

  return basePrompt + strategySpecificPrompt + `

MEMORY USAGE:
When you receive memory context, you MUST:
- Start your response by acknowledging previous interactions ("Based on our last conversation...")
- Reference specific details from previous interactions
- Compare new requests with previous allocations if user is making changes
- Build naturally upon previous strategies
- Maintain conversation continuity

RESPONSE FORMAT REQUIREMENTS:
- Always use PERCENTAGE allocations (40%, 30%, 20%, 10%)
- Include both percentage AND dollar amounts in action plans
- If user doesn't specify budget, PROPOSE an appropriate budget
- Provide clean, well-structured JSON responses
- Use 4-step action plans with clear reasoning

IMPORTANT: Always respond in valid JSON format with percentage-based allocations, reference memory when provided, and stay true to your primary strategy while being conversational and adaptive to user needs.`;
};

// Method to update interaction statistics
agentSchema.methods.updateStats = function(budgetAmount = 0) {
  this.totalInteractions += 1;
  this.totalBudgetManaged += budgetAmount;
  this.lastInteraction = new Date();
  return this.save();
};

// Static method to get user's agents
agentSchema.statics.getUserAgents = async function(userId) {
  return await this.find({ userId, isActive: true })
    .sort({ lastInteraction: -1 })
    .select('-__v');
};

// Static method to get agent statistics
agentSchema.statics.getAgentStats = async function(agentId) {
  const agent = await this.findById(agentId);
  if (!agent) return null;

  const Memory = mongoose.model('Memory');
  const memoryCount = await Memory.countDocuments({ agentId });
  
  return {
    agent: agent.toObject(),
    memoryCount,
    averageBudget: agent.totalInteractions > 0 ? agent.totalBudgetManaged / agent.totalInteractions : 0
  };
};

module.exports = mongoose.model('Agent', agentSchema); 