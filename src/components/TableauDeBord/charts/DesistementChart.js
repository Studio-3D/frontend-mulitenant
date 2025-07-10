import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const DesistementChart = ({ dateRange, data }) => {
  // Transform the desistements data into chart format
const transformData = () => {
  if (!data?.desistements) return [];

  const filteredData = data.desistements; // Already filtered by the backend

  const counts = {
    'Désistement Définitif': 0,
    'Désistement au profit d\'un co reservataire': 0,
    'Désistement au profit d\'un proche': 0,
    'Désistement partiel': 0,
    'Changeant de Bien': 0
  };

  filteredData.forEach(item => {
    counts['Désistement Définitif'] += item['Désistement Définitif'] || 0;
    counts['Désistement au profit d\'un co reservataire'] += item['Désistement au profit d\'un co reservataire'] || 0;
    counts['Désistement au profit d\'un proche'] += item['Désistement au profit d\'un proche'] || 0;
    counts['Désistement partiel'] += item['Désistement partiel'] || 0;
    counts['Changeant de Bien'] += item['Changeant de Bien'] || 0;
  });

  const result = Object.entries(counts)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  return result.length > 0 ? result : [];
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
      <div className="flex items-center justify-center h-64 text-gray-500">
        Aucune donnée de désistement disponible
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
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
          formatter={(value, name) => [value, name]}
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
            paddingTop: '4px',
          }}
          iconSize={10}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};