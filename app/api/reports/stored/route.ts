import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

import { reportStorageService } from '@/lib/services/report-storage.service';

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch reports with filters
    const reports = await reportStorageService.getReports({
      type: type || undefined,
      category: category || undefined,
      status: status || undefined,
      isArchived: false, // Only show non-archived reports
      limit,
      offset
    });

    // Get report statistics
    const statistics = await reportStorageService.getReportStatistics();

    return NextResponse.json({
      success: true,
      reports,
      statistics,
      pagination: {
        limit,
        offset,
        total: statistics.totalReports
      }
    });
  } catch (error) {
    console.error('Error fetching stored reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stored reports' },
      { status: 500 }
    );
  }
}
