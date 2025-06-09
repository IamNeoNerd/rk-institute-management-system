import { NextResponse } from 'next/server';
import AutomationEngineService from '@/lib/services/automation-engine.service';

// POST - Manually trigger report generation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reportType = 'monthly' } = body;

    // Validate report type
    if (!['monthly', 'weekly', 'outstanding'].includes(reportType)) {
      return NextResponse.json(
        { error: 'Invalid report type. Use: monthly, weekly, or outstanding' },
        { status: 400 }
      );
    }

    console.log(`[API] Manual report generation trigger requested (${reportType})`);

    // Execute the report generation job
    const result = await AutomationEngineService.generateAutomatedReport(reportType);

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Report (${reportType}) generated successfully.`
        : `Report generation (${reportType}) failed.`,
      data: {
        reportType,
        executionTime: result.executionTime,
        timestamp: result.timestamp,
        errors: result.errors,
        reportData: result.success ? 'Report generated and logged' : null
      }
    });

  } catch (error) {
    console.error('[API] Report generation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to execute report generation job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Get report generation status and history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'all';

    // Get running jobs
    const runningJobs = AutomationEngineService.getRunningJobs();
    const reportJobs = runningJobs.filter(job => job.jobType === 'REPORT_GENERATION');

    // Get recent report history (placeholder for now)
    const reportHistory = [
      {
        id: 'report-1',
        type: 'monthly',
        generatedAt: new Date().toISOString(),
        status: 'completed',
        executionTime: 2500
      },
      {
        id: 'report-2',
        type: 'weekly',
        generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        executionTime: 1200
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        runningJobs: reportJobs,
        reportHistory: reportType === 'all' ? reportHistory : reportHistory.filter(r => r.type === reportType),
        availableReportTypes: ['monthly', 'weekly', 'outstanding'],
        lastUpdate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[API] Get report status error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get report status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
