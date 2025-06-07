import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface FeeCalculation {
  studentId: string;
  studentName: string;
  grossMonthlyFee: number;
  itemDiscounts: number;
  familyDiscountShare: number;
  totalDiscount: number;
  netMonthlyFee: number;
  breakdown: {
    courses: {
      id: string;
      name: string;
      monthlyAmount: number;
      discount: number;
    }[];
    services: {
      id: string;
      name: string;
      monthlyAmount: number;
      discount: number;
    }[];
  };
}

export class FeeCalculationService {
  /**
   * Calculate monthly fee for a specific student
   */
  static async calculateStudentMonthlyFee(studentId: string): Promise<FeeCalculation> {
    // Get student with all subscriptions and family info
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        family: true,
        subscriptions: {
          where: { endDate: null }, // Active subscriptions only
          include: {
            course: {
              include: { feeStructure: true }
            },
            service: {
              include: { feeStructure: true }
            }
          }
        }
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Calculate gross monthly fee and item discounts
    let grossMonthlyFee = 0;
    let itemDiscounts = 0;
    const courseBreakdown: any[] = [];
    const serviceBreakdown: any[] = [];

    // Process course subscriptions
    for (const subscription of student.subscriptions) {
      if (subscription.course && subscription.course.feeStructure) {
        const monthlyAmount = this.convertToMonthlyAmount(
          subscription.course.feeStructure.amount,
          subscription.course.feeStructure.billingCycle
        );
        
        grossMonthlyFee += monthlyAmount;
        itemDiscounts += subscription.discountAmount || 0;

        courseBreakdown.push({
          id: subscription.course.id,
          name: subscription.course.name,
          monthlyAmount,
          discount: subscription.discountAmount || 0
        });
      }

      if (subscription.service && subscription.service.feeStructure) {
        const monthlyAmount = this.convertToMonthlyAmount(
          subscription.service.feeStructure.amount,
          subscription.service.feeStructure.billingCycle
        );
        
        grossMonthlyFee += monthlyAmount;
        itemDiscounts += subscription.discountAmount || 0;

        serviceBreakdown.push({
          id: subscription.service.id,
          name: subscription.service.name,
          monthlyAmount,
          discount: subscription.discountAmount || 0
        });
      }
    }

    // Calculate family discount share
    const familyDiscountShare = await this.calculateFamilyDiscountShare(
      student.familyId,
      studentId
    );

    // Calculate totals
    const totalDiscount = itemDiscounts + familyDiscountShare;
    const netMonthlyFee = Math.max(0, grossMonthlyFee - totalDiscount);

    return {
      studentId,
      studentName: student.name,
      grossMonthlyFee,
      itemDiscounts,
      familyDiscountShare,
      totalDiscount,
      netMonthlyFee,
      breakdown: {
        courses: courseBreakdown,
        services: serviceBreakdown
      }
    };
  }

  /**
   * Calculate family discount share for a specific student
   */
  static async calculateFamilyDiscountShare(familyId: string, studentId: string): Promise<number> {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        students: {
          include: {
            subscriptions: {
              where: { endDate: null },
              include: {
                course: { include: { feeStructure: true } },
                service: { include: { feeStructure: true } }
              }
            }
          }
        }
      }
    });

    if (!family || family.discountAmount <= 0) {
      return 0;
    }

    // Calculate total family gross fees and this student's gross fee
    let totalFamilyGrossFee = 0;
    let thisStudentGrossFee = 0;

    for (const student of family.students) {
      let studentGrossFee = 0;

      for (const subscription of student.subscriptions) {
        if (subscription.course?.feeStructure) {
          studentGrossFee += this.convertToMonthlyAmount(
            subscription.course.feeStructure.amount,
            subscription.course.feeStructure.billingCycle
          );
        }
        if (subscription.service?.feeStructure) {
          studentGrossFee += this.convertToMonthlyAmount(
            subscription.service.feeStructure.amount,
            subscription.service.feeStructure.billingCycle
          );
        }
      }

      totalFamilyGrossFee += studentGrossFee;
      
      if (student.id === studentId) {
        thisStudentGrossFee = studentGrossFee;
      }
    }

    // Calculate proportional share
    if (totalFamilyGrossFee === 0) {
      return 0;
    }

    const proportion = thisStudentGrossFee / totalFamilyGrossFee;
    return Math.round(family.discountAmount * proportion * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert any billing cycle amount to monthly amount
   */
  static convertToMonthlyAmount(amount: number, billingCycle: string): number {
    switch (billingCycle) {
      case 'MONTHLY':
        return amount;
      case 'QUARTERLY':
        return amount / 3;
      case 'HALF_YEARLY':
        return amount / 6;
      case 'YEARLY':
        return amount / 12;
      default:
        return amount; // Default to monthly
    }
  }

  /**
   * Calculate fees for all students in a family
   */
  static async calculateFamilyFees(familyId: string): Promise<FeeCalculation[]> {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        students: true
      }
    });

    if (!family) {
      throw new Error('Family not found');
    }

    const calculations: FeeCalculation[] = [];
    
    for (const student of family.students) {
      const calculation = await this.calculateStudentMonthlyFee(student.id);
      calculations.push(calculation);
    }

    return calculations;
  }

  /**
   * Generate monthly fee allocations for all students
   */
  static async generateMonthlyAllocations(month: number, year: number) {
    const students = await prisma.student.findMany({
      include: {
        subscriptions: {
          where: { endDate: null }
        }
      }
    });

    const allocations = [];

    for (const student of students) {
      if (student.subscriptions.length > 0) {
        const calculation = await this.calculateStudentMonthlyFee(student.id);
        
        // Create or update fee allocation
        const monthDate = new Date(year, month - 1, 1); // Convert to Date object
        const allocation = await prisma.studentFeeAllocation.upsert({
          where: {
            studentId_month_year: {
              studentId: student.id,
              month: monthDate,
              year
            }
          },
          update: {
            grossAmount: calculation.grossMonthlyFee,
            discountAmount: calculation.totalDiscount,
            netAmount: calculation.netMonthlyFee,
            dueDate: new Date(year, month - 1, 15), // 15th of the month
          },
          create: {
            studentId: student.id,
            month: monthDate,
            year,
            grossAmount: calculation.grossMonthlyFee,
            discountAmount: calculation.totalDiscount,
            netAmount: calculation.netMonthlyFee,
            dueDate: new Date(year, month - 1, 15),
            status: 'PENDING'
          }
        });

        allocations.push(allocation);
      }
    }

    return allocations;
  }
}
