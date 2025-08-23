const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const promptRouterController = require('../controllers/promptRouterController');

// The controller is already an instance, no need to instantiate
const controller = promptRouterController;

/**
 * Enhanced message processing with intent validation
 * POST /api/enhanced-intent/process
 */
router.post('/process', [
  body('message')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('userId')
    .optional()
    .isString()
    .withMessage('User ID must be a string'),
  body('sessionId')
    .optional()
    .isString()
    .withMessage('Session ID must be a string')
], controller.processMessageWithValidation);

/**
 * Process interactive response from user
 * POST /api/enhanced-intent/interactive-response
 */
router.post('/interactive-response', [
  body('originalIntent')
    .exists()
    .withMessage('Original intent is required'),
  body('userResponses')
    .isObject()
    .withMessage('User responses must be an object'),
  body('userId')
    .optional()
    .isString()
    .withMessage('User ID must be a string')
], controller.processInteractiveResponse);

/**
 * Get contacts and tokens data
 * GET /api/enhanced-intent/contacts-tokens
 */
router.get('/contacts-tokens', controller.getContactsAndTokens);

/**
 * Get supported actions and their required arguments
 * GET /api/enhanced-intent/supported-actions
 */
router.get('/supported-actions', (req, res) => {
  try {
    const supportedActions = {
      transfer: {
        name: 'Transfer Tokens',
        description: 'Send SEI or tokens to another account on SEI Network',
        requiredArgs: ['recipient', 'amount'],
        optionalArgs: ['tokenAddress'],
        examples: [
          'Send 100 SEI to 0x1234...5678',
          'Transfer 50 USDC to Alice',
          'Send 1000 DRAGONX to sei1abc...xyz'
        ]
      },
      swap: {
        name: 'Swap Tokens',
        description: 'Exchange one token for another using DragonSwap or SeiSwap',
        requiredArgs: ['fromToken', 'toToken', 'amount'],
        optionalArgs: ['swapType', 'slippage', 'dex'],
        examples: [
          'Swap 100 SEI for USDC on DragonSwap',
          'Exchange my WBTC for USDT on SeiSwap',
          'Convert 1000 USDC to SEI with 1% slippage'
        ]
      },
      createAgent: {
        name: 'Create AI Agent',
        description: 'Create a new AI trading agent for SEI ecosystem',
        requiredArgs: ['name', 'description'],
        optionalArgs: ['strategy', 'parameters'],
        examples: [
          'Create a DCA agent for SEI tokens',
          'Make an agent called "SEI Arbitrage Bot"',
          'Create agent for DragonSwap liquidity management'
        ]
      },
      stake: {
        name: 'Stake SEI',
        description: 'Stake SEI tokens for rewards with validators',
        requiredArgs: ['amount'],
        optionalArgs: ['validator'],
        examples: [
          'Stake 1000 SEI',
          'Delegate to validator seivalidator1...',
          'Stake SEI with highest APY validator'
        ]
      },
      addLiquidity: {
        name: 'Add Liquidity',
        description: 'Add liquidity to SEI DEX pools',
        requiredArgs: ['tokenA', 'tokenB', 'amountA'],
        optionalArgs: ['amountB', 'slippage', 'dex'],
        examples: [
          'Add liquidity to SEI/USDC pool',
          'Provide liquidity for WBTC/ETH on DragonSwap',
          'Add 100 SEI and equivalent USDT to pool'
        ]
      },
      removeLiquidity: {
        name: 'Remove Liquidity',
        description: 'Remove liquidity from SEI DEX pools',
        requiredArgs: ['poolAddress', 'percentage'],
        optionalArgs: ['minAmountA', 'minAmountB'],
        examples: [
          'Remove 50% liquidity from SEI/USDC pool',
          'Withdraw all liquidity from WBTC/ETH pool',
          'Remove liquidity from pool 0x123...abc'
        ]
      },
      bridge: {
        name: 'Bridge Assets',
        description: 'Bridge tokens between SEI and other networks',
        requiredArgs: ['amount', 'tokenAddress', 'destinationChain'],
        optionalArgs: ['destinationAddress'],
        examples: [
          'Bridge 100 USDC from SEI to Ethereum',
          'Transfer WBTC from Arbitrum to SEI',
          'Bridge SEI to Polygon network'
        ]
      }
    };

    res.json({
      success: true,
      data: supportedActions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Health check for enhanced intent service
 * GET /api/enhanced-intent/health
 */
router.get('/health', (req, res) => {
  try {
    res.json({
      success: true,
      status: 'healthy',
      service: 'Enhanced Intent Service',
      version: '1.0.0',
      features: [
        'SEI ecosystem intent classification',
        'Argument validation for SEI transactions',
        'Contact resolution on SEI network',
        'SEI token lookup and validation',
        'Interactive components for DeFi operations'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
