const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mareposa Backend API',
      version: '1.0.0',
      description: 'A comprehensive Node.js Express API with MongoDB, authentication, and AI-powered crypto DCA expert agent',
      contact: {
        name: 'API Support',
        email: 'support@mareposa.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.mareposa.com',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name',
              maxLength: 50
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              default: 'user',
              description: 'User role'
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Whether user is active'
            },
            avatar: {
              type: 'string',
              description: 'User avatar URL'
            }
          }
        },
        Product: {
          type: 'object',
          required: ['name', 'description', 'price', 'category', 'brand', 'countInStock', 'createdBy'],
          properties: {
            id: {
              type: 'string',
              description: 'Product ID'
            },
            name: {
              type: 'string',
              description: 'Product name',
              maxLength: 100
            },
            description: {
              type: 'string',
              description: 'Product description',
              maxLength: 500
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Product price'
            },
            category: {
              type: 'string',
              enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'other'],
              description: 'Product category'
            },
            brand: {
              type: 'string',
              description: 'Product brand'
            },
            countInStock: {
              type: 'number',
              minimum: 0,
              description: 'Stock count'
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
              default: 0,
              description: 'Product rating'
            },
            numReviews: {
              type: 'number',
              default: 0,
              description: 'Number of reviews'
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Product images'
            },
            isFeatured: {
              type: 'boolean',
              default: false,
              description: 'Whether product is featured'
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Whether product is active'
            },
            createdBy: {
              type: 'string',
              description: 'User ID who created the product'
            }
          }
        },
        AIResponse: {
          type: 'object',
          properties: {
            analysis: {
              type: 'string',
              description: 'AI analysis of the user situation'
            },
            strategy: {
              type: 'string',
              description: 'Recommended DCA strategy'
            },
            actionPlan: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  step: {
                    type: 'number',
                    description: 'Step number'
                  },
                  action: {
                    type: 'string',
                    description: 'Action description'
                  },
                  priority: {
                    type: 'string',
                    enum: ['high', 'medium', 'low'],
                    description: 'Action priority'
                  },
                                       timeframe: {
                       type: 'string',
                       enum: ['immediate', 'short-term', 'long-term'],
                       description: 'Action timeframe'
                     },
                     ref: {
                       type: 'string',
                       description: 'Unique reference ID for bot execution'
                     },
                     dexAction: {
                       type: 'string',
                       enum: ['swap', 'add_liquidity', 'remove_liquidity', 'stake', 'setup'],
                       description: 'DEX action type'
                     },
                     tokenPair: {
                       type: 'string',
                       description: 'Token pair for the action'
                     },
                     amount: {
                       type: 'string',
                       description: 'Amount or percentage for the action'
                     },
                     network: {
                       type: 'string',
                       description: 'Blockchain network',
                       example: 'sei'
                     }
                }
              }
            },
            riskAssessment: {
              type: 'string',
              description: 'Risk analysis'
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of recommendations'
            },
            marketInsights: {
              type: 'string',
              description: 'Current market insights'
            },
            nextSteps: {
              type: 'string',
              description: 'What the user should do next'
            }
          }
        },
        CryptoPrice: {
          type: 'object',
          properties: {
            price: {
              type: 'number',
              description: 'Current price'
            },
            change24h: {
              type: 'number',
              description: '24-hour price change percentage'
            },
            marketCap: {
              type: 'number',
              description: 'Market capitalization'
            },
            network: {
              type: 'string',
              description: 'Blockchain network',
              example: 'sei'
            },
            type: {
              type: 'string',
              enum: ['native', 'wrapped', 'stablecoin'],
              description: 'Token type'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: {
                    type: 'string',
                    description: 'Error message'
                  },
                  param: {
                    type: 'string',
                    description: 'Parameter that caused the error'
                  }
                }
              }
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js', './index.js'], // Path to the API files
};

const specs = swaggerJSDoc(options);

module.exports = specs; 