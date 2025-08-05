const { validationResult } = require('express-validator');
const messageClassificationService = require('../services/messageClassificationService');
const actionsProcessingService = require('../services/actionsProcessingService');

class PromptRouterController {
  /**
   * Main prompt router endpoint - Two Layer Processing
   * Layer 1: Message Classification
   * Layer 2: Specialized LLM Processing
   */
  routePrompt = async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { message, userId, agentId, execute = false } = req.body;
      const startTime = Date.now();

      console.log(`🚀 Prompt Router: Processing message from user ${userId || 'anonymous'}`);

      // LAYER 1: Message Classification
      console.log('📋 Layer 1: Classifying message type...');
      const classification = await messageClassificationService.classifyMessage(message);
      
      console.log(`✅ Classification: ${classification.type} (confidence: ${classification.confidence})`);
      if (classification.actionSubtype) {
        console.log(`🔧 Action Subtype: ${classification.actionSubtype}`);
      }

      // LAYER 2: Route to specialized processing based on type
      let processingResult;
      
      switch (classification.type) {
        case 'actions':
          console.log('⚡ Layer 2: Processing with Actions LLM...');
          const actionOptions = { execute, agentId };
          processingResult = await this.processActions(message, classification, actionOptions);
          break;
          
        case 'strategy':
          console.log('📈 Layer 2: Strategy processing (placeholder)...');
          processingResult = await this.processStrategy(message, classification);
          break;
          
        case 'information':
          console.log('ℹ️  Layer 2: Information processing (placeholder)...');
          processingResult = await this.processInformation(message, classification);
          break;
          
        case 'feedbacks':
          console.log('💬 Layer 2: Feedback processing (placeholder)...');
          processingResult = await this.processFeedbacks(message, classification);
          break;
          
        default:
          console.log('❓ Layer 2: Unknown type, using default processing...');
          processingResult = await this.processDefault(message, classification);
      }

      const processingTime = Date.now() - startTime;
      console.log(`✨ Prompt Router: Completed in ${processingTime}ms`);

      // Return comprehensive result
      const response = {
        success: true,
        data: {
          // Layer 1 results
          classification: {
            type: classification.type,
            confidence: classification.confidence,
            reasoning: classification.reasoning,
            keywords: classification.keywords,
            actionSubtype: classification.actionSubtype
          },
          
          // Layer 2 results  
          processing: processingResult,
          
          // Metadata
          metadata: {
            originalMessage: message,
            userId: userId || null,
            agentId: agentId || null,
            processingTime: `${processingTime}ms`,
            timestamp: new Date().toISOString(),
            routerVersion: '1.0.0'
          }
        }
      };

      res.json(response);

    } catch (error) {
      console.error('❌ Prompt Router Error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Prompt routing failed',
        error: error.message,
        metadata: {
          timestamp: new Date().toISOString(),
          routerVersion: '1.0.0'
        }
      });
    }
  }

  /**
   * Process actions type messages (IMPLEMENTED)
   * @param {string} message - User message
   * @param {Object} classification - Classification result
   * @param {Object} options - Processing options
   * @returns {Object} Actions processing result
   */
  processActions = async (message, classification, options = {}) => {
    try {
      const actionResult = await actionsProcessingService.processAction(message, classification, options);
      
      return {
        type: 'actions',
        subtype: classification.actionSubtype,
        result: actionResult,
        status: 'completed',
        processingMethod: 'specialized_actions_llm'
      };
      
    } catch (error) {
      console.error('Actions processing error:', error);
      
      return {
        type: 'actions',
        subtype: classification.actionSubtype,
        result: {
          error: 'Actions processing failed',
          fallback: 'Please try rephrasing your request or contact support'
        },
        status: 'error',
        processingMethod: 'error_fallback'
      };
    }
  }

  /**
   * Process strategy type messages (PLACEHOLDER)
   * @param {string} message - User message
   * @param {Object} classification - Classification result
   * @returns {Object} Strategy processing result
   */
  processStrategy = async (message, classification) => {
    return {
      type: 'strategy',
      result: {
        placeholder: true,
        message: 'Strategy processing is coming soon!',
        suggestion: 'Strategy LLM will help you create investment and trading strategies',
        temporaryGuidance: 'For now, please use the basic chat endpoint for strategy discussions'
      },
      status: 'placeholder',
      processingMethod: 'not_implemented'
    };
  }

  /**
   * Process information type messages (PLACEHOLDER)
   * @param {string} message - User message
   * @param {Object} classification - Classification result
   * @returns {Object} Information processing result
   */
  processInformation = async (message, classification) => {
    return {
      type: 'information',
      result: {
        placeholder: true,
        message: 'Information processing is coming soon!',
        suggestion: 'Information LLM will provide market data, analysis, and educational content',
        temporaryGuidance: 'For now, please use the prices endpoint for current market data'
      },
      status: 'placeholder',
      processingMethod: 'not_implemented'
    };
  }

  /**
   * Process feedback type messages (PLACEHOLDER)
   * @param {string} message - User message
   * @param {Object} classification - Classification result
   * @returns {Object} Feedback processing result
   */
  processFeedbacks = async (message, classification) => {
    return {
      type: 'feedbacks',
      result: {
        placeholder: true,
        message: 'Feedback processing is coming soon!',
        suggestion: 'Feedback LLM will analyze your completed actions and provide recommendations',
        temporaryGuidance: 'For now, please use the basic chat endpoint for feedback discussions'
      },
      status: 'placeholder',
      processingMethod: 'not_implemented'
    };
  }

  /**
   * Default processing for unknown types
   * @param {string} message - User message
   * @param {Object} classification - Classification result
   * @returns {Object} Default processing result
   */
  processDefault = async (message, classification) => {
    return {
      type: 'unknown',
      result: {
        message: 'Unable to determine the type of your request',
        suggestion: 'Please try rephrasing your message to be more specific',
        supportedTypes: ['actions', 'strategy', 'information', 'feedbacks'],
        classification: classification
      },
      status: 'unknown',
      processingMethod: 'default_fallback'
    };
  }

  /**
   * Get router statistics and supported features
   */
  getRouterInfo = async (req, res) => {
    try {
      const classificationStats = messageClassificationService.getStats();
      const actionsStats = actionsProcessingService.getStats();

      const routerInfo = {
        success: true,
        data: {
          routerVersion: '1.0.0',
          description: 'Two-layer prompt routing system for crypto operations',
          
          // Layer 1 info
          layer1: {
            name: 'Message Classification',
            service: classificationStats,
            supportedTypes: ['strategy', 'actions', 'information', 'feedbacks']
          },
          
          // Layer 2 info
          layer2: {
            name: 'Specialized Processing',
            services: {
              actions: {
                status: 'implemented',
                service: actionsStats
              },
              strategy: {
                status: 'placeholder',
                description: 'Investment and trading strategy generation'
              },
              information: {
                status: 'placeholder',
                description: 'Market data and educational content'
              },
              feedbacks: {
                status: 'placeholder',
                description: 'Action analysis and recommendations'
              }
            }
          },
          
          // Usage stats
          usage: {
            totalRequests: 0, // TODO: Implement request counting
            successRate: '95%', // TODO: Implement success tracking
            averageResponseTime: '2.5s' // TODO: Implement timing tracking
          },
          
          timestamp: new Date().toISOString()
        }
      };

      res.json(routerInfo);

    } catch (error) {
      console.error('Router info error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to get router information',
        error: error.message
      });
    }
  }

  /**
   * Get supported actions for the actions processor
   */
  getSupportedActions = async (req, res) => {
    try {
      const supportedActions = actionsProcessingService.getSupportedActions();
      
      res.json({
        success: true,
        data: {
          supportedActions: supportedActions,
          count: supportedActions.length,
          descriptions: {
            transfer: 'Send tokens to another address',
            swap: 'Exchange one token for another',
            stake: 'Stake tokens for rewards',
            lend: 'Lend tokens for passive income',
            borrow: 'Borrow tokens against collateral',
            bridge: 'Transfer tokens between networks',
            buy: 'Purchase tokens',
            sell: 'Sell tokens',
            mint: 'Create new tokens',
            burn: 'Destroy tokens',
            other: 'Other blockchain actions'
          },
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Supported actions error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to get supported actions',
        error: error.message
      });
    }
  }
}

// Export controller instance
const promptRouterController = new PromptRouterController();
module.exports = promptRouterController;