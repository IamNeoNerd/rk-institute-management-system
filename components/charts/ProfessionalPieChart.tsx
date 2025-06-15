'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

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
  sm: { height: 200, innerRadius: 40, outerRadius: 80 },
  md: { height: 300, innerRadius: 60, outerRadius: 120 },
  lg: { height: 400, innerRadius: 80, outerRadius: 160 }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          Value: <span className="font-medium text-blue-600">{data.value}</span>
        </p>
        <p className="text-sm text-gray-600">
          Percentage: <span className="font-medium text-green-600">
            {((data.value / data.payload.total) * 100).toFixed(1)}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-2"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-gray-700">{entry.value}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default function ProfessionalPieChart({
  data,
  title,
  subtitle,
  size = 'md',
  showLegend = true,
  className = ''
}: ProfessionalPieChartProps) {
  const config = sizeConfig[size];
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Add total to each data point for tooltip calculation
  const enhancedData = data.map(item => ({ ...item, total }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
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
      <div style={{ height: config.height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={enhancedData}
              cx="50%"
              cy="50%"
              innerRadius={config.innerRadius}
              outerRadius={config.outerRadius}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {enhancedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend content={<CustomLegend />} />}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Total</span>
          <span className="text-lg font-bold text-gray-900">{total.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}
