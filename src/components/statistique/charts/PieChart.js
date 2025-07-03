import React , {useState} from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

export const PieChart = ({ data, startDate, endDate }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
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
            {data.value.toLocaleString('fr-FR')} visites
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <ul className="flex flex-wrap justify-center mt-4 gap-3">
        {payload.map((entry, index) => (
          <li
            key={`legend-${index}`}
            className={`flex items-center text-xs px-2 py-1 rounded-full transition-colors ${activeIndex === index ? 'bg-gray-100' : ''}`}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Aucune donnée de visite disponible
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{
                  filter: activeIndex === index ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' : 'none',
                  opacity: activeIndex === null || activeIndex === index ? 1 : 0.6,
                  transition: 'opacity 0.3s, filter 0.3s',
                  transformOrigin: 'center',
                  transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};