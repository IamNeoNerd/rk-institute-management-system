import { NextResponse } from 'next/server';
import AutomationEngineService from '@/lib/services/automation-engine.service';

// POST - Manually trigger monthly billing job
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { month, year } = body;

    // Validate month and year if provided
    if (month && (month < 1 || month > 12)) {
      return NextResponse.json(
        { error: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }

    if (year && (year < 2020 || year > 2030)) {
      return NextResponse.json(
        { error: 'Year must be between 2020 and 2030' },
        { status: 400 }
      );
    }

    console.log(
      `[API] Manual monthly billing trigger requested for ${month || 'current'}/${year || 'current'}`
    );

    // Execute the monthly billing job
    const result = await AutomationEngineService.executeMonthlyBillingJob(
      month,
      year
    );

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Monthly billing completed successfully. Generated ${result.successfulBills} bills out of ${result.totalStudents} students.`
        : `Monthly billing completed with errors. ${result.failedBills} bills failed out of ${result.totalStudents} students.`,
      data: {
        totalStudents: result.totalStudents,
        successfulBills: result.successfulBills,
        failedBills: result.failedBills,
        executionTime: result.executionTime,
        timestamp: result.timestamp,
        errors: result.errors
      }
    });
  } catch (error) {
    console.error('[API] Monthly billing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute monthly billing job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Get monthly billing status/history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Get running jobs
    const runningJobs = AutomationEngineService.getRunningJobs();
    const monthlyBillingJobs = runningJobs.filter(
      job => job.jobType === 'MONTHLY_BILLING'
    );

    // If specific month/year requested, we could fetch allocation data
    // For now, just return job status
    return NextResponse.json({
      success: true,
      data: {
        runningJobs: monthlyBillingJobs,
        totalRunningJobs: monthlyBillingJobs.length,
        lastUpdate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[API] Get monthly billing status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get monthly billing status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
