import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ReportData {
  id?: string;
  name: string;
  type: 'WEEKLY' | 'MONTHLY' | 'OUTSTANDING' | 'FINANCIAL' | 'ACADEMIC' | 'CUSTOM';
  category?: 'AUTOMATION' | 'MANUAL' | 'SCHEDULED';
  parameters?: any;
  data: any;
  generatedBy: string;
  format?: 'JSON' | 'PDF' | 'EXCEL' | 'CSV';
  executionTime?: number;
}

export interface StoredReport {
  id: string;
  name: string;
  type: string;
  category: string;
  parameters?: any;
  data?: any;
  generatedBy: string;
  filePath?: string;
  fileSize?: number;
  format: string;
  status: string;
  executionTime?: number;
  errorMessage?: string;
  downloadCount: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ReportStorageService {
  /**
   * Store a new report in the database
   */
  async storeReport(reportData: ReportData): Promise<StoredReport> {
    try {
      const startTime = Date.now();
      
      // Calculate data size
      const dataString = JSON.stringify(reportData.data);
      const dataSize = Buffer.byteLength(dataString, 'utf8');
      
      const report = await prisma.report.create({
        data: {
          name: reportData.name,
          type: reportData.type,
          category: reportData.category || 'AUTOMATION',
          parameters: reportData.parameters ? JSON.stringify(reportData.parameters) : null,
          data: dataString,
          generatedBy: reportData.generatedBy,
          format: reportData.format || 'JSON',
          fileSize: dataSize,
          status: 'COMPLETED',
          executionTime: reportData.executionTime || (Date.now() - startTime),
          downloadCount: 0,
          isArchived: false
        }
      });

      console.log(`[Report Storage] Stored ${reportData.type} report: ${report.id}`);
      return report as StoredReport;
      
    } catch (error) {
      console.error('[Report Storage] Error storing report:', error);
      throw new Error('Failed to store report');
    }
  }

  /**
   * Get all reports with optional filtering
   */
  async getReports(filters?: {
    type?: string;
    category?: string;
    generatedBy?: string;
    status?: string;
    isArchived?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<StoredReport[]> {
    try {
      const where: any = {};
      
      if (filters?.type) where.type = filters.type;
      if (filters?.category) where.category = filters.category;
      if (filters?.generatedBy) where.generatedBy = filters.generatedBy;
      if (filters?.status) where.status = filters.status;
      if (filters?.isArchived !== undefined) where.isArchived = filters.isArchived;

      const reports = await prisma.report.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        take: filters?.limit || 50,
        skip: filters?.offset || 0
      });

      return reports.map(report => ({
        ...report,
        parameters: report.parameters ? JSON.parse(report.parameters) : null,
        data: report.data ? JSON.parse(report.data) : null
      })) as StoredReport[];
      
    } catch (error) {
      console.error('[Report Storage] Error fetching reports:', error);
      throw new Error('Failed to fetch reports');
    }
  }

  /**
   * Get a specific report by ID
   */
  async getReportById(id: string): Promise<StoredReport | null> {
    try {
      const report = await prisma.report.findUnique({
        where: { id }
      });

      if (!report) return null;

      return {
        ...report,
        parameters: report.parameters ? JSON.parse(report.parameters) : null,
        data: report.data ? JSON.parse(report.data) : null
      } as StoredReport;
      
    } catch (error) {
      console.error('[Report Storage] Error fetching report:', error);
      throw new Error('Failed to fetch report');
    }
  }

  /**
   * Update report download count
   */
  async incrementDownloadCount(id: string): Promise<void> {
    try {
      await prisma.report.update({
        where: { id },
        data: {
          downloadCount: {
            increment: 1
          }
        }
      });
      
      console.log(`[Report Storage] Incremented download count for report: ${id}`);
      
    } catch (error) {
      console.error('[Report Storage] Error updating download count:', error);
      throw new Error('Failed to update download count');
    }
  }

  /**
   * Archive a report
   */
  async archiveReport(id: string): Promise<void> {
    try {
      await prisma.report.update({
        where: { id },
        data: {
          isArchived: true
        }
      });
      
      console.log(`[Report Storage] Archived report: ${id}`);
      
    } catch (error) {
      console.error('[Report Storage] Error archiving report:', error);
      throw new Error('Failed to archive report');
    }
  }

  /**
   * Delete old reports (cleanup)
   */
  async cleanupOldReports(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.report.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          },
          isArchived: true
        }
      });

      console.log(`[Report Storage] Cleaned up ${result.count} old reports`);
      return result.count;
      
    } catch (error) {
      console.error('[Report Storage] Error cleaning up reports:', error);
      throw new Error('Failed to cleanup reports');
    }
  }

  /**
   * Get report statistics
   */
  async getReportStatistics(): Promise<{
    totalReports: number;
    reportsByType: Record<string, number>;
    reportsByCategory: Record<string, number>;
    totalDownloads: number;
    archivedReports: number;
    recentReports: number;
  }> {
    try {
      const [
        totalReports,
        archivedCount,
        recentCount,
        allReports
      ] = await Promise.all([
        prisma.report.count(),
        prisma.report.count({ where: { isArchived: true } }),
        prisma.report.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        }),
        prisma.report.findMany({
          select: {
            type: true,
            category: true,
            downloadCount: true
          }
        })
      ]);

      // Calculate statistics
      const reportsByType: Record<string, number> = {};
      const reportsByCategory: Record<string, number> = {};
      let totalDownloads = 0;

      allReports.forEach(report => {
        reportsByType[report.type] = (reportsByType[report.type] || 0) + 1;
        reportsByCategory[report.category] = (reportsByCategory[report.category] || 0) + 1;
        totalDownloads += report.downloadCount;
      });

      return {
        totalReports,
        reportsByType,
        reportsByCategory,
        totalDownloads,
        archivedReports: archivedCount,
        recentReports: recentCount
      };
      
    } catch (error) {
      console.error('[Report Storage] Error fetching statistics:', error);
      throw new Error('Failed to fetch report statistics');
    }
  }

  /**
   * Mark report as failed
   */
  async markReportFailed(id: string, errorMessage: string): Promise<void> {
    try {
      await prisma.report.update({
        where: { id },
        data: {
          status: 'FAILED',
          errorMessage
        }
      });
      
      console.log(`[Report Storage] Marked report as failed: ${id}`);
      
    } catch (error) {
      console.error('[Report Storage] Error marking report as failed:', error);
      throw new Error('Failed to update report status');
    }
  }

  /**
   * Create report placeholder (for tracking generation progress)
   */
  async createReportPlaceholder(reportData: Omit<ReportData, 'data'>): Promise<string> {
    try {
      const report = await prisma.report.create({
        data: {
          name: reportData.name,
          type: reportData.type,
          category: reportData.category || 'AUTOMATION',
          parameters: reportData.parameters ? JSON.stringify(reportData.parameters) : null,
          generatedBy: reportData.generatedBy,
          format: reportData.format || 'JSON',
          status: 'GENERATING',
          downloadCount: 0,
          isArchived: false
        }
      });

      console.log(`[Report Storage] Created report placeholder: ${report.id}`);
      return report.id;
      
    } catch (error) {
      console.error('[Report Storage] Error creating report placeholder:', error);
      throw new Error('Failed to create report placeholder');
    }
  }

  /**
   * Update report with generated data
   */
  async updateReportData(id: string, data: any, executionTime?: number): Promise<void> {
    try {
      const dataString = JSON.stringify(data);
      const dataSize = Buffer.byteLength(dataString, 'utf8');
      
      await prisma.report.update({
        where: { id },
        data: {
          data: dataString,
          fileSize: dataSize,
          status: 'COMPLETED',
          executionTime: executionTime || 0
        }
      });
      
      console.log(`[Report Storage] Updated report data: ${id}`);
      
    } catch (error) {
      console.error('[Report Storage] Error updating report data:', error);
      throw new Error('Failed to update report data');
    }
  }
}

// Export singleton instance
export const reportStorageService = new ReportStorageService();
