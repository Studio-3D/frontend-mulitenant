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

export const DesistementChart = ({ startDate, endDate, data }) => {
  // Transform the desistements data into chart format
  const transformData = () => {
    if (!data?.desistements || !Array.isArray(data.desistements)) return [];

   const filteredData = data.desistements.filter(item => {
  try {
    if (!item.date) return false;
    
    // Remove any non-numeric characters from date string
    const cleanDate = item.date.replace(/[^0-9-]/g, '');
    const [day, month, year] = cleanDate.split('-');
    const itemDate = new Date(`${year}-${month}-${day}`);
    
    return !isNaN(itemDate.getTime()) && 
           itemDate >= startDate && 
           itemDate <= endDate;
  } catch (e) {
    console.error('Error parsing date:', e, item);
    return false;
  }
});

    console.log('Filtered désistements:', filteredData); // Debug log

      // In your transformData function:
      const counts = {
        'Définitif': 0,
        'Au profit co-reservataire': 0,
        'Au profit proche': 0,
        'Partiel': 0,
        'Changement de Bien': 0
      };

      // Updated counting logic:
      filteredData.forEach(item => {
        counts['Définitif'] += item['Désistement Définitif'] || 0;
        counts['Au profit co-reservataire'] += item['Désistement au profit d\'un co reservataire'] || 0;
        counts['Au profit proche'] += item['Désistement au profit d\'un proche'] || 0;
        counts['Partiel'] += item['Désistement partiel'] || 0;
        counts['Changement de Bien'] += item['Changement de Bien'] || 0;
      });

    // Convert to chart format
    const result = Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));

    console.log('Chart data:', result); // Debug log
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
        Aucune donnée de désistement disponible pour la période sélectionnée
      </div>
    );
  }

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
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
            formatter={(value) => (
              <span className="text-xs text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};