import { NextResponse } from 'next/server';
import AutomationEngineService from '@/lib/services/automation-engine.service';

// POST - Manually trigger fee reminder job
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reminderType = 'overdue' } = body;

    // Validate reminder type
    if (!['early', 'due', 'overdue'].includes(reminderType)) {
      return NextResponse.json(
        { error: 'Invalid reminder type. Use: early, due, or overdue' },
        { status: 400 }
      );
    }

    console.log(`[API] Manual fee reminder trigger requested (${reminderType})`);

    // Execute the fee reminder job
    const result = await AutomationEngineService.executeFeeReminderJob(reminderType);

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Fee reminders (${reminderType}) sent successfully. Processed ${result.successfulBills} reminders out of ${result.totalStudents} due allocations.`
        : `Fee reminders (${reminderType}) completed with errors. ${result.failedBills} reminders failed out of ${result.totalStudents} due allocations.`,
      data: {
        reminderType,
        totalAllocations: result.totalStudents,
        successfulReminders: result.successfulBills,
        failedReminders: result.failedBills,
        executionTime: result.executionTime,
        timestamp: result.timestamp,
        errors: result.errors
      }
    });

  } catch (error) {
    console.error('[API] Fee reminder error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to execute fee reminder job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Get fee reminder status and overdue summary
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reminderType = searchParams.get('type') || 'all';

    // Get running jobs
    const runningJobs = AutomationEngineService.getRunningJobs();
    const reminderJobs = runningJobs.filter(job => job.jobType === 'FEE_REMINDER');

    // Get overdue allocations summary (simplified for now)
    const today = new Date();
    
    // This would normally query the database, but for now we'll return a placeholder
    const overdueStats = {
      totalOverdue: 0,
      totalAmount: 0,
      affectedFamilies: 0,
      oldestOverdue: null,
      lastReminderSent: null
    };

    return NextResponse.json({
      success: true,
      data: {
        runningJobs: reminderJobs,
        overdueStats,
        reminderType,
        lastUpdate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[API] Get fee reminder status error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get fee reminder status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
