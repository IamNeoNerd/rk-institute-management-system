/**
 * Scheduler Service
 * Handles scheduled tasks using node-cron
 */

import * as cron from 'node-cron';

import AutomationEngineService from './automation-engine.service';

export interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  description: string;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  task: cron.ScheduledTask | null;
}

export class SchedulerService {
  private static instance: SchedulerService;
  private jobs: Map<string, ScheduledJob> = new Map();

  private constructor() {
    this.initializeDefaultJobs();
  }

  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  /**
   * Initialize default scheduled jobs
   */
  private initializeDefaultJobs(): void {
    // Monthly billing job - runs at 10 AM on the 5th of every month
    this.scheduleJob({
      id: 'monthly-billing',
      name: 'Monthly Billing Generation',
      schedule: '0 10 5 * *', // At 10:00 AM on the 5th day of every month
      description:
        'Automatically generates monthly bills for all active students',
      isActive: true
    });

    // Fee reminder jobs
    this.scheduleJob({
      id: 'fee-reminder-early',
      name: 'Early Fee Reminder',
      schedule: '0 9 * * *', // Daily at 9 AM
      description: 'Send reminders 3 days before fee due date',
      isActive: true
    });

    this.scheduleJob({
      id: 'fee-reminder-due',
      name: 'Due Date Fee Reminder',
      schedule: '0 10 * * *', // Daily at 10 AM
      description: 'Send reminders on fee due date',
      isActive: true
    });

    this.scheduleJob({
      id: 'fee-reminder-overdue',
      name: 'Overdue Fee Reminder',
      schedule: '0 11 * * *', // Daily at 11 AM
      description: 'Send reminders for overdue fees',
      isActive: true
    });

    // Report generation jobs
    this.scheduleJob({
      id: 'weekly-report',
      name: 'Weekly Report Generation',
      schedule: '0 8 * * 1', // Every Monday at 8 AM
      description: 'Generate weekly performance and collection reports',
      isActive: true
    });

    this.scheduleJob({
      id: 'monthly-report',
      name: 'Monthly Report Generation',
      schedule: '0 8 1 * *', // 1st day of every month at 8 AM
      description: 'Generate comprehensive monthly reports',
      isActive: true
    });

    this.scheduleJob({
      id: 'outstanding-dues-report',
      name: 'Outstanding Dues Report',
      schedule: '0 8 * * 3', // Every Wednesday at 8 AM
      description: 'Generate outstanding dues and collection reports',
      isActive: true
    });

    console.log('[Scheduler Service] Default jobs initialized');
  }

  /**
   * Schedule a new job
   */
  scheduleJob(jobConfig: Omit<ScheduledJob, 'task'>): boolean {
    try {
      // Validate cron expression
      if (!cron.validate(jobConfig.schedule)) {
        console.error(
          `[Scheduler Service] Invalid cron expression: ${jobConfig.schedule}`
        );
        return false;
      }

      let task: cron.ScheduledTask | null = null;

      if (jobConfig.isActive) {
        // Create the scheduled task
        task = cron.schedule(jobConfig.schedule, async () => {
          console.log(
            `[Scheduler Service] Executing scheduled job: ${jobConfig.name}`
          );
          await this.executeJob(jobConfig.id);
        });

        // Don't start the task immediately - will be started in initialize()
        console.log(
          `[Scheduler Service] ✅ Scheduled job '${jobConfig.name}' with schedule '${jobConfig.schedule}'`
        );
      }

      // Store the job
      const job: ScheduledJob = {
        ...jobConfig,
        task,
        nextRun: this.getNextRunTime(jobConfig.schedule)
      };

      this.jobs.set(jobConfig.id, job);
      return true;
    } catch (error) {
      console.error(
        `[Scheduler Service] Failed to schedule job '${jobConfig.name}':`,
        error
      );
      return false;
    }
  }

  /**
   * Execute a specific job
   */
  private async executeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      console.error(`[Scheduler Service] Job not found: ${jobId}`);
      return;
    }

    try {
      job.lastRun = new Date();
      job.nextRun = this.getNextRunTime(job.schedule);

      console.log(`[Scheduler Service] Starting execution of job: ${job.name}`);

      switch (jobId) {
        case 'monthly-billing':
          await this.executeMonthlyBillingJob();
          break;
        case 'fee-reminder-early':
          await this.executeFeeReminderJob('early');
          break;
        case 'fee-reminder-due':
          await this.executeFeeReminderJob('due');
          break;
        case 'fee-reminder-overdue':
          await this.executeFeeReminderJob('overdue');
          break;
        case 'weekly-report':
          await this.executeReportGenerationJob('weekly');
          break;
        case 'monthly-report':
          await this.executeReportGenerationJob('monthly');
          break;
        case 'outstanding-dues-report':
          await this.executeReportGenerationJob('outstanding');
          break;
        default:
          console.warn(`[Scheduler Service] Unknown job type: ${jobId}`);
      }

      console.log(
        `[Scheduler Service] ✅ Completed execution of job: ${job.name}`
      );
    } catch (error) {
      console.error(
        `[Scheduler Service] ❌ Failed to execute job '${job.name}':`,
        error
      );
    }
  }

  /**
   * Execute monthly billing job
   */
  private async executeMonthlyBillingJob(): Promise<void> {
    try {
      const result = await AutomationEngineService.executeMonthlyBillingJob();

      if (result.success) {
        console.log(
          `[Scheduler Service] Monthly billing completed successfully: ${result.successfulBills}/${result.totalStudents} bills generated`
        );
      } else {
        console.error(
          `[Scheduler Service] Monthly billing completed with errors: ${result.failedBills} failed out of ${result.totalStudents}`
        );
        console.error('Errors:', result.errors);
      }
    } catch (error) {
      console.error('[Scheduler Service] Monthly billing job failed:', error);
    }
  }

  /**
   * Execute fee reminder job
   */
  private async executeFeeReminderJob(
    reminderType: 'early' | 'due' | 'overdue'
  ): Promise<void> {
    try {
      const result =
        await AutomationEngineService.executeFeeReminderJob(reminderType);

      if (result.success) {
        console.log(
          `[Scheduler Service] Fee reminder (${reminderType}) completed successfully: ${result.successfulBills} reminders sent`
        );
      } else {
        console.error(
          `[Scheduler Service] Fee reminder (${reminderType}) completed with errors: ${result.failedBills} failed out of ${result.totalStudents}`
        );
        console.error('Errors:', result.errors);
      }
    } catch (error) {
      console.error(
        `[Scheduler Service] Fee reminder (${reminderType}) job failed:`,
        error
      );
    }
  }

  /**
   * Execute report generation job
   */
  private async executeReportGenerationJob(
    reportType: 'monthly' | 'weekly' | 'outstanding'
  ): Promise<void> {
    try {
      const result =
        await AutomationEngineService.generateAutomatedReport(reportType);

      if (result.success) {
        console.log(
          `[Scheduler Service] Report generation (${reportType}) completed successfully`
        );
      } else {
        console.error(
          `[Scheduler Service] Report generation (${reportType}) failed`
        );
        console.error('Errors:', result.errors);
      }
    } catch (error) {
      console.error(
        `[Scheduler Service] Report generation (${reportType}) job failed:`,
        error
      );
    }
  }

  /**
   * Get next run time for a cron expression
   */
  private getNextRunTime(cronExpression: string): Date | undefined {
    try {
      // This is a simplified calculation - in production you might want to use a proper cron parser
      const now = new Date();
      const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Placeholder: next day
      return nextRun;
    } catch (error) {
      console.error(
        '[Scheduler Service] Failed to calculate next run time:',
        error
      );
      return undefined;
    }
  }

  /**
   * Get all scheduled jobs
   */
  getAllJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values()).map(job => ({
      ...job,
      task: null // Don't expose the actual task object
    }));
  }

  /**
   * Get a specific job
   */
  getJob(jobId: string): ScheduledJob | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    return {
      ...job,
      task: null // Don't expose the actual task object
    };
  }

  /**
   * Start a job
   */
  startJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || !job.task) return false;

    try {
      job.task.start();
      job.isActive = true;
      console.log(`[Scheduler Service] Started job: ${job.name}`);
      return true;
    } catch (error) {
      console.error(
        `[Scheduler Service] Failed to start job '${job.name}':`,
        error
      );
      return false;
    }
  }

  /**
   * Stop a job
   */
  stopJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || !job.task) return false;

    try {
      job.task.stop();
      job.isActive = false;
      console.log(`[Scheduler Service] Stopped job: ${job.name}`);
      return true;
    } catch (error) {
      console.error(
        `[Scheduler Service] Failed to stop job '${job.name}':`,
        error
      );
      return false;
    }
  }

  /**
   * Manually trigger a job
   */
  async triggerJob(jobId: string): Promise<boolean> {
    try {
      console.log(`[Scheduler Service] Manually triggering job: ${jobId}`);
      await this.executeJob(jobId);
      return true;
    } catch (error) {
      console.error(
        `[Scheduler Service] Failed to trigger job '${jobId}':`,
        error
      );
      return false;
    }
  }

  /**
   * Initialize the scheduler (start all active jobs)
   */
  initialize(): void {
    console.log('[Scheduler Service] Initializing scheduler...');

    const jobEntries = Array.from(this.jobs.entries());
    for (const [jobId, job] of jobEntries) {
      if (job.isActive && job.task) {
        job.task.start();
        console.log(`[Scheduler Service] Started job: ${job.name}`);
      }
    }

    console.log(
      `[Scheduler Service] ✅ Scheduler initialized with ${this.jobs.size} jobs`
    );
  }

  /**
   * Shutdown the scheduler
   */
  shutdown(): void {
    console.log('[Scheduler Service] Shutting down scheduler...');

    const jobEntries = Array.from(this.jobs.entries());
    for (const [jobId, job] of jobEntries) {
      if (job.task) {
        job.task.stop();
        console.log(`[Scheduler Service] Stopped job: ${job.name}`);
      }
    }

    console.log('[Scheduler Service] ✅ Scheduler shutdown complete');
  }
}

export default SchedulerService.getInstance();
