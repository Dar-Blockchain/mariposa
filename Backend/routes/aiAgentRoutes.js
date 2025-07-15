const express = require('express');
const { body } = require('express-validator');
const {
  chatWithAgent,
  getCryptoPrices,
  generateDCAStrategy
} = require('../controllers/aiAgentController');
const Memory = require('../models/Memory');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AIAgentRequest:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           description: User's message to the AI agent
 *           example: "I want to start trading on SEI network with moderate risk tolerance"
 *         context:
 *           type: object
 *           properties:
 *             portfolio:
 *               type: object
 *               description: User's current portfolio
 *               example: {"BTC": 0.5, "ETH": 2.0}
 *             budget:
 *               type: number
 *               description: User's monthly budget
 *               example: 500
 *             riskTolerance:
 *               type: string
 *               enum: [conservative, moderate, aggressive]
 *               description: User's risk tolerance
 *               example: "moderate"
 *             timeline:
 *               type: string
 *               description: Investment timeline
 *               example: "12 months"
 *     DCAStrategyRequest:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           description: User's message describing their investment intent, holding preferences, and budget
 *           example: "I want to invest $1000 in BTC and ETH for long-term holding. I prefer conservative approach and can add $200 monthly."
 *     ExtractedParameters:
 *       type: object
 *       properties:
 *         intent:
 *           type: string
 *           description: Extracted investment intent
 *           example: "long_holding"
 *           enum: [long_holding, short_trading, mixed]
 *         mentionedCoins:
 *           type: array
 *           items:
 *             type: string
 *           description: Coins mentioned in the message
 *           example: ["BTC", "ETH", "SEI"]
 *         riskIndicators:
 *           type: string
 *           description: Risk tolerance indicators from message
 *           example: "conservative"
 *           enum: [conservative, moderate, aggressive]
 *         budgetHints:
 *           type: string
 *           description: Budget information found in message
 *           example: "$1000 initial, $200 monthly"
 *         timeline:
 *           type: string
 *           description: Timeline extracted from message
 *           example: "long-term (months/years)"
 *         holdingStrategy:
 *           type: string
 *           description: Extracted holding strategy
 *           example: "accumulation"
 *           enum: [accumulation, profit_taking, rebalancing]
 *     BudgetRecommendation:
 *       type: object
 *       properties:
 *         minimumBudget:
 *           type: string
 *           description: Minimum budget needed for strategy success
 *           example: "$200 minimum needed for diversified strategy"
 *         recommendedBudget:
 *           type: string
 *           description: Optimal budget for strategy
 *           example: "$500 optimal amount for portfolio building"
 *         frequency:
 *           type: string
 *           description: Recommended investment frequency
 *           example: "monthly"
 *         dollarAllocation:
 *           type: object
 *           description: Specific dollar amounts for each token
 *           properties:
 *             BTC:
 *               type: string
 *               example: "$200 for Bitcoin accumulation"
 *             ETH:
 *               type: string
 *               example: "$150 for Ethereum position"
 *             SEI:
 *               type: string
 *               example: "$100 for native SEI tokens"
 *             stablecoins:
 *               type: string
 *               example: "$50 for stability and opportunities"
 *         reasoning:
 *           type: string
 *           description: Explanation of budget calculations
 *           example: "Minimum viable amounts for DEX trading considering gas costs and diversification"
 *     MemoryContext:
 *       type: object
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         userIntent:
 *           type: string
 *           example: "I want to invest $1000 in BTC and ETH for long-term holding"
 *         strategyType:
 *           type: string
 *           enum: [long_holding, short_trading, mixed]
 *           example: "long_holding"
 *         budget:
 *           type: number
 *           example: 1000
 *         actions:
 *           type: string
 *           example: "BUY $600 USDC/BTC (long-term), BUY $300 USDC/ETH (long-term)"
 *         summary:
 *           type: string
 *           example: "Created conservative long-term strategy with BTC and ETH focus"
 *         outcome:
 *           type: string
 *           enum: [pending, executed, cancelled]
 *           example: "pending"
 *     AIAgentResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             response:
 *               $ref: '#/components/schemas/AIResponse'
 *             metadata:
 *               type: object
 *               properties:
 *                 model:
 *                   type: string
 *                   example: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 tokensUsed:
 *                   type: number
 *                   example: 1500
 *     CryptoPricesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             prices:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   symbol:
 *                     type: string
 *                     example: "BTC"
 *                   name:
 *                     type: string
 *                     example: "Bitcoin"
 *                   price:
 *                     type: number
 *                     example: 42000.50
 *                   change24h:
 *                     type: number
 *                     example: 2.5
 *                   volume24h:
 *                     type: number
 *                     example: 1500000000
 *                   marketCap:
 *                     type: number
 *                     example: 800000000000
 *                   network:
 *                     type: string
 *                     example: "sei"
 *                   type:
 *                     type: string
 *                     example: "wrapped"
 *     AIResponse:
 *       type: object
 *       properties:
 *         analysis:
 *           type: string
 *           description: Detailed analysis of user's message and investment intent
 *           example: "The user is interested in long-term holding with conservative approach..."
 *         extractedParameters:
 *           $ref: '#/components/schemas/ExtractedParameters'
 *         strategy:
 *           type: string
 *           description: Comprehensive buy/sell strategy tailored to user's message
 *           example: "A conservative long-term holding strategy focusing on BTC and ETH accumulation..."
 *         budgetRecommendation:
 *           $ref: '#/components/schemas/BudgetRecommendation'
 *         actionPlan:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               step:
 *                 type: number
 *                 example: 1
 *               action:
 *                 type: string
 *                 example: "BUY $200 worth of BTC on SEI DEX for long-term holding"
 *               actionType:
 *                 type: string
 *                 enum: [BUY, SELL]
 *                 example: "BUY"
 *               dollarAmount:
 *                 type: string
 *                 example: "$200.00"
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 example: "high"
 *               timeframe:
 *                 type: string
 *                 enum: [immediate, short-term, long-term]
 *                 example: "immediate"
 *               ref:
 *                 type: string
 *                 example: "BUY_BTC_1234567890"
 *               tokenPair:
 *                 type: string
 *                 example: "USDC/BTC"
 *               network:
 *                 type: string
 *                 example: "sei"
 *               holdingPeriod:
 *                 type: string
 *                 enum: [short-term, long-term]
 *                 example: "long-term"
 *               reasoning:
 *                 type: string
 *                 example: "Bitcoin as core holding for portfolio foundation"
 *         userMessage:
 *           type: string
 *           description: Clear message to send back to the user explaining the strategy
 *           example: "Based on your message, I've created a long-term holding strategy focusing on gradual accumulation..."
 *         riskAssessment:
 *           type: string
 *           description: Risk analysis for the buy/sell strategy based on holding period
 *           example: "Conservative risk long-term holding strategy suitable for gradual wealth building..."
 *         recommendations:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Start with $500 initial investment spread across BTC and ETH", "Use SEI network DEX for lower transaction costs"]
 *         marketInsights:
 *           type: string
 *           description: Current SEI network market insights relevant to buy/sell decisions
 *           example: "SEI network offers low-cost DEX trading opportunities with growing ecosystem..."
 *         nextSteps:
 *           type: string
 *           description: What the user should do next with specific dollar amounts and actions
 *           example: "Execute the buy orders starting with BTC ($200), then ETH ($150)..."
 *     DCAStrategyResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             strategy:
 *               $ref: '#/components/schemas/AIResponse'
 *             originalMessage:
 *               type: string
 *               description: The original user message
 *               example: "I want to invest $1000 in BTC and ETH..."
 *             sessionId:
 *               type: string
 *               description: Session identifier for memory tracking
 *               example: "127.0.0.1_Mozilla_5.0_Chrome_120.0"
 *             memoryContext:
 *               type: string
 *               description: Indicates if previous interactions were considered
 *               example: "Previous interactions considered"
 *             timestamp:
 *               type: string
 *               format: date-time
 *               example: "2024-01-15T10:30:00.000Z"
 *     MemoryHistoryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             sessionId:
 *               type: string
 *               example: "127.0.0.1_Mozilla_5.0_Chrome_120.0"
 *             memories:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MemoryContext'
 *             count:
 *               type: number
 *               example: 3
 *             timestamp:
 *               type: string
 *               format: date-time
 *               example: "2024-01-15T10:30:00.000Z"
 *   tags:
 *     - name: AI Agent
 *       description: AI-powered crypto DCA expert agent endpoints
 */

/**
 * @swagger
 * /api/agent/memory:
 *   get:
 *     summary: Get conversation memory history (deprecated)
 *     tags: [AI Agent]
 *     deprecated: true
 *     description: This endpoint is deprecated. Use /api/agents/{id}/memory instead for agent-specific memory retrieval.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Maximum number of memories to return
 *         example: 5
 *     responses:
 *       200:
 *         description: Memory history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "This endpoint is deprecated. Use /api/agents/{id}/memory for agent-specific memory."
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 */
router.get('/memory', async (req, res) => {
  res.json({
    success: true,
    data: {
      message: "This endpoint is deprecated. Use /api/agents/{id}/memory for agent-specific memory retrieval.",
      redirectTo: "/api/agents/{agentId}/memory",
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @swagger
 * /api/agent/chat:
 *   post:
 *     summary: Chat with AI crypto expert
 *     tags: [AI Agent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's message to the AI agent
 *                 example: "I want to start trading on SEI network with moderate risk tolerance"
 *               agentId:
 *                 type: string
 *                 description: Optional agent ID to use for specialized responses
 *                 example: "60d5ecb54b5d4c001f3a8b25"
 *     responses:
 *       200:
 *         description: AI agent response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     response:
 *                       type: string
 *                       description: AI agent's response
 *                       example: "Based on your moderate risk tolerance, I recommend starting with a diversified approach..."
 *                     agentId:
 *                       type: string
 *                       example: "60d5ecb54b5d4c001f3a8b25"
 *                     agentName:
 *                       type: string
 *                       example: "My DCA Bot"
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         model:
 *                           type: string
 *                           example: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Server error
 */
router.post('/chat', [
  body('message').notEmpty().withMessage('Message is required'),
  body('agentId').optional().isMongoId().withMessage('Invalid agent ID')
], chatWithAgent);

/**
 * @swagger
 * /api/agent/prices:
 *   get:
 *     summary: Get SEI network crypto prices
 *     tags: [AI Agent]
 *     responses:
 *       200:
 *         description: Current crypto prices on SEI network
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CryptoPricesResponse'
 *       500:
 *         description: Server error
 */
router.get('/prices', getCryptoPrices);

/**
 * @swagger
 * /api/agent/strategy:
 *   post:
 *     summary: Generate buy/sell strategy using specific agent
 *     tags: [AI Agent]
 *     description: Analyze user message and generate a comprehensive buy/sell strategy using a specific agent's configuration and memory. Each agent has its own strategy, risk tolerance, and conversation history.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - agentId
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's message describing their investment intent and preferences
 *                 example: "I want to invest more in BTC since the market is dipping. What do you recommend?"
 *               agentId:
 *                 type: string
 *                 description: ID of the agent to use for strategy generation
 *                 example: "60d5ecb54b5d4c001f3a8b25"
 *           examples:
 *             dcaAgentStrategy:
 *               summary: DCA Agent Strategy
 *               value:
 *                 message: "I want to add more to my BTC position. Market seems to be dipping."
 *                 agentId: "60d5ecb54b5d4c001f3a8b25"
 *             momentumAgentStrategy:
 *               summary: Momentum Trading Agent Strategy
 *               value:
 *                 message: "SEI is showing strong momentum. Should I enter a position?"
 *                 agentId: "60d5ecb54b5d4c001f3a8b26"
 *             beginnerRequest:
 *               summary: Beginner with HODL Agent
 *               value:
 *                 message: "I'm new to crypto and want to start investing safely."
 *                 agentId: "60d5ecb54b5d4c001f3a8b27"
 *     responses:
 *       200:
 *         description: Generated buy/sell strategy with agent-specific recommendations and memory context
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     strategy:
 *                       $ref: '#/components/schemas/AIResponse'
 *                     agent:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "60d5ecb54b5d4c001f3a8b25"
 *                         name:
 *                           type: string
 *                           example: "My DCA Bot"
 *                         primaryStrategy:
 *                           type: string
 *                           example: "DCA"
 *                         configuration:
 *                           type: object
 *                           properties:
 *                             defaultBudget:
 *                               type: number
 *                               example: 500
 *                             riskTolerance:
 *                               type: string
 *                               example: "moderate"
 *                             preferredTokens:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["BTC", "ETH", "SEI"]
 *                     originalMessage:
 *                       type: string
 *                       description: The original user message
 *                       example: "I want to add more to my BTC position..."
 *                     sessionId:
 *                       type: string
 *                       description: Session identifier for memory tracking
 *                       example: "127.0.0.1_Mozilla_5.0_Chrome_120.0"
 *                     memoryContext:
 *                       type: string
 *                       description: Indicates if previous interactions were considered
 *                       example: "Previous interactions considered"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Server error
 */
// @desc    Generate buy/sell strategy using specific agent
// @route   POST /api/agent/strategy
// @access  Public
router.post('/strategy', [
  body('message').notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
  body('agentId').notEmpty().withMessage('Agent ID is required')
    .isMongoId().withMessage('Invalid agent ID')
], generateDCAStrategy);

module.exports = router; 