'use client';

import { useState } from 'react';

interface PieChartData {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

interface PieChartProps {
  data: PieChartData[];
  title: string;
  size?: 'sm' | 'md' | 'lg';
  showLegend?: boolean;
  showPercentages?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { container: 'w-48 h-48', svg: 'w-32 h-32', text: 'text-xs' },
  md: { container: 'w-64 h-64', svg: 'w-48 h-48', text: 'text-sm' },
  lg: { container: 'w-80 h-80', svg: 'w-64 h-64', text: 'text-base' }
};

export default function PieChart({
  data,
  title,
  size = 'md',
  showLegend = true,
  showPercentages = true,
  className = ''
}: PieChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  
  // Calculate percentages and cumulative angles
  let cumulativeAngle = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    
    cumulativeAngle += angle;
    
    // Calculate path for pie segment
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    return {
      ...item,
      percentage,
      pathData,
      index
    };
  });
  
  const classes = sizeClasses[size];
  
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="flex items-center justify-center space-x-8">
        {/* Pie Chart */}
        <div className={`relative ${classes.container} flex items-center justify-center`}>
          <svg
            className={classes.svg}
            viewBox="0 0 200 200"
            style={{ transform: 'rotate(-90deg)' }}
          >
            {segments.map((segment) => (
              <path
                key={segment.index}
                d={segment.pathData}
                fill={segment.color}
                stroke="white"
                strokeWidth="2"
                className={`transition-all duration-300 cursor-pointer ${
                  hoveredSegment === segment.index ? 'opacity-80 scale-105' : 'opacity-100'
                }`}
                onMouseEnter={() => setHoveredSegment(segment.index)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            ))}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        {showLegend && (
          <div className="space-y-3">
            {segments.map((segment) => (
              <div
                key={segment.index}
                className={`flex items-center space-x-3 cursor-pointer transition-all duration-200 ${
                  hoveredSegment === segment.index ? 'scale-105' : ''
                }`}
                onMouseEnter={() => setHoveredSegment(segment.index)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <div className="flex-1">
                  <div className={`font-medium text-gray-900 ${classes.text}`}>
                    {segment.label}
                  </div>
                  <div className={`text-gray-500 ${classes.text}`}>
                    {segment.value} {showPercentages && `(${segment.percentage.toFixed(1)}%)`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
