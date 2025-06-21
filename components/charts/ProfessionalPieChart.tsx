'use client';

import { useEffect, useRef, useState } from 'react';

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
  sm: { height: 200, radius: 60 },
  md: { height: 300, radius: 80 },
  lg: { height: 400, radius: 100 }
};

// SSR-Safe Pure CSS/SVG Pie Chart Implementation
export default function ProfessionalPieChart({
  data,
  title,
  subtitle,
  size = 'md',
  showLegend = true,
  className = ''
}: ProfessionalPieChartProps) {
  const [mounted, setMounted] = useState(false);
  const config = sizeConfig[size];
  const total = data?.reduce((sum, item) => sum + item.value, 0) || 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate pie chart segments
  const createPieSegments = () => {
    if (!data || data.length === 0) return [];

    let cumulativePercentage = 0;
    return data.map((item) => {
      const percentage = (item.value / total) * 100;
      const startAngle = (cumulativePercentage / 100) * 360;
      const endAngle = ((cumulativePercentage + percentage) / 100) * 360;

      cumulativePercentage += percentage;

      return {
        ...item,
        percentage,
        startAngle,
        endAngle,
        path: createArcPath(config.radius, startAngle, endAngle)
      };
    });
  };

  const createArcPath = (radius: number, startAngle: number, endAngle: number) => {
    const centerX = config.height / 2;
    const centerY = config.height / 2;

    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  if (!mounted) {
    return (
      <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div style={{ height: config.height }} className="flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 rounded-full w-32 h-32"></div>
        </div>
      </div>
    );
  }

  const segments = createPieSegments();

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        {/* SVG Pie Chart */}
        <div className="flex-shrink-0">
          <svg width={config.height} height={config.height} className="transform -rotate-90">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.path}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <title>{`${segment.name}: ${segment.value} (${segment.percentage.toFixed(1)}%)`}</title>
              </path>
            ))}
          </svg>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="ml-6 space-y-2">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center text-sm">
                <div
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-gray-700 mr-2">{segment.name}</span>
                <span className="text-gray-500 font-medium">
                  {segment.value.toLocaleString()} ({segment.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-500">Total</div>
        <div className="text-lg font-semibold text-gray-900">{total.toLocaleString()}</div>
      </div>
    </div>
  );
}
