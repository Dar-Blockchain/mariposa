const { validationResult } = require('express-validator');
const Agent = require('../models/Agent');
const Memory = require('../models/Memory');

// @desc    Create a new agent
// @route   POST /api/agents
// @access  Public (should be protected in production)
const createAgent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      userId,
      primaryStrategy,
      configuration
    } = req.body;

    // Check if agent name already exists for this user
    const existingAgent = await Agent.findOne({ name, userId, isActive: true });
    if (existingAgent) {
      return res.status(400).json({
        success: false,
        message: 'Agent with this name already exists'
      });
    }

    const agent = new Agent({
      name,
      description,
      userId,
      primaryStrategy,
      configuration: {
        ...configuration,
        // Set defaults if not provided
        defaultBudget: configuration?.defaultBudget || 500,
        frequency: configuration?.frequency || 'monthly',
        riskTolerance: configuration?.riskTolerance || 'moderate',
        preferredTokens: configuration?.preferredTokens || ['BTC', 'ETH', 'SEI'],
        maxPositionSize: configuration?.maxPositionSize || 1000,
        stopLossPercentage: configuration?.stopLossPercentage || 10,
        takeProfitPercentage: configuration?.takeProfitPercentage || 20
      }
    });

    const savedAgent = await agent.save();

    res.status(201).json({
      success: true,
      data: {
        agent: savedAgent,
        message: `${primaryStrategy} agent "${name}" created successfully`
      }
    });

  } catch (error) {
    console.error('Agent Creation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create agent',
      error: error.message
    });
  }
};

// @desc    Get all agents for a user
// @route   GET /api/agents/user/:userId
// @access  Public (should be protected in production)
const getUserAgents = async (req, res) => {
  try {
    const { userId } = req.params;
    const { strategy, active } = req.query;

    let filter = { userId };
    if (strategy) filter.primaryStrategy = strategy;
    if (active !== undefined) filter.isActive = active === 'true';

    const agents = await Agent.find(filter)
      .sort({ lastInteraction: -1 })
      .select('-__v');

    // Get memory statistics for each agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const memoryStats = await Memory.getAgentMemoryStats(agent._id);
        return {
          ...agent.toObject(),
          memoryStats
        };
      })
    );

    res.json({
      success: true,
      data: {
        agents: agentsWithStats,
        count: agentsWithStats.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get User Agents Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve agents',
      error: error.message
    });
  }
};

// @desc    Get agent by ID
// @route   GET /api/agents/:id
// @access  Public (should be protected in production)
const getAgentById = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Get agent statistics
    const memoryStats = await Memory.getAgentMemoryStats(agent._id);

    res.json({
      success: true,
      data: {
        agent: agent.toObject(),
        memoryStats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get Agent Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve agent',
      error: error.message
    });
  }
};

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Public (should be protected in production)
const updateAgent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Check if name already exists for this user (if name is being updated)
    if (updateData.name && updateData.name !== agent.name) {
      const existingAgent = await Agent.findOne({ 
        name: updateData.name, 
        userId: agent.userId, 
        isActive: true,
        _id: { $ne: id }
      });
      if (existingAgent) {
        return res.status(400).json({
          success: false,
          message: 'Agent with this name already exists'
        });
      }
    }

    // Update agent
    Object.assign(agent, updateData);
    agent.updatedAt = new Date();

    const updatedAgent = await agent.save();

    res.json({
      success: true,
      data: {
        agent: updatedAgent,
        message: 'Agent updated successfully'
      }
    });

  } catch (error) {
    console.error('Update Agent Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update agent',
      error: error.message
    });
  }
};

// @desc    Delete agent (soft delete)
// @route   DELETE /api/agents/:id
// @access  Public (should be protected in production)
const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Soft delete - set isActive to false
    agent.isActive = false;
    agent.updatedAt = new Date();
    await agent.save();

    res.json({
      success: true,
      data: {
        message: `Agent "${agent.name}" deleted successfully`
      }
    });

  } catch (error) {
    console.error('Delete Agent Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete agent',
      error: error.message
    });
  }
};

// @desc    Get agent memory history
// @route   GET /api/agents/:id/memory
// @access  Public (should be protected in production)
const getAgentMemory = async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionId, limit = 10 } = req.query;

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    let memories;
    if (sessionId) {
      memories = await Memory.getRecentMemories(id, sessionId, parseInt(limit));
    } else {
      // Get all recent memories for this agent across sessions
      memories = await Memory.find({ agentId: id })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate('agentId', 'name primaryStrategy');
    }

    res.json({
      success: true,
      data: {
        agentId: id,
        agentName: agent.name,
        memories,
        count: memories.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get Agent Memory Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve agent memory',
      error: error.message
    });
  }
};

// @desc    Get available agent strategies
// @route   GET /api/agents/strategies
// @access  Public
const getAgentStrategies = async (req, res) => {
  try {
    const strategies = [
      {
        name: 'DCA',
        description: 'Dollar Cost Averaging - Systematic investment approach with fixed amounts at regular intervals',
        focus: 'Long-term accumulation, reduced timing risk',
        riskLevel: 'Low to Moderate',
        timeframe: 'Long-term (months/years)',
        bestFor: 'Conservative investors, beginners, steady accumulation'
      },
      {
        name: 'momentum_trading',
        description: 'Momentum Trading - Capitalize on strong price movements and trends',
        focus: 'Technical analysis, trend following',
        riskLevel: 'High',
        timeframe: 'Short to Medium-term (days/weeks)',
        bestFor: 'Experienced traders, high risk tolerance'
      },
      {
        name: 'swing_trading',
        description: 'Swing Trading - Capture price swings over days to weeks',
        focus: 'Support/resistance levels, technical patterns',
        riskLevel: 'Moderate to High',
        timeframe: 'Medium-term (3-30 days)',
        bestFor: 'Active traders, balanced risk/reward'
      },
      {
        name: 'hodl',
        description: 'HODL - Long-term holding regardless of market volatility',
        focus: 'Fundamental value, diamond hands mentality',
        riskLevel: 'Low to Moderate',
        timeframe: 'Very Long-term (years)',
        bestFor: 'True believers, passive investors'
      },
      {
        name: 'arbitrage',
        description: 'Arbitrage Trading - Profit from price differences across DEX platforms',
        focus: 'Speed, precision, price discrepancies',
        riskLevel: 'Low to Moderate',
        timeframe: 'Very Short-term (minutes/hours)',
        bestFor: 'Technical experts, high-frequency traders'
      },
      {
        name: 'custom',
        description: 'Custom Strategy - User-defined trading approach with custom instructions',
        focus: 'User-specific requirements and preferences',
        riskLevel: 'Variable',
        timeframe: 'Variable',
        bestFor: 'Advanced users with specific strategies'
      }
    ];

    res.json({
      success: true,
      data: {
        strategies,
        count: strategies.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get Strategies Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve strategies',
      error: error.message
    });
  }
};

module.exports = {
  createAgent,
  getUserAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  getAgentMemory,
  getAgentStrategies
}; 