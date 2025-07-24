import React from 'react';
import { format, parse, isAfter, isBefore } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector,
} from 'recharts';

const COLORS = ['#22c55e', '#0ea5e9', '#f43f5e'];

export const AppelsChart = ({ startDate, endDate, data }) => {
  // Transform and filter the appels data based on date range
  const transformData = () => {
    // Check both possible data locations (Appels or array_appels)
    const appelsData = data?.Appels || [];
    
    // Initialize counters for each type
    const counts = {
      'Appels entrants': 0,
      'Appels sortants': 0
    };

    // Process each call record
    appelsData.forEach(item => {
      // Parse date in 'dd-MM-yyyy' format
      const itemDate = parse(item.date, 'dd-MM-yyyy', new Date());
      
      // Check if date is within selected range
      if (isAfter(itemDate, startDate) && isBefore(itemDate, endDate)) {
        counts['Appels entrants'] += item['appel entrant'] || item.appel_entrant || 0;
        counts['Appels sortants'] += item['appel sortant'] || item.appel_sortant || 0;
      }
    });

    // Convert to array format for PieChart
    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  };

  const chartData = transformData();

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
        <div>Aucune donnée d'appels disponible pour la période sélectionnée</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          activeShape={renderActiveShape}
          animationDuration={1000}
          animationBegin={0}
          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              strokeWidth={index === 0 ? 2 : 0}
              stroke={index === 0 ? '#f0f0f0' : 'none'}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${value} appels`, name]}
          contentStyle={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: 'none',
          }}
          labelStyle={{
            display: 'none',
          }}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{
            paddingTop: '20px'
          }}
          iconSize={10}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};