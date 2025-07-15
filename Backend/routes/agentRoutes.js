const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createAgent,
  getUserAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  getAgentMemory,
  getAgentStrategies
} = require('../controllers/agentController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AgentConfiguration:
 *       type: object
 *       properties:
 *         defaultBudget:
 *           type: number
 *           description: Default budget amount in USD
 *           example: 500
 *         frequency:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           description: Investment frequency
 *           example: "monthly"
 *         riskTolerance:
 *           type: string
 *           enum: [conservative, moderate, aggressive]
 *           description: Risk tolerance level
 *           example: "moderate"
 *         preferredTokens:
 *           type: array
 *           items:
 *             type: string
 *             enum: [BTC, ETH, SEI, USDC, USDT, DAI]
 *           description: Preferred tokens for trading
 *           example: ["BTC", "ETH", "SEI"]
 *         maxPositionSize:
 *           type: number
 *           description: Maximum position size in USD
 *           example: 1000
 *         stopLossPercentage:
 *           type: number
 *           description: Stop loss percentage
 *           example: 10
 *         takeProfitPercentage:
 *           type: number
 *           description: Take profit percentage
 *           example: 20
 *         customPrompt:
 *           type: string
 *           description: Custom strategy instructions (for custom strategy type)
 *           example: "Focus on DeFi tokens with strong fundamentals"
 *     AgentRequest:
 *       type: object
 *       required:
 *         - name
 *         - userId
 *         - primaryStrategy
 *       properties:
 *         name:
 *           type: string
 *           description: Agent name
 *           example: "My DCA Bot"
 *         description:
 *           type: string
 *           description: Agent description
 *           example: "Conservative DCA strategy for long-term accumulation"
 *         userId:
 *           type: string
 *           description: User ID who owns the agent
 *           example: "user123"
 *         primaryStrategy:
 *           type: string
 *           enum: [DCA, momentum_trading, swing_trading, hodl, arbitrage, custom]
 *           description: Primary trading strategy
 *           example: "DCA"
 *         configuration:
 *           $ref: '#/components/schemas/AgentConfiguration'
 *     Agent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Agent ID
 *           example: "60d5ecb54b5d4c001f3a8b25"
 *         name:
 *           type: string
 *           example: "My DCA Bot"
 *         description:
 *           type: string
 *           example: "Conservative DCA strategy for long-term accumulation"
 *         userId:
 *           type: string
 *           example: "user123"
 *         primaryStrategy:
 *           type: string
 *           example: "DCA"
 *         configuration:
 *           $ref: '#/components/schemas/AgentConfiguration'
 *         isActive:
 *           type: boolean
 *           example: true
 *         totalInteractions:
 *           type: number
 *           example: 15
 *         totalBudgetManaged:
 *           type: number
 *           example: 2500
 *         lastInteraction:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T09:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *     AgentMemoryStats:
 *       type: object
 *       properties:
 *         totalInteractions:
 *           type: number
 *           example: 15
 *         totalBudget:
 *           type: number
 *           example: 2500
 *         avgBudget:
 *           type: number
 *           example: 166.67
 *         strategiesUsed:
 *           type: array
 *           items:
 *             type: string
 *           example: ["long_holding", "short_trading"]
 *         pendingActions:
 *           type: number
 *           example: 3
 *         executedActions:
 *           type: number
 *           example: 12
 *     AgentWithStats:
 *       allOf:
 *         - $ref: '#/components/schemas/Agent'
 *         - type: object
 *           properties:
 *             memoryStats:
 *               $ref: '#/components/schemas/AgentMemoryStats'
 *     StrategyInfo:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "DCA"
 *         description:
 *           type: string
 *           example: "Dollar Cost Averaging - Systematic investment approach"
 *         focus:
 *           type: string
 *           example: "Long-term accumulation, reduced timing risk"
 *         riskLevel:
 *           type: string
 *           example: "Low to Moderate"
 *         timeframe:
 *           type: string
 *           example: "Long-term (months/years)"
 *         bestFor:
 *           type: string
 *           example: "Conservative investors, beginners"

/**
 * @swagger
 * /api/agents/strategies:
 *   get:
 *     summary: Get available agent strategies
 *     tags: [Agents]
 *     description: Retrieve all available trading strategies for agents
 *     responses:
 *       200:
 *         description: Available strategies retrieved successfully
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
 *                     strategies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StrategyInfo'
 *                     count:
 *                       type: number
 *                       example: 6
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 */
router.get('/strategies', getAgentStrategies);

/**
 * @swagger
 * /api/agents:
 *   post:
 *     summary: Create a new agent
 *     tags: [Agents]
 *     description: Create a new trading agent with specific strategy and configuration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgentRequest'
 *           examples:
 *             dcaAgent:
 *               summary: DCA Agent
 *               value:
 *                 name: "Conservative DCA Bot"
 *                 description: "Long-term DCA strategy for BTC and ETH"
 *                 userId: "user123"
 *                 primaryStrategy: "DCA"
 *                 configuration:
 *                   defaultBudget: 500
 *                   frequency: "monthly"
 *                   riskTolerance: "conservative"
 *                   preferredTokens: ["BTC", "ETH"]
 *             momentumAgent:
 *               summary: Momentum Trading Agent
 *               value:
 *                 name: "Momentum Trader"
 *                 description: "High-frequency momentum trading"
 *                 userId: "user123"
 *                 primaryStrategy: "momentum_trading"
 *                 configuration:
 *                   defaultBudget: 1000
 *                   frequency: "daily"
 *                   riskTolerance: "aggressive"
 *                   preferredTokens: ["SEI", "BTC", "ETH"]
 *                   maxPositionSize: 2000
 *                   stopLossPercentage: 5
 *                   takeProfitPercentage: 15
 *     responses:
 *       201:
 *         description: Agent created successfully
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
 *                     agent:
 *                       $ref: '#/components/schemas/Agent'
 *                     message:
 *                       type: string
 *                       example: "DCA agent \"My DCA Bot\" created successfully"
 *       400:
 *         description: Validation error or agent name already exists
 *       500:
 *         description: Server error
 */
router.post('/', [
  body('name').notEmpty().trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be 1-100 characters'),
  body('userId').notEmpty().withMessage('User ID is required'),
  body('primaryStrategy').isIn(['DCA', 'momentum_trading', 'swing_trading', 'hodl', 'arbitrage', 'custom']).withMessage('Invalid strategy'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('configuration.defaultBudget').optional().isNumeric().withMessage('Default budget must be a number'),
  body('configuration.frequency').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid frequency'),
  body('configuration.riskTolerance').optional().isIn(['conservative', 'moderate', 'aggressive']).withMessage('Invalid risk tolerance'),
  body('configuration.preferredTokens').optional().isArray().withMessage('Preferred tokens must be an array')
], createAgent);

/**
 * @swagger
 * /api/agents/user/{userId}:
 *   get:
 *     summary: Get all agents for a user
 *     tags: [Agents]
 *     description: Retrieve all agents belonging to a specific user with memory statistics
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "user123"
 *       - in: query
 *         name: strategy
 *         schema:
 *           type: string
 *           enum: [DCA, momentum_trading, swing_trading, hodl, arbitrage, custom]
 *         description: Filter by strategy type
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *         example: true
 *     responses:
 *       200:
 *         description: User agents retrieved successfully
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
 *                     agents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AgentWithStats'
 *                     count:
 *                       type: number
 *                       example: 3
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', [
  param('userId').notEmpty().withMessage('User ID is required')
], getUserAgents);

/**
 * @swagger
 * /api/agents/{id}:
 *   get:
 *     summary: Get agent by ID
 *     tags: [Agents]
 *     description: Retrieve a specific agent with detailed statistics
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *         example: "60d5ecb54b5d4c001f3a8b25"
 *     responses:
 *       200:
 *         description: Agent retrieved successfully
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
 *                     agent:
 *                       $ref: '#/components/schemas/Agent'
 *                     memoryStats:
 *                       $ref: '#/components/schemas/AgentMemoryStats'
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Server error
 */
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid agent ID')
], getAgentById);

/**
 * @swagger
 * /api/agents/{id}:
 *   put:
 *     summary: Update agent
 *     tags: [Agents]
 *     description: Update an existing agent's configuration and settings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *         example: "60d5ecb54b5d4c001f3a8b25"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated DCA Bot"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               configuration:
 *                 $ref: '#/components/schemas/AgentConfiguration'
 *     responses:
 *       200:
 *         description: Agent updated successfully
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
 *                     agent:
 *                       $ref: '#/components/schemas/Agent'
 *                     message:
 *                       type: string
 *                       example: "Agent updated successfully"
 *       400:
 *         description: Validation error
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Server error
 */
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid agent ID'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
], updateAgent);

/**
 * @swagger
 * /api/agents/{id}:
 *   delete:
 *     summary: Delete agent
 *     tags: [Agents]
 *     description: Soft delete an agent (sets isActive to false)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *         example: "60d5ecb54b5d4c001f3a8b25"
 *     responses:
 *       200:
 *         description: Agent deleted successfully
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
 *                       example: "Agent \"My DCA Bot\" deleted successfully"
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid agent ID')
], deleteAgent);

/**
 * @swagger
 * /api/agents/{id}/memory:
 *   get:
 *     summary: Get agent memory history
 *     tags: [Agents]
 *     description: Retrieve conversation memory history for a specific agent
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *         example: "60d5ecb54b5d4c001f3a8b25"
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: Filter by session ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of memories to return
 *         example: 10
 *     responses:
 *       200:
 *         description: Agent memory retrieved successfully
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
 *                     agentId:
 *                       type: string
 *                       example: "60d5ecb54b5d4c001f3a8b25"
 *                     agentName:
 *                       type: string
 *                       example: "My DCA Bot"
 *                     memories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           userIntent:
 *                             type: string
 *                           strategyType:
 *                             type: string
 *                           budget:
 *                             type: number
 *                           actions:
 *                             type: string
 *                           summary:
 *                             type: string
 *                           outcome:
 *                             type: string
 *                     count:
 *                       type: number
 *                       example: 5
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Server error
 */
router.get('/:id/memory', [
  param('id').isMongoId().withMessage('Invalid agent ID'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], getAgentMemory);

module.exports = router; 