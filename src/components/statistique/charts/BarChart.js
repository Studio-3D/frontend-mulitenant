import React, { useState } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const BarChart = ({ 
  data, 
  startDate, 
  endDate, 
  locale = 'fr-FR', 
  valueSuffix = 'utilisateurs',
  animationDuration = 1500,
  animationBegin = 300
}) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const isLoading = !data;

  const handleMouseEnter = (_, index) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-100">
          <p className="text-sm font-medium" style={{ color: data.color }}>
            {data.name}
          </p>
          <p className="text-sm text-gray-700 mt-1">
            {data.value.toLocaleString(locale)} {valueSuffix}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-500">
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Aucune donnée d'utilisateur disponible
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px]" aria-label="Bar chart showing user data">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          barGap={8}
          barSize={32}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
            }
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'transparent' }}
          />
          <Bar
            dataKey="value"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            animationDuration={animationDuration}
            animationBegin={animationBegin}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={activeIndex === index ? entry.color : `${entry.color}99`}
                style={{
                  filter: activeIndex === index
                    ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                    : 'none',
                  transition: 'fill 0.3s, filter 0.3s',
                }}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};