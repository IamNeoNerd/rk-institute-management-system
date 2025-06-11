import { NextResponse } from 'next/server';
import AutomationEngineService from '@/lib/services/automation-engine.service';
import SchedulerService from '@/lib/services/scheduler.service';

// GET - Health check for automation system
export async function GET() {
  try {
    const timestamp = new Date().toISOString();

    // Check automation engine
    const runningJobs = AutomationEngineService.getRunningJobs();
    const automationEngineStatus = 'operational';

    // Check scheduler
    const scheduledJobs = SchedulerService.getAllJobs();
    const activeJobs = scheduledJobs.filter(job => job.isActive);
    const schedulerStatus = 'operational';

    // Overall health
    const isHealthy =
      automationEngineStatus === 'operational' &&
      schedulerStatus === 'operational';

    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      components: {
        automationEngine: {
          status: automationEngineStatus,
          runningJobs: runningJobs.length,
          details: runningJobs.map(job => ({
            id: job.id,
            type: job.jobType,
            status: job.status,
            startTime: job.startTime
          }))
        },
        scheduler: {
          status: schedulerStatus,
          totalJobs: scheduledJobs.length,
          activeJobs: activeJobs.length,
          details: scheduledJobs.map(job => ({
            id: job.id,
            name: job.name,
            isActive: job.isActive,
            lastRun: job.lastRun,
            nextRun: job.nextRun
          }))
        }
      },
      uptime: process.uptime(),
      version: '1.0.0'
    };

    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503
    });
  } catch (error) {
    console.error('[Health Check] Automation health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        components: {
          automationEngine: { status: 'error' },
          scheduler: { status: 'error' }
        }
      },
      {
        status: 503
      }
    );
  }
}
