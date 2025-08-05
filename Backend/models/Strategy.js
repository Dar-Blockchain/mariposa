const mongoose = require('mongoose');

const strategySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    index: true
  },
  agentName: {
    type: String,
    required: true
  },
  agentUuid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  primaryStrategy: {
    type: String,
    enum: ['DCA', 'momentum_trading', 'swing_trading', 'hodl', 'arbitrage', 'scalping', 'memecoin', 'yield_farming', 'spot_trading', 'futures_trading', 'custom'],
    required: true
  },
  riskTolerance: {
    type: String,
    enum: ['conservative', 'moderate', 'aggressive'],
    required: true
  },
  defaultBudget: {
    type: Number,
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  portfolioAllocation: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  maxPositionSize: {
    type: Number,
    required: true
  },
  stopLossPercentage: {
    type: Number,
    required: true
  },
  takeProfitPercentage: {
    type: Number,
    required: true
  },
  customPrompt: {
    type: String,
    required: true
  },
  extractedIntent: {
    type: String
  },
  portfolioManagementPlan: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  marketInsights: {
    type: String
  },
  riskAssessment: {
    type: String
  },
  strategyAdvantages: {
    type: String
  },
  potentialDrawbacks: {
    type: String
  },
  successMetrics: {
    type: String
  },
  status: {
    type: String,
    enum: ['generated', 'applied', 'modified', 'archived'],
    default: 'generated'
  },
  originalUserMessage: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  parentStrategyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Strategy',
    index: true
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

// Update the updatedAt field on save
strategySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get strategies by user
strategySchema.statics.getByUser = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('agentId', 'name isApproved canBeginWork');
};

// Static method to get strategies by agent
strategySchema.statics.getByAgent = function(agentId) {
  return this.find({ agentId })
    .sort({ version: -1 });
};

// Method to create new version
strategySchema.methods.createNewVersion = function(newStrategyData) {
  const newStrategy = new this.constructor({
    ...newStrategyData,
    userId: this.userId,
    agentId: this.agentId,
    version: this.version + 1,
    parentStrategyId: this._id,
    status: 'modified'
  });
  
  // Mark current strategy as archived
  this.status = 'archived';
  
  return newStrategy;
};

// Method to apply strategy to agent
strategySchema.methods.markAsApplied = function() {
  this.status = 'applied';
  this.markModified('status');
};

module.exports = mongoose.model('Strategy', strategySchema); 