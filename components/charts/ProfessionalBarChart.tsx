'use client';

interface ChartData {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

interface ProfessionalBarChartProps {
  data: ChartData[];
  title: string;
  subtitle?: string;
  dataKey?: string;
  height?: number;
  color?: string;
  showGrid?: boolean;
  className?: string;
}

// Temporary SSR-safe placeholder (Phase 2 Critical Fix)
export default function ProfessionalBarChart({
  data,
  title,
  subtitle,
  dataKey = 'value',
  height = 300,
  color = '#3B82F6',
  showGrid = true,
  className = ''
}: ProfessionalBarChartProps) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Temporary Chart Placeholder */}
      <div 
        style={{ height }} 
        className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200"
      >
        <div className="text-center">
          <div className="text-blue-600 font-medium">Bar Chart</div>
          <div className="text-sm text-blue-500 mt-1">{data?.length || 0} data points</div>
          <div className="text-xs text-blue-400 mt-1">Chart loading optimized for SSR</div>
        </div>
      </div>
    </div>
  );
}
