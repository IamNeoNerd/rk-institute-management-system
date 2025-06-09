import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { reportStorageService } from '@/lib/services/report-storage.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reportId = params.id;

    // Get the report
    const report = await reportStorageService.getReportById(reportId);
    
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (report.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Report is not ready for download' }, { status: 400 });
    }

    // Increment download count
    await reportStorageService.incrementDownloadCount(reportId);

    // Determine content type based on format
    let contentType = 'application/json';
    let fileName = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;

    switch (report.format) {
      case 'PDF':
        contentType = 'application/pdf';
        fileName = fileName.replace('.json', '.pdf');
        break;
      case 'EXCEL':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileName = fileName.replace('.json', '.xlsx');
        break;
      case 'CSV':
        contentType = 'text/csv';
        fileName = fileName.replace('.json', '.csv');
        break;
    }

    // For JSON format, return the data directly
    if (report.format === 'JSON') {
      const response = new NextResponse(JSON.stringify(report.data, null, 2), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'no-cache'
        }
      });

      return response;
    }

    // For other formats, we would need to implement conversion
    // For now, return JSON with appropriate headers
    return new NextResponse(JSON.stringify(report.data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Error downloading report:', error);
    return NextResponse.json(
      { error: 'Failed to download report' },
      { status: 500 }
    );
  }
}
