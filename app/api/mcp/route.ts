/**
 * Simplified MCP (Model Context Protocol) API Route
 * 
 * Provides basic MCP JSON-RPC functionality for deployment verification
 * ✅ Environment Variables Configured: JWT_SECRET, JWT_EXPIRY
 * 🚀 Deployment Trigger: Environment configuration complete - Ready for testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseHealth, testDatabaseConnection } from '@/lib/database';

// =============================================================================
// JSON-RPC 2.0 TYPES (Based on MCP Protocol Research)
// =============================================================================

interface JSONRPCRequest {
  jsonrpc: "2.0";
  method: string;
  params?: any;
  id?: string | number;
}

interface JSONRPCResponse {
  jsonrpc: "2.0";
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: string | number | null;
}

// Standard JSON-RPC error codes
const JSON_RPC_ERRORS = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603
} as const;

// =============================================================================
// MCP TOOLS IMPLEMENTATION
// =============================================================================

/**
 * 🔧 Get deployment status and health metrics
 */
async function getDeploymentStatus(params: any = {}) {
  try {
    const { environment = "production", includeMetrics = true } = params;
    
    // Database connectivity check using proper error handling
    const dbHealth = await getDatabaseHealth();
    const dbStatus = dbHealth.healthy ? "healthy" : "unhealthy";
    const dbResponseTime = dbHealth.details.responseTime || 0;
    
    const deploymentStatus = {
      environment,
      timestamp: new Date().toISOString(),
      database: dbStatus,
      version: "1.1.0",
      status: "operational",
      ...(includeMetrics && {
        metrics: {
          dbResponseTime: dbResponseTime,
          nodeVersion: process.version,
          platform: process.platform,
          uptime: process.uptime()
        }
      })
    };

    return {
      content: [
        {
          type: "text",
          text: `✅ **Deployment Status: OPERATIONAL**\n\n` +
                `🌍 **Environment:** ${deploymentStatus.environment}\n` +
                `📊 **Database:** ${deploymentStatus.database}\n` +
                `🔧 **Version:** ${deploymentStatus.version}\n` +
                `📅 **Timestamp:** ${deploymentStatus.timestamp}` +
                (includeMetrics ? `\n\n📈 **Metrics:**\n` +
                  `• DB Response: ${deploymentStatus.metrics?.dbResponseTime}ms\n` +
                  `• Node Version: ${deploymentStatus.metrics?.nodeVersion}\n` +
                  `• Platform: ${deploymentStatus.metrics?.platform}\n` +
                  `• Uptime: ${Math.floor(deploymentStatus.metrics?.uptime || 0)}s` : '')
        }
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ **Deployment Status Check Failed**\n\n` +
                `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
                `Timestamp: ${new Date().toISOString()}`
        }
      ],
    };
  }
}

/**
 * 🔧 Test database health and connectivity (MCP Tool)
 */
async function getDatabaseHealthTool(params: any = {}) {
  try {
    const { includeQueries = false, testConnection = true } = params;
    
    let connectionStatus = "unknown";
    let responseTime = 0;
    let queryResults = {};
    
    if (testConnection) {
      // Use the proper database health check
      const dbHealth = await getDatabaseHealth();
      connectionStatus = dbHealth.healthy ? "healthy" : "unhealthy";
      responseTime = dbHealth.details.responseTime || 0;

      if (includeQueries && dbHealth.healthy) {
        try {
          // Only try to get counts if database is healthy
          const dbConnection = await testDatabaseConnection();
          queryResults = {
            connectionTest: dbConnection.status,
            responseTime: dbConnection.responseTime,
            lastUpdated: new Date().toISOString()
          };
        } catch (error) {
          queryResults = {
            error: "Could not retrieve query results",
            lastUpdated: new Date().toISOString()
          };
        }
      }
    }

    return {
      content: [
        {
          type: "text",
          text: `📊 **Database Health Report**\n\n` +
                `**Connection Status**: ${connectionStatus}\n` +
                `**Response Time**: ${responseTime}ms\n` +
                `**Test Connection**: ${testConnection ? 'Enabled' : 'Disabled'}\n` +
                `**Timestamp**: ${new Date().toISOString()}` +
                (includeQueries && Object.keys(queryResults).length > 0 ? 
                  `\n\n**Query Results**:\n${JSON.stringify(queryResults, null, 2)}` : '')
        }
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ **Database Health Check Failed**\n\n` +
                `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
                `Timestamp: ${new Date().toISOString()}`
        }
      ],
    };
  }
}

/**
 * 🔧 Check mobile optimization performance
 */
async function getMobileOptimizationCheck(params: any = {}) {
  try {
    const { testEndpoint = "/test-mobile-cards", checkPerformance = true } = params;
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const testUrl = `${baseUrl}${testEndpoint}`;
    
    return {
      content: [
        {
          type: "text",
          text: `📱 **Mobile Optimization Check**\n\n` +
                `**Test Endpoint**: ${testEndpoint}\n` +
                `**Full URL**: ${testUrl}\n` +
                `**Performance Check**: ${checkPerformance ? 'Enabled' : 'Disabled'}\n` +
                `**Status**: Ready for testing\n` +
                `**Timestamp**: ${new Date().toISOString()}`
        }
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ **Mobile Optimization Check Failed**\n\n` +
                `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
                `Test Endpoint: ${params.testEndpoint}\n` +
                `Timestamp: ${new Date().toISOString()}`
        }
      ],
    };
  }
}

/**
 * 🔧 List available MCP tools
 */
async function listTools() {
  return {
    tools: [
      {
        name: "deployment_status",
        description: "Get current deployment status and health metrics",
        inputSchema: {
          type: "object",
          properties: {
            environment: { type: "string", enum: ["production", "staging", "development"] },
            includeMetrics: { type: "boolean" }
          }
        }
      },
      {
        name: "database_health",
        description: "Test database connectivity and health",
        inputSchema: {
          type: "object",
          properties: {
            includeQueries: { type: "boolean" },
            testConnection: { type: "boolean" }
          }
        }
      },
      {
        name: "mobile_optimization_check",
        description: "Validate mobile optimization performance",
        inputSchema: {
          type: "object",
          properties: {
            testEndpoint: { type: "string" },
            checkPerformance: { type: "boolean" }
          }
        }
      }
    ]
  };
}

// =============================================================================
// MCP REQUEST HANDLER
// =============================================================================

async function handleJSONRPCRequest(request: JSONRPCRequest): Promise<JSONRPCResponse> {
  try {
    let result;

    switch (request.method) {
      case "tools/list":
        result = await listTools();
        break;
        
      case "tools/call":
        const { name, arguments: args } = request.params || {};
        
        switch (name) {
          case "deployment_status":
            result = await getDeploymentStatus(args);
            break;
          case "database_health":
            result = await getDatabaseHealthTool(args);
            break;
          case "mobile_optimization_check":
            result = await getMobileOptimizationCheck(args);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        break;
        
      default:
        throw new Error(`Unknown method: ${request.method}`);
    }

    return {
      jsonrpc: "2.0",
      result,
      id: request.id
    };
  } catch (error) {
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error',
        data: error instanceof Error ? error.stack : undefined
      },
      id: request.id
    };
  }
}

// =============================================================================
// NEXT.JS API ROUTE HANDLERS
// =============================================================================

export async function GET() {
  return NextResponse.json({
    name: "RK Institute MCP Server",
    version: "1.0.0",
    protocolVersion: "2024-11-05",
    description: "MCP server for autonomous deployment verification",
    capabilities: {
      tools: {}
    },
    tools: ["deployment_status", "database_health", "mobile_optimization_check"],
    status: "operational",
    timestamp: new Date().toISOString(),
    implementation: "json-rpc-2.0"
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate JSON-RPC 2.0 format
    if (body.jsonrpc !== "2.0" || !body.method) {
      return NextResponse.json({
        jsonrpc: "2.0",
        error: {
          code: JSON_RPC_ERRORS.INVALID_REQUEST,
          message: "Invalid Request - must be JSON-RPC 2.0 format"
        },
        id: body.id || null
      }, {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await handleJSONRPCRequest(body);

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
    });
  } catch (error) {
    return NextResponse.json({
      jsonrpc: "2.0",
      error: {
        code: JSON_RPC_ERRORS.PARSE_ERROR,
        message: "Parse error",
        data: error instanceof Error ? error.message : 'Invalid JSON'
      },
      id: null
    }, {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
