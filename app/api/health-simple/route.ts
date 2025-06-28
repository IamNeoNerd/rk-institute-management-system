/**
 * 🏥 Simple Health Check API Route
 * 
 * Minimal health check without database dependencies
 * Based on retrospective analysis findings
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic API health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'unknown',
      deployment: 'mcp-autonomous-deployment',
      commit: '4f036ac',
      services: {
        api: 'operational',
        server: 'running'
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      apiRouteWorking: true
    };

    return NextResponse.json(health, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      apiRouteWorking: false
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
