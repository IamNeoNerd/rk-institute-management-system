/**
 * Automation Engine Service
 * Core service for handling automated tasks like monthly billing
 */

import { PrismaClient } from '@prisma/client';
import { FeeCalculationService } from '../feeCalculationService';
import NotificationService from './notification.service';

const prisma = new PrismaClient();

export interface MonthlyBillingJobResult {
  success: boolean;
  totalStudents: number;
  successfulBills: number;
  failedBills: number;
  errors: string[];
  executionTime: number;
  timestamp: Date;
}

export interface JobExecutionLog {
  id: string;
  jobType: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  startTime: Date;
  endTime?: Date;
  result?: any;
  errors?: string[];
}

export class AutomationEngineService {
  private static instance: AutomationEngineService;
  private runningJobs: Map<string, JobExecutionLog> = new Map();

  private constructor() {}

  public static getInstance(): AutomationEngineService {
    if (!AutomationEngineService.instance) {
      AutomationEngineService.instance = new AutomationEngineService();
    }
    return AutomationEngineService.instance;
  }

  /**
   * Execute monthly billing job for all active students
   */
  async executeMonthlyBillingJob(month?: number, year?: number): Promise<MonthlyBillingJobResult> {
    const startTime = Date.now();
    const timestamp = new Date();
    const jobId = `monthly-billing-${timestamp.getTime()}`;
    
    // Use current month/year if not provided
    const targetDate = new Date();
    const targetMonth = month || targetDate.getMonth() + 1;
    const targetYear = year || targetDate.getFullYear();

    console.log(`[Automation Engine] Starting monthly billing job for ${targetMonth}/${targetYear}`);
    
    // Track job execution
    const jobLog: JobExecutionLog = {
      id: jobId,
      jobType: 'MONTHLY_BILLING',
      status: 'RUNNING',
      startTime: timestamp
    };
    this.runningJobs.set(jobId, jobLog);

    const result: MonthlyBillingJobResult = {
      success: false,
      totalStudents: 0,
      successfulBills: 0,
      failedBills: 0,
      errors: [],
      executionTime: 0,
      timestamp
    };

    try {
      // Get all active students
      const activeStudents = await prisma.student.findMany({
        where: { isActive: true },
        include: {
          family: {
            include: {
              users: {
                where: { role: 'PARENT' },
                take: 1
              }
            }
          },
          subscriptions: {
            where: { endDate: null },
            include: {
              course: { include: { feeStructure: true } },
              service: { include: { feeStructure: true } }
            }
          }
        }
      });

      result.totalStudents = activeStudents.length;
      console.log(`[Automation Engine] Found ${activeStudents.length} active students`);

      // Process each student
      for (const student of activeStudents) {
        try {
          // Check if bill already exists for this month/year
          const existingAllocation = await prisma.studentFeeAllocation.findUnique({
            where: {
              studentId_month_year: {
                studentId: student.id,
                month: new Date(targetYear, targetMonth - 1, 1),
                year: targetYear
              }
            }
          });

          if (existingAllocation) {
            console.log(`[Automation Engine] Bill already exists for ${student.name} (${targetMonth}/${targetYear})`);
            result.successfulBills++;
            continue;
          }

          // Calculate fees for the student
          const feeCalculation = await FeeCalculationService.calculateStudentMonthlyFee(student.id);
          
          // Create fee allocation
          const monthDate = new Date(targetYear, targetMonth - 1, 1);
          const dueDate = new Date(targetYear, targetMonth - 1, 15); // 15th of the month
          
          await prisma.studentFeeAllocation.create({
            data: {
              studentId: student.id,
              month: monthDate,
              year: targetYear,
              grossAmount: feeCalculation.grossMonthlyFee,
              discountAmount: feeCalculation.totalDiscount,
              netAmount: feeCalculation.netMonthlyFee,
              dueDate,
              status: 'PENDING'
            }
          });

          // Send notification if family has contact info
          if (student.family.users.length > 0) {
            const parentUser = student.family.users[0];
            await NotificationService.sendMonthlyBillNotification(
              student.family.name,
              student.name,
              feeCalculation.netMonthlyFee,
              monthDate.toLocaleDateString('en-US', { month: 'long' }),
              targetYear,
              parentUser.email
            );
          }

          result.successfulBills++;
          console.log(`[Automation Engine] ✅ Created bill for ${student.name}: ₹${feeCalculation.netMonthlyFee}`);

        } catch (error) {
          const errorMessage = `Failed to process ${student.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMessage);
          result.failedBills++;
          console.error(`[Automation Engine] ❌ ${errorMessage}`);
        }
      }

      result.success = result.failedBills === 0;
      result.executionTime = Date.now() - startTime;

      // Update job log
      jobLog.status = result.success ? 'COMPLETED' : 'FAILED';
      jobLog.endTime = new Date();
      jobLog.result = result;
      jobLog.errors = result.errors;

      console.log(`[Automation Engine] Monthly billing job completed:`);
      console.log(`  - Total Students: ${result.totalStudents}`);
      console.log(`  - Successful: ${result.successfulBills}`);
      console.log(`  - Failed: ${result.failedBills}`);
      console.log(`  - Execution Time: ${result.executionTime}ms`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      result.executionTime = Date.now() - startTime;
      
      jobLog.status = 'FAILED';
      jobLog.endTime = new Date();
      jobLog.errors = [errorMessage];
      
      console.error(`[Automation Engine] Monthly billing job failed: ${errorMessage}`);
    }

    return result;
  }

  /**
   * Get status of running jobs
   */
  getRunningJobs(): JobExecutionLog[] {
    return Array.from(this.runningJobs.values());
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): JobExecutionLog | undefined {
    return this.runningJobs.get(jobId);
  }

  /**
   * Clear completed jobs from memory
   */
  clearCompletedJobs(): void {
    const jobEntries = Array.from(this.runningJobs.entries());
    for (const [jobId, job] of jobEntries) {
      if (job.status === 'COMPLETED' || job.status === 'FAILED') {
        this.runningJobs.delete(jobId);
      }
    }
  }
}

export default AutomationEngineService.getInstance();
