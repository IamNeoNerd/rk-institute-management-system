'use client';

import { useState } from 'react';
import { Motion, fadeIn } from '@/components/ui/animations/SSRSafeMotion';
import { Download, FileText, Calendar, Filter, Loader2 } from 'lucide-react';
import { ssrSafeToast } from '@/components/ui/notifications/SSRSafeToaster';

interface ReportData {
  title: string;
  type: 'student' | 'financial' | 'academic' | 'operational';
  dateRange: {
    start: string;
    end: string;
  };
  data: any[];
  charts?: React.ReactNode[];
}

interface ReportGeneratorProps {
  reportData: ReportData;
  className?: string;
}

const reportTypes = {
  student: { name: 'Student Report', color: 'blue' },
  financial: { name: 'Financial Report', color: 'green' },
  academic: { name: 'Academic Report', color: 'purple' },
  operational: { name: 'Operational Report', color: 'indigo' }
};

export default function ReportGenerator({ reportData, className = '' }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');

  const generatePDFReport = async () => {
    setIsGenerating(true);

    try {
      // Only run on client side
      if (typeof window === 'undefined') {
        ssrSafeToast.error('PDF generation is only available in the browser');
        setIsGenerating(false);
        return;
      }

      // Dynamically import the modules
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      // Create a temporary div for the report content
      const reportElement = document.createElement('div');
      reportElement.style.padding = '40px';
      reportElement.style.backgroundColor = 'white';
      reportElement.style.fontFamily = 'Arial, sans-serif';
      
      // Report Header
      reportElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
          <h1 style="color: #1f2937; font-size: 28px; margin: 0;">${reportData.title}</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
            Generated on ${new Date().toLocaleDateString()} | 
            Period: ${reportData.dateRange.start} to ${reportData.dateRange.end}
          </p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">Executive Summary</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; color: #4b5563; line-height: 1.6;">
              This report contains ${reportData.data.length} records for the specified period.
              Generated automatically by RK Institute Management System.
            </p>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">Data Summary</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; color: #374151;">Metric</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; color: #374151;">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">Total Records</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">${reportData.data.length}</td>
              </tr>
              <tr style="background: #f9fafb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb;">Report Type</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${reportTypes[reportData.type].name}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">Date Range</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${reportData.dateRange.start} to ${reportData.dateRange.end}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} RK Institute Management System. All rights reserved.
          </p>
        </div>
      `;
      
      // Only run on client side
      if (typeof window !== 'undefined') {
        document.body.appendChild(reportElement);
      }

      // Generate canvas from the element
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      // Remove the temporary element
      document.body.removeChild(reportElement);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save the PDF
      const fileName = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      // Save report metadata to database (API call)
      await saveReportMetadata({
        title: reportData.title,
        type: reportData.type,
        fileName,
        generatedAt: new Date().toISOString(),
        recordCount: reportData.data.length
      });
      
      ssrSafeToast.success('Report generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      ssrSafeToast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveReportMetadata = async (metadata: any) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save report metadata');
      }
    } catch (error) {
      console.error('Error saving report metadata:', error);
    }
  };

  return (
    <Motion
      {...fadeIn}
      transition={{ duration: 0.3 }}
      className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Generate Report</h3>
            <p className="text-sm text-gray-600">{reportTypes[reportData.type].name}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-4">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {reportData.dateRange.start} to {reportData.dateRange.end}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {reportData.data.length} records found
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Format:</label>
          <select
            value={reportFormat}
            onChange={(e) => setReportFormat(e.target.value as 'pdf' | 'excel')}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel (Coming Soon)</option>
          </select>
        </div>

        <button
          onClick={generatePDFReport}
          disabled={isGenerating || reportFormat === 'excel'}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isGenerating ? 'Generating...' : 'Download Report'}</span>
        </button>
      </div>
    </Motion>
  );
}
