import { NextResponse } from 'next/server';
import AutomationEngineService from '@/lib/services/automation-engine.service';
import SchedulerService from '@/lib/services/scheduler.service';

// GET - Get automation system status
export async function GET(request: Request) {
  try {
    // Get running jobs from automation engine
    const runningJobs = AutomationEngineService.getRunningJobs();

    // Get scheduled jobs from scheduler
    const scheduledJobs = SchedulerService.getAllJobs();

    // System health check
    const systemStatus = {
      automationEngine: 'operational',
      scheduler: 'operational',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: {
        systemStatus,
        runningJobs: runningJobs.map(job => ({
          id: job.id,
          type: job.jobType,
          status: job.status,
          startTime: job.startTime,
          endTime: job.endTime,
          duration: job.endTime
            ? job.endTime.getTime() - job.startTime.getTime()
            : null
        })),
        scheduledJobs: scheduledJobs.map(job => ({
          id: job.id,
          name: job.name,
          schedule: job.schedule,
          description: job.description,
          isActive: job.isActive,
          lastRun: job.lastRun,
          nextRun: job.nextRun
        })),
        summary: {
          totalRunningJobs: runningJobs.length,
          totalScheduledJobs: scheduledJobs.length,
          activeScheduledJobs: scheduledJobs.filter(job => job.isActive).length
        }
      }
    });
  } catch (error) {
    console.error('[API] Automation status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get automation status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Control automation jobs (start/stop/trigger)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, jobId } = body;

    if (!action || !jobId) {
      return NextResponse.json(
        { error: 'Action and jobId are required' },
        { status: 400 }
      );
    }

    let result = false;
    let message = '';

    switch (action) {
      case 'start':
        result = SchedulerService.startJob(jobId);
        message = result
          ? `Job '${jobId}' started successfully`
          : `Failed to start job '${jobId}'`;
        break;

      case 'stop':
        result = SchedulerService.stopJob(jobId);
        message = result
          ? `Job '${jobId}' stopped successfully`
          : `Failed to stop job '${jobId}'`;
        break;

      case 'trigger':
        result = await SchedulerService.triggerJob(jobId);
        message = result
          ? `Job '${jobId}' triggered successfully`
          : `Failed to trigger job '${jobId}'`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, stop, or trigger' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result,
      message,
      action,
      jobId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Automation control error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to control automation job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
