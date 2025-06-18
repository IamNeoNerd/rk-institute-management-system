'use client';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface ProfessionalPieChartProps {
  data: ChartData[];
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  showLegend?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { height: 200 },
  md: { height: 300 },
  lg: { height: 400 }
};

// Temporary SSR-safe placeholder (Phase 2 Critical Fix)
export default function ProfessionalPieChart({
  data,
  title,
  subtitle,
  size = 'md',
  showLegend = true,
  className = ''
}: ProfessionalPieChartProps) {
  const config = sizeConfig[size];
  const total = data?.reduce((sum, item) => sum + item.value, 0) || 0;

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
        style={{ height: config.height }}
        className="flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-200"
      >
        <div className="text-center">
          <div className="text-purple-600 font-medium">Pie Chart</div>
          <div className="text-sm text-purple-500 mt-1">{data?.length || 0} segments</div>
          <div className="text-xs text-purple-400 mt-1">Total: {total.toLocaleString()}</div>
          <div className="text-xs text-purple-400">Chart loading optimized for SSR</div>
        </div>
      </div>
    </div>
  );
}
