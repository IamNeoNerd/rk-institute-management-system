'use client';

import { useEffect, useState } from 'react';

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

// SSR-Safe Pure CSS/SVG Bar Chart Implementation
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div style={{ height }} className="flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 rounded h-full w-full"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div style={{ height }} className="flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item[dataKey] || item.value));
  const chartHeight = height - 80; // Reserve space for labels
  const barWidth = Math.max(40, (800 - 100) / data.length - 10); // Responsive bar width

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Chart Container */}
      <div className="relative overflow-x-auto">
        <svg
          width={Math.max(800, data.length * (barWidth + 10) + 100)}
          height={height}
          className="min-w-full"
        >
          {/* Grid lines */}
          {showGrid && (
            <g>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                <g key={index}>
                  <line
                    x1={50}
                    y1={50 + chartHeight * ratio}
                    x2={50 + data.length * (barWidth + 10)}
                    y2={50 + chartHeight * ratio}
                    stroke="#f3f4f6"
                    strokeWidth={1}
                  />
                  <text
                    x={40}
                    y={55 + chartHeight * ratio}
                    textAnchor="end"
                    className="text-xs fill-gray-500"
                  >
                    {Math.round(maxValue * (1 - ratio)).toLocaleString()}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Bars */}
          {data.map((item, index) => {
            const value = item[dataKey] || item.value;
            const barHeight = (value / maxValue) * chartHeight;
            const x = 50 + index * (barWidth + 10);
            const y = 50 + chartHeight - barHeight;

            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color || color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  rx={4}
                />
                <title>{`${item.name}: ${value.toLocaleString()}`}</title>

                {/* Value label on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-700 font-medium"
                >
                  {value.toLocaleString()}
                </text>

                {/* X-axis label */}
                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {item.name.length > 10 ? `${item.name.substring(0, 10)}...` : item.name}
                </text>
              </g>
            );
          })}

          {/* Y-axis line */}
          <line
            x1={50}
            y1={50}
            x2={50}
            y2={50 + chartHeight}
            stroke="#d1d5db"
            strokeWidth={2}
          />

          {/* X-axis line */}
          <line
            x1={50}
            y1={50 + chartHeight}
            x2={50 + data.length * (barWidth + 10)}
            y2={50 + chartHeight}
            stroke="#d1d5db"
            strokeWidth={2}
          />
        </svg>
      </div>

      {/* Summary */}
      <div className="mt-4 flex justify-between text-sm text-gray-500">
        <span>{data.length} data points</span>
        <span>Max: {maxValue.toLocaleString()}</span>
      </div>
    </div>
  );
}
