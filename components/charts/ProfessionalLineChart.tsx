'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ProfessionalLineChartProps {
  data: ChartData[];
  title: string;
  subtitle?: string;
  dataKey?: string;
  height?: number;
  color?: string;
  showArea?: boolean;
  showGrid?: boolean;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">
          Value: <span className="font-medium text-blue-600">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ProfessionalLineChart({
  data,
  title,
  subtitle,
  dataKey = 'value',
  height = 300,
  color = '#3B82F6',
  showArea = false,
  showGrid = true,
  className = ''
}: ProfessionalLineChartProps) {
  const ChartComponent = showArea ? AreaChart : LineChart;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showArea ? (
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                fill={color}
                fillOpacity={0.1}
                strokeWidth={3}
                animationDuration={800}
              />
            ) : (
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                animationDuration={800}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
