const Together = require('together-ai').default;
const ethers = require('ethers');
const mongoose = require('mongoose');
const Agent = require('../models/Agent');
const Wallet = require('../models/Wallet');
const ContactsService = require('./contactsService');
const QRCodeService = require('./qrCodeService');

// Initialize Together AI for argument validation
let together;
try {
  together = new Together({
    apiKey: process.env.TOGETHER_API_KEY || 'dummy-key'
  });
} catch (error) {
  console.warn('Together AI not initialized for enhanced transfer service.');
  together = null;
}

class EnhancedTransferService {
  constructor() {
    this.contactsService = new ContactsService();
    this.qrCodeService = new QRCodeService();
    
    // Ethers v5 provider initialization
    this.provider = new ethers.providers.JsonRpcProvider(process.env.SEI_RPC_URL || 'https://evm-rpc.sei-apis.com');
  }

  /**
   * Process transfer with already resolved arguments (for interactive responses)
   * @param {Object} args - Resolved transfer arguments {amount, token, recipient}
   * @param {string} userId - User ID
   * @returns {Object} Enhanced transfer processing result
   */
  async processTransferWithArgs(args, userId) {
    try {
      console.log('🚀 Enhanced Transfer Processing with Direct Args');
      console.log('📝 Args:', args);
      console.log('👤 User ID:', userId);

      // Step 1: Validate arguments are complete
      if (!args.amount || !args.token || !args.recipient) {
        return {
          success: false,
          status: 'missing_arguments',
          error: 'Amount, token, and recipient are required',
          missing: Object.keys(args).filter(key => !args[key])
        };
      }

      // Step 2: Resolve recipient
      const recipientResolution = await this.resolveRecipient(args.recipient, userId);
      
      if (!recipientResolution.success) {
        return {
          success: false,
          status: 'recipient_not_found',
          recipientQuery: args.recipient,
          error: recipientResolution.reason || 'Recipient could not be resolved',
          suggestedContacts: recipientResolution.suggestions || []
        };
      }

      console.log('✅ Recipient resolved:', recipientResolution.resolvedAddress);

      // Step 3: Check wallet balance
      const walletCheck = await this.checkWalletBalance(userId, args.token, args.amount);
      
      if (!walletCheck.success) {
        if (walletCheck.reason === 'insufficient_funds') {
          // Generate QR code for funding
          const fundingInfo = await this.generateFundingInstructions(userId, args.token, args.amount, walletCheck.currentBalance);
          
          return {
            success: false,
            status: 'insufficient_funds',
            currentBalance: walletCheck.currentBalance,
            requiredAmount: args.amount,
            shortfall: args.amount - walletCheck.currentBalance,
            walletAddress: fundingInfo.walletAddress,
            agentId: fundingInfo.agentId,
            fundingInstructions: fundingInfo,
            requiresFunding: true
          };
        } else {
          return {
            success: false,
            status: 'wallet_error',
            error: walletCheck.error
          };
        }
      }

      // Step 4: Execute transfer (if we reach here, everything is ready)
      console.log('✅ All checks passed, executing transfer...');
      
      const executionResult = await this.executeTransfer({
        fromUserId: userId,
        toAddress: recipientResolution.resolvedAddress,
        amount: args.amount,
        token: args.token,
        recipientName: recipientResolution.contactName
      });

      return executionResult;

    } catch (error) {
      console.error('❌ Enhanced Transfer with Args failed:', error);
      return {
        success: false,
        status: 'processing_error',
        error: error.message
      };
    }
  }

  /**
   * Process transfer request with enhanced argument validation
   * @param {string} message - User's transfer message
   * @param {string} userId - User ID
   * @param {string} agentId - Agent ID (optional)
   * @returns {Object} Enhanced transfer processing result
   */
  async processTransferRequest(message, userId, agentId = null) {
    try {
      console.log('🚀 Enhanced Transfer Processing Started');
      console.log('📝 Message:', message);
      console.log('👤 User ID:', userId);

      // Step 1: Extract and validate arguments using LLM
      const argumentAnalysis = await this.analyzeTransferArguments(message);
      
      // Step 2: Check for missing arguments
      const missingArgs = this.identifyMissingArguments(argumentAnalysis);
      
      if (missingArgs.length > 0) {
        return {
          success: false,
          status: 'missing_arguments',
          missingArguments: missingArgs,
          argumentAnalysis: argumentAnalysis,
          requiresUserInput: true,
          formSchema: this.generateFormSchema(missingArgs, argumentAnalysis)
        };
      }

      // Step 3: Resolve recipient through contacts
      const recipientResolution = await this.resolveRecipient(argumentAnalysis.recipient, userId);
      
      if (!recipientResolution.success) {
        return {
          success: false,
          status: 'recipient_not_found',
          recipientQuery: argumentAnalysis.recipient,
          suggestedContacts: recipientResolution.suggestions || [],
          requiresUserInput: true,
          formSchema: this.generateRecipientFormSchema(argumentAnalysis.recipient)
        };
      }

      // Step 4: Get user's wallet and check balance
      const walletCheck = await this.checkWalletBalance(userId, argumentAnalysis.token, argumentAnalysis.amount);
      
      if (!walletCheck.success) {
        if (walletCheck.reason === 'insufficient_funds') {
          // Generate QR code for funding
          const fundingInfo = await this.generateFundingInstructions(userId, argumentAnalysis.token, argumentAnalysis.amount, walletCheck.currentBalance);
          
          return {
            success: false,
            status: 'insufficient_funds',
            currentBalance: walletCheck.currentBalance,
            requiredAmount: argumentAnalysis.amount,
            shortfall: argumentAnalysis.amount - walletCheck.currentBalance,
            walletAddress: fundingInfo.walletAddress, // Agent's SEI wallet address
            agentId: fundingInfo.agentId,
            fundingInstructions: fundingInfo,
            requiresFunding: true
          };
        } else {
          return {
            success: false,
            status: 'wallet_error',
            error: walletCheck.error
          };
        }
      }

      // Step 5: Prepare transfer execution
      const transferPreparation = {
        success: true,
        status: 'ready_to_execute',
        transferDetails: {
          from: walletCheck.walletAddress,
          to: recipientResolution.resolvedAddress,
          amount: argumentAnalysis.amount,
          token: argumentAnalysis.token,
          recipient: {
            name: recipientResolution.contactName,
            address: recipientResolution.resolvedAddress,
            category: recipientResolution.category
          }
        },
        estimatedGas: await this.estimateGasFees(argumentAnalysis.token, argumentAnalysis.amount),
        confirmation: {
          message: `Transfer ${argumentAnalysis.amount} ${argumentAnalysis.token} to ${recipientResolution.contactName} (${recipientResolution.resolvedAddress.slice(0, 8)}...)?`,
          requiresConfirmation: true
        }
      };

      return transferPreparation;

    } catch (error) {
      console.error('❌ Enhanced transfer processing error:', error);
      return {
        success: false,
        status: 'processing_error',
        error: error.message
      };
    }
  }

  /**
   * Analyze transfer arguments using LLM
   * @param {string} message - Transfer message
   * @returns {Object} Analyzed arguments
   */
  async analyzeTransferArguments(message) {
    if (!together) {
      // Fallback to basic parsing
      return this.basicArgumentParsing(message);
    }

    try {
      const prompt = `You are a transfer argument analyzer. Extract and validate ALL required information from this transfer request.

User Message: "${message}"

Extract these arguments and identify what's missing:

REQUIRED ARGUMENTS:
1. amount: numeric value (e.g., 1, 0.5, 100)
2. token: token symbol (SEI, USDC, WETH, WBTC, etc.)
3. recipient: who to send to (name, address, or identifier)

OPTIONAL ARGUMENTS:
4. memo: transaction note/message
5. priority: urgency level

Analyze the message and respond with JSON:
{
  "amount": "extracted_amount_or_null",
  "token": "extracted_token_or_null", 
  "recipient": "extracted_recipient_or_null",
  "memo": "extracted_memo_or_null",
  "priority": "normal|high|low",
  "confidence": {
    "amount": 0.9,
    "token": 0.8,
    "recipient": 0.7
  },
  "analysis": {
    "originalMessage": "the_message",
    "extractedPhrases": ["transfer", "1 sei", "to my friend"],
    "ambiguities": ["recipient 'my friend' needs clarification"],
    "suggestions": ["Amount and token are clear, but recipient needs contact lookup"]
  }
}

IMPORTANT: Set fields to null if not found or unclear. Be conservative with confidence scores.`;

      const response = await together.chat.completions.create({
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        messages: [
          { role: 'system', content: 'You are a precise argument extraction expert. Extract transfer parameters accurately.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      // Validate and clean the analysis
      return this.validateAnalysis(analysis);

    } catch (error) {
      console.error('❌ LLM argument analysis failed:', error);
      return this.basicArgumentParsing(message);
    }
  }

  /**
   * Basic argument parsing fallback
   * @param {string} message - Transfer message
   * @returns {Object} Basic parsed arguments
   */
  basicArgumentParsing(message) {
    const patterns = {
      amount: /(\d+(?:\.\d+)?)/,
      token: /(SEI|USDC|WETH|WBTC|USDT|iSEI|USDa|syUSD)/i,
      transfer: /(?:transfer|send|pay)\s+(\d+(?:\.\d+)?)\s+(\w+)\s+to\s+(.+)/i
    };

    const transferMatch = message.match(patterns.transfer);
    
    if (transferMatch) {
      const [, amount, token, recipient] = transferMatch;
      return {
        amount: parseFloat(amount),
        token: token.toUpperCase(),
        recipient: recipient.trim(),
        memo: null,
        priority: 'normal',
        confidence: {
          amount: 0.8,
          token: 0.7,
          recipient: 0.6
        },
        analysis: {
          originalMessage: message,
          extractedPhrases: [transferMatch[0]],
          ambiguities: ['Basic parsing - may need verification'],
          suggestions: ['Verify all extracted parameters']
        }
      };
    }

    return {
      amount: null,
      token: null,
      recipient: null,
      memo: null,
      priority: 'normal',
      confidence: {
        amount: 0.0,
        token: 0.0,
        recipient: 0.0
      },
      analysis: {
        originalMessage: message,
        extractedPhrases: [],
        ambiguities: ['Could not parse transfer request'],
        suggestions: ['Please specify amount, token, and recipient clearly']
      }
    };
  }

  /**
   * Validate and clean analysis results
   * @param {Object} analysis - Raw analysis from LLM
   * @returns {Object} Validated analysis
   */
  validateAnalysis(analysis) {
    // Convert amount to number if it's a string
    if (analysis.amount && typeof analysis.amount === 'string') {
      const numAmount = parseFloat(analysis.amount);
      analysis.amount = isNaN(numAmount) ? null : numAmount;
    }

    // Normalize token symbol
    if (analysis.token) {
      analysis.token = analysis.token.toString().toUpperCase();
    }

    // Ensure confidence scores exist
    analysis.confidence = analysis.confidence || {
      amount: analysis.amount ? 0.5 : 0.0,
      token: analysis.token ? 0.5 : 0.0,
      recipient: analysis.recipient ? 0.5 : 0.0
    };

    return analysis;
  }

  /**
   * Identify missing arguments
   * @param {Object} analysis - Argument analysis
   * @returns {Array} Array of missing argument names
   */
  identifyMissingArguments(analysis) {
    const missing = [];
    
    if (!analysis.amount || analysis.amount <= 0) {
      missing.push('amount');
    }
    
    if (!analysis.token) {
      missing.push('token');
    }
    
    if (!analysis.recipient) {
      missing.push('recipient');
    }

    return missing;
  }

  /**
   * Generate form schema for missing arguments
   * @param {Array} missingArgs - Missing argument names
   * @param {Object} analysis - Current analysis
   * @returns {Object} Form schema for frontend
   */
  generateFormSchema(missingArgs, analysis) {
    const schema = {
      title: 'Complete Transfer Details',
      description: 'Please provide the missing information to complete your transfer request.',
      fields: []
    };

    if (missingArgs.includes('amount')) {
      schema.fields.push({
        name: 'amount',
        type: 'number',
        label: 'Amount',
        placeholder: 'Enter amount to transfer',
        required: true,
        min: 0.000001,
        step: 0.000001,
        validation: 'positive_number'
      });
    }

    if (missingArgs.includes('token')) {
      schema.fields.push({
        name: 'token',
        type: 'select',
        label: 'Token',
        placeholder: 'Select token to transfer',
        required: true,
        options: [
          { value: 'SEI', label: 'SEI - Native Token' },
          { value: 'USDC', label: 'USDC - USD Coin' },
          { value: 'WETH', label: 'WETH - Wrapped Ethereum' },
          { value: 'WBTC', label: 'WBTC - Wrapped Bitcoin' },
          { value: 'USDT', label: 'USDT - Tether USD' }
        ]
      });
    }

    if (missingArgs.includes('recipient')) {
      schema.fields.push({
        name: 'recipient',
        type: 'text',
        label: 'Recipient',
        placeholder: 'Enter recipient name or address',
        required: true,
        validation: 'recipient_format'
      });
    }

    // Add optional memo field
    schema.fields.push({
      name: 'memo',
      type: 'text',
      label: 'Memo (Optional)',
      placeholder: 'Add a note for this transfer',
      required: false,
      maxLength: 100
    });

    return schema;
  }

  /**
   * Generate recipient form schema when contact not found
   * @param {string} recipientQuery - Original recipient query
   * @returns {Object} Recipient form schema
   */
  generateRecipientFormSchema(recipientQuery) {
    return {
      title: 'Recipient Not Found',
      description: `Could not find contact "${recipientQuery}". Please provide recipient details.`,
      fields: [
        {
          name: 'recipientAddress',
          type: 'text',
          label: 'Wallet Address',
          placeholder: '0x...',
          required: true,
          validation: 'ethereum_address'
        },
        {
          name: 'recipientName',
          type: 'text',
          label: 'Contact Name',
          placeholder: 'Enter a name for this contact',
          required: true
        },
        {
          name: 'category',
          type: 'select',
          label: 'Contact Category',
          options: [
            { value: 'friend', label: 'Friend' },
            { value: 'family', label: 'Family' },
            { value: 'business', label: 'Business' },
            { value: 'other', label: 'Other' }
          ],
          required: true
        },
        {
          name: 'saveContact',
          type: 'checkbox',
          label: 'Save this contact for future transfers',
          defaultValue: true
        }
      ]
    };
  }

  /**
   * Resolve recipient through contacts service
   * @param {string} recipientQuery - Recipient identifier
   * @param {string} userId - User ID
   * @returns {Object} Resolution result
   */
  async resolveRecipient(recipientQuery, userId) {
    try {
      // Check if it's already a valid Ethereum address
      if (ethers.utils.isAddress(recipientQuery)) {
        return {
          success: true,
          resolvedAddress: recipientQuery,
          contactName: 'Unknown Contact',
          category: 'unknown',
          source: 'direct_address'
        };
      }

      // First check contacts.json file directly
      console.log('🔍 Searching for recipient in contacts.json:', recipientQuery);
      const jsonContact = await this.findContactInJsonFile(recipientQuery);
      
      if (jsonContact) {
        console.log('✅ Found contact in JSON file:', jsonContact.name);
        return {
          success: true,
          resolvedAddress: jsonContact.address,
          contactName: jsonContact.name,
          category: jsonContact.category || 'unknown',
          source: 'json_file'
        };
      }

      // Search contacts database (fallback)
      const contactSearch = await this.contactsService.findContact(recipientQuery, userId);
      
      if (contactSearch.success) {
        return {
          success: true,
          resolvedAddress: contactSearch.contact.walletAddress,
          contactName: contactSearch.contact.name,
          category: contactSearch.contact.category,
          source: 'contacts_database',
          contact: contactSearch.contact
        };
      }

      // No exact match found, get suggestions
      const suggestions = await this.contactsService.searchSimilarContacts(recipientQuery, userId);
      
      return {
        success: false,
        reason: 'recipient_not_found',
        suggestions: suggestions,
        recipientQuery: recipientQuery
      };

    } catch (error) {
      console.error('❌ Recipient resolution error:', error);
      return {
        success: false,
        reason: 'resolution_error',
        error: error.message
      };
    }
  }

  /**
   * Check wallet balance for transfer
   * @param {string} userId - User ID
   * @param {string} token - Token symbol
   * @param {number} amount - Amount to transfer
   * @returns {Object} Balance check result
   */
  async checkWalletBalance(userId, token, amount) {
    try {
      console.log(`🔍 Checking wallet balance for user: ${userId}`);
      
      // Handle both ObjectId and string userId formats
      let queryCondition;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        // userId is a valid ObjectId
        queryCondition = { userId: userId, isActive: true };
      } else {
        // userId is a string, try to find by agentUuid or create a mock agent for testing
        console.log(`⚠️ Non-ObjectId userId: ${userId}, searching by agentUuid or creating mock response`);
        queryCondition = { agentUuid: userId, isActive: true };
      }
      
      // Get user's agent (SEI agents store wallet info directly)
      const agent = await Agent.findOne(queryCondition);
      if (!agent) {
        console.log(`❌ No active agent found for user: ${userId}`);
        
        // For non-ObjectId userIds (like "user123"), create a mock success for testing
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          console.log('🎭 Creating mock wallet response for testing/demo purposes');
          return {
            success: false,
            reason: 'insufficient_funds',
            currentBalance: 0,
            requiredAmount: parseFloat(amount),
            mockResponse: true
          };
        }
        
        return {
          success: false,
          reason: 'no_agent',
          error: 'No active agent found for user'
        };
      }

      // Check if agent has SEI wallet address
      if (!agent.seiAddress) {
        console.log(`❌ Agent ${agent._id} has no SEI wallet address`);
        return {
          success: false,
          reason: 'no_wallet',
          error: 'Agent has no SEI wallet address'
        };
      }

      console.log(`✅ Found agent ${agent._id} with wallet: ${agent.seiAddress}`);
      
      // Create wallet-like object for compatibility
      const wallet = {
        walletAddress: agent.seiAddress,
        network: 'sei',
        isActive: true
      };

      // Get balance for the specific token
      const balance = await this.getTokenBalance(wallet.walletAddress, token);
      
      if (balance < amount) {
        return {
          success: false,
          reason: 'insufficient_funds',
          currentBalance: balance,
          requiredAmount: amount,
          shortfall: amount - balance,
          walletAddress: wallet.walletAddress
        };
      }

      return {
        success: true,
        currentBalance: balance,
        walletAddress: wallet.walletAddress,
        wallet: wallet
      };

    } catch (error) {
      console.error('❌ Balance check error:', error);
      return {
        success: false,
        reason: 'check_error',
        error: error.message
      };
    }
  }

  /**
   * Get token balance for address
   * @param {string} address - Wallet address
   * @param {string} token - Token symbol
   * @returns {number} Token balance
   */
  async getTokenBalance(address, token) {
    try {
      if (token === 'SEI') {
        // Get native SEI balance
        const balance = await this.provider.getBalance(address);
        return parseFloat(ethers.utils.formatEther(balance));
      } else {
        // For ERC-20 tokens, we would need the token contract address
        // This is a simplified implementation
        // In production, you'd have a token registry with contract addresses
        const tokenContracts = {
          'USDC': '0x3894085Ef7Ff0f0aeDf52E2A2704928d259f9a3A', // Example USDC on SEI
          'WETH': '0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7', // Example WETH on SEI
          // Add more token contracts as needed
        };

        if (!tokenContracts[token]) {
          throw new Error(`Token contract not found for ${token}`);
        }

        // Would implement ERC-20 balance check here
        // For now, return 0 as placeholder
        return 0;
      }
    } catch (error) {
      console.error(`❌ Error getting ${token} balance:`, error);
      return 0;
    }
  }

  /**
   * Generate funding instructions with QR code
   * @param {string} userId - User ID
   * @param {string} token - Token needed
   * @param {number} requiredAmount - Amount needed
   * @param {number} currentBalance - Current balance
   * @returns {Object} Funding instructions
   */
  async generateFundingInstructions(userId, token, requiredAmount, currentBalance) {
    try {
      const shortfall = requiredAmount - currentBalance;
      
      console.log(`🏦 Generating funding instructions for user: ${userId}`);
      console.log(`💰 Shortfall: ${shortfall} ${token}`);
      
      // Handle both ObjectId and string userId formats
      let queryCondition;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        queryCondition = { userId: userId, isActive: true };
      } else {
        queryCondition = { agentUuid: userId, isActive: true };
      }
      
      // Get user's agent with SEI wallet
      const agent = await Agent.findOne(queryCondition);
      if (!agent || !agent.seiAddress) {
        // For non-ObjectId userIds, return mock funding instructions
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';
          console.log(`🎭 Creating mock funding instructions for testing: ${mockAddress}`);
          
          return {
            status: 'funding_required',
            shortfall: shortfall,
            currentBalance: currentBalance,
            requiredAmount: requiredAmount,
            walletAddress: mockAddress,
            agentId: 'mock-agent-123',
            qrCode: null, // Skip QR generation for mock
            mockResponse: true,
            instructions: [
              `You need ${shortfall.toFixed(6)} more ${token} to complete this transfer`,
              `Send ${token} to your agent's SEI wallet: ${mockAddress}`,
              `Current balance: ${currentBalance.toFixed(6)} ${token}`,
              `Required amount: ${requiredAmount.toFixed(6)} ${token}`,
              `Note: This is a demo response - no actual wallet found`
            ]
          };
        }
        throw new Error('No agent wallet found for funding instructions');
      }
      
      console.log(`📱 Agent wallet address: ${agent.seiAddress}`);
      
      // Generate QR code for the SEI wallet address
      const qrCode = await this.qrCodeService.generateWalletQR(agent.seiAddress, token, shortfall);
      
      return {
        status: 'funding_required',
        shortfall: shortfall,
        currentBalance: currentBalance,
        requiredAmount: requiredAmount,
        walletAddress: agent.seiAddress,
        agentId: agent._id,
        qrCode: qrCode,
        instructions: [
          `You need ${shortfall.toFixed(6)} more ${token} to complete this transfer`,
          `Send ${token} to your agent's SEI wallet: ${agent.seiAddress}`,
          `Current balance: ${currentBalance.toFixed(6)} ${token}`,
          `Required amount: ${requiredAmount.toFixed(6)} ${token}`,
          'Scan the QR code below to send funds to your agent wallet'
        ],
        estimatedWaitTime: '1-5 minutes after sending',
        autoRefreshEnabled: true
      };
      
    } catch (error) {
      console.error('❌ Error generating funding instructions:', error);
      return {
        status: 'funding_error',
        error: error.message
      };
    }
  }

  /**
   * Estimate gas fees for transfer
   * @param {string} token - Token symbol
   * @param {number} amount - Transfer amount
   * @returns {Object} Gas estimation
   */
  async estimateGasFees(token, amount) {
    try {
      // Get current gas price
      const gasPrice = await this.provider.getGasPrice();
      
      // Estimate gas limit based on token type
      let gasLimit;
      if (token === 'SEI') {
        gasLimit = 21000; // Native transfer
      } else {
        gasLimit = 65000; // ERC-20 transfer
      }

      const estimatedFee = gasPrice * BigInt(gasLimit);
      
      return {
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
        gasLimit: gasLimit,
        estimatedFee: ethers.utils.formatEther(estimatedFee),
        estimatedFeeUSD: null // Would implement USD conversion
      };
      
    } catch (error) {
      console.error('❌ Gas estimation error:', error);
      return {
        gasPrice: '0',
        gasLimit: 0,
        estimatedFee: '0',
        error: 'Could not estimate gas fees'
      };
    }
  }

  /**
   * Execute the actual transfer
   * @param {Object} transferDetails - Transfer details
   * @param {string} userId - User ID
   * @returns {Object} Execution result
   */
  async executeTransfer(transferDetails, userId) {
    try {
      console.log('💸 Executing enhanced transfer...');
      
      // Get user's agent and wallet
      const agent = await Agent.findOne({ userId: userId, isActive: true });
      const wallet = await Wallet.findById(agent.walletId);
      
      // Decrypt private key (implement proper decryption)
      const privateKey = wallet.encryptedPrivateKey; // Would decrypt this
      const walletInstance = new ethers.Wallet(privateKey, this.provider);
      
      let txHash;
      
      if (transferDetails.token === 'SEI') {
        // Native SEI transfer
        const tx = await walletInstance.sendTransaction({
          to: transferDetails.to,
          value: ethers.utils.parseEther(transferDetails.amount.toString()),
          gasLimit: 21000
        });
        
        txHash = tx.hash;
        await tx.wait(); // Wait for confirmation
        
      } else {
        // ERC-20 token transfer (implement contract interaction)
        throw new Error('ERC-20 transfers not yet implemented');
      }
      
      return {
        success: true,
        transactionHash: txHash,
        transferDetails: transferDetails,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
    } catch (error) {
      console.error('❌ Transfer execution error:', error);
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  /**
   * Find contact in the contacts.json file
   * @param {string} query - Contact name or identifier to search for
   * @returns {Object|null} Contact object if found, null otherwise
   */
  async findContactInJsonFile(query) {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const contactsPath = path.join(__dirname, '../config/contacts.json');
      const contactsData = await fs.readFile(contactsPath, 'utf8');
      const contacts = JSON.parse(contactsData);
      
      // Search by key (case-insensitive)
      const queryLower = query.toLowerCase();
      
      // First try exact key match
      if (contacts.contacts[queryLower]) {
        return contacts.contacts[queryLower];
      }
      
      // Then try name match (case-insensitive)
      for (const [key, contact] of Object.entries(contacts.contacts)) {
        if (contact.name && contact.name.toLowerCase() === queryLower) {
          return contact;
        }
      }
      
      // Finally try partial match
      for (const [key, contact] of Object.entries(contacts.contacts)) {
        if (contact.name && contact.name.toLowerCase().includes(queryLower)) {
          return contact;
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Error reading contacts.json:', error);
      return null;
    }
  }
}

module.exports = EnhancedTransferService;
