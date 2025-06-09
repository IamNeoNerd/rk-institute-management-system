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

  /**
   * Execute fee reminder job for overdue payments
   */
  async executeFeeReminderJob(reminderType: 'early' | 'due' | 'overdue' = 'overdue'): Promise<MonthlyBillingJobResult> {
    const startTime = Date.now();
    const timestamp = new Date();
    const jobId = `fee-reminder-${reminderType}-${timestamp.getTime()}`;

    console.log(`[Automation Engine] Starting fee reminder job (${reminderType})`);

    // Track job execution
    const jobLog: JobExecutionLog = {
      id: jobId,
      jobType: 'FEE_REMINDER',
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
      // Calculate date thresholds based on reminder type
      const today = new Date();
      let dateThreshold: Date;

      switch (reminderType) {
        case 'early':
          // 3 days before due date
          dateThreshold = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
          break;
        case 'due':
          // Due today
          dateThreshold = today;
          break;
        case 'overdue':
          // Overdue (past due date)
          dateThreshold = today;
          break;
      }

      // Get overdue/due fee allocations
      const whereClause: any = {
        status: 'PENDING',
        isPaid: false
      };

      if (reminderType === 'overdue') {
        whereClause.dueDate = { lt: dateThreshold };
      } else if (reminderType === 'due') {
        whereClause.dueDate = {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        };
      } else if (reminderType === 'early') {
        whereClause.dueDate = {
          gte: new Date(dateThreshold.getFullYear(), dateThreshold.getMonth(), dateThreshold.getDate()),
          lt: new Date(dateThreshold.getFullYear(), dateThreshold.getMonth(), dateThreshold.getDate() + 1)
        };
      }

      const overdueAllocations = await prisma.studentFeeAllocation.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              family: {
                include: {
                  users: {
                    where: { role: 'PARENT' },
                    take: 1
                  }
                }
              }
            }
          }
        }
      });

      result.totalStudents = overdueAllocations.length;
      console.log(`[Automation Engine] Found ${overdueAllocations.length} ${reminderType} fee allocations`);

      // Process each overdue allocation
      for (const allocation of overdueAllocations) {
        try {
          const student = allocation.student;
          const family = student.family;

          if (family.users.length === 0) {
            console.log(`[Automation Engine] No parent contact for ${student.name}, skipping reminder`);
            result.failedBills++;
            continue;
          }

          const parentUser = family.users[0];
          const daysOverdue = Math.floor((today.getTime() - allocation.dueDate!.getTime()) / (24 * 60 * 60 * 1000));

          // Send reminder notification
          await NotificationService.sendFeeReminder(
            family.name,
            student.name,
            allocation.netAmount,
            allocation.dueDate!,
            parentUser.email
          );

          result.successfulBills++;
          console.log(`[Automation Engine] ✅ Sent ${reminderType} reminder for ${student.name}: ₹${allocation.netAmount} (${daysOverdue} days ${reminderType})`);

        } catch (error) {
          const errorMessage = `Failed to send reminder for ${allocation.student.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
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

      console.log(`[Automation Engine] Fee reminder job (${reminderType}) completed:`);
      console.log(`  - Total Allocations: ${result.totalStudents}`);
      console.log(`  - Successful Reminders: ${result.successfulBills}`);
      console.log(`  - Failed Reminders: ${result.failedBills}`);
      console.log(`  - Execution Time: ${result.executionTime}ms`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      result.executionTime = Date.now() - startTime;

      jobLog.status = 'FAILED';
      jobLog.endTime = new Date();
      jobLog.errors = [errorMessage];

      console.error(`[Automation Engine] Fee reminder job (${reminderType}) failed: ${errorMessage}`);
    }

    return result;
  }

  /**
   * Generate automated report
   */
  async generateAutomatedReport(reportType: 'monthly' | 'weekly' | 'outstanding'): Promise<MonthlyBillingJobResult> {
    const startTime = Date.now();
    const timestamp = new Date();
    const jobId = `report-${reportType}-${timestamp.getTime()}`;

    console.log(`[Automation Engine] Starting automated report generation (${reportType})`);

    // Track job execution
    const jobLog: JobExecutionLog = {
      id: jobId,
      jobType: 'REPORT_GENERATION',
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
      // Generate report based on type
      let reportData: any = {};

      switch (reportType) {
        case 'monthly':
          reportData = await this.generateMonthlyReport();
          break;
        case 'weekly':
          reportData = await this.generateWeeklyReport();
          break;
        case 'outstanding':
          reportData = await this.generateOutstandingDuesReport();
          break;
      }

      // For now, just log the report (in future, save to database or send via email)
      console.log(`[Automation Engine] ✅ Generated ${reportType} report:`, JSON.stringify(reportData, null, 2));

      result.success = true;
      result.successfulBills = 1; // One report generated
      result.executionTime = Date.now() - startTime;

      // Update job log
      jobLog.status = 'COMPLETED';
      jobLog.endTime = new Date();
      jobLog.result = { reportType, reportData };

      console.log(`[Automation Engine] Report generation (${reportType}) completed in ${result.executionTime}ms`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      result.executionTime = Date.now() - startTime;

      jobLog.status = 'FAILED';
      jobLog.endTime = new Date();
      jobLog.errors = [errorMessage];

      console.error(`[Automation Engine] Report generation (${reportType}) failed: ${errorMessage}`);
    }

    return result;
  }

  /**
   * Generate monthly report data
   */
  private async generateMonthlyReport(): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalRevenue,
      totalAllocations,
      paidAllocations,
      overdueAllocations,
      newStudents
    ] = await Promise.all([
      // Total revenue this month
      prisma.payment.aggregate({
        where: {
          paymentDate: { gte: startOfMonth, lte: endOfMonth }
        },
        _sum: { amount: true }
      }),
      // Total allocations this month
      prisma.studentFeeAllocation.count({
        where: {
          month: { gte: startOfMonth, lte: endOfMonth }
        }
      }),
      // Paid allocations this month
      prisma.studentFeeAllocation.count({
        where: {
          month: { gte: startOfMonth, lte: endOfMonth },
          status: 'PAID'
        }
      }),
      // Overdue allocations
      prisma.studentFeeAllocation.count({
        where: {
          status: 'PENDING',
          dueDate: { lt: now }
        }
      }),
      // New students this month
      prisma.student.count({
        where: {
          enrollmentDate: { gte: startOfMonth, lte: endOfMonth }
        }
      })
    ]);

    return {
      period: `${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}`,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalAllocations,
      paidAllocations,
      pendingAllocations: totalAllocations - paidAllocations,
      overdueAllocations,
      newStudents,
      collectionRate: totalAllocations > 0 ? (paidAllocations / totalAllocations * 100).toFixed(2) : 0
    };
  }

  /**
   * Generate weekly report data
   */
  private async generateWeeklyReport(): Promise<any> {
    const now = new Date();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [weeklyPayments, weeklyAllocations] = await Promise.all([
      prisma.payment.findMany({
        where: {
          paymentDate: { gte: startOfWeek, lte: now }
        },
        select: { amount: true, paymentDate: true }
      }),
      prisma.studentFeeAllocation.count({
        where: {
          createdAt: { gte: startOfWeek, lte: now }
        }
      })
    ]);

    const totalWeeklyRevenue = weeklyPayments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      period: `${startOfWeek.toLocaleDateString()} - ${now.toLocaleDateString()}`,
      totalRevenue: totalWeeklyRevenue,
      paymentCount: weeklyPayments.length,
      newAllocations: weeklyAllocations,
      averagePayment: weeklyPayments.length > 0 ? (totalWeeklyRevenue / weeklyPayments.length).toFixed(2) : 0
    };
  }

  /**
   * Generate outstanding dues report
   */
  private async generateOutstandingDuesReport(): Promise<any> {
    const now = new Date();

    const overdueAllocations = await prisma.studentFeeAllocation.findMany({
      where: {
        status: 'PENDING',
        dueDate: { lt: now }
      },
      include: {
        student: {
          include: {
            family: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    const totalOutstanding = overdueAllocations.reduce((sum, allocation) => sum + allocation.netAmount, 0);

    const familyBreakdown = overdueAllocations.reduce((acc, allocation) => {
      const familyName = allocation.student.family.name;
      if (!acc[familyName]) {
        acc[familyName] = { amount: 0, count: 0, oldestDue: allocation.dueDate };
      }
      acc[familyName].amount += allocation.netAmount;
      acc[familyName].count += 1;
      if (allocation.dueDate! < acc[familyName].oldestDue!) {
        acc[familyName].oldestDue = allocation.dueDate;
      }
      return acc;
    }, {} as Record<string, { amount: number; count: number; oldestDue: Date | null }>);

    return {
      totalOutstanding,
      overdueCount: overdueAllocations.length,
      affectedFamilies: Object.keys(familyBreakdown).length,
      familyBreakdown: Object.entries(familyBreakdown).map(([family, data]) => ({
        family,
        amount: data.amount,
        allocationsCount: data.count,
        oldestDueDate: data.oldestDue
      })).sort((a, b) => b.amount - a.amount)
    };
  }
}

export default AutomationEngineService.getInstance();
