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

export const DesistementChart = ({ dateRange }) => {
  // Aggregate data for different date ranges
  const getAggregatedData = () => {
    const dataSets = {
      "aujourd'hui": [
        {
          name: '8h',
          definitif: 1,
          profit: 0,
          changement: 0,
        },
        {
          name: '10h',
          definitif: 0,
          profit: 1,
          changement: 1,
        },
        {
          name: '12h',
          definitif: 2,
          profit: 1,
          changement: 0,
        },
        {
          name: '14h',
          definitif: 1,
          profit: 0,
          changement: 2,
        },
        {
          name: '16h',
          definitif: 0,
          profit: 2,
          changement: 1,
        },
        {
          name: '18h',
          definitif: 1,
          profit: 1,
          changement: 0,
        },
      ],
      'cette semaine': [
        {
          name: 'Lun',
          definitif: 3,
          profit: 2,
          changement: 1,
        },
        {
          name: 'Mar',
          definitif: 2,
          profit: 3,
          changement: 2,
        },
        {
          name: 'Mer',
          definitif: 4,
          profit: 1,
          changement: 3,
        },
        {
          name: 'Jeu',
          definitif: 1,
          profit: 4,
          changement: 2,
        },
        {
          name: 'Ven',
          definitif: 2,
          profit: 2,
          changement: 4,
        },
      ],
      'ce mois': [
        {
          name: 'Sem 1',
          definitif: 8,
          profit: 6,
          changement: 5,
        },
        {
          name: 'Sem 2',
          definitif: 7,
          profit: 9,
          changement: 7,
        },
        {
          name: 'Sem 3',
          definitif: 10,
          profit: 5,
          changement: 8,
        },
        {
          name: 'Sem 4',
          definitif: 6,
          profit: 8,
          changement: 9,
        },
      ],
      'cette année': [
        {
          name: 'Jan',
          definitif: 20,
          profit: 15,
          changement: 10,
        },
        {
          name: 'Fév',
          definitif: 18,
          profit: 17,
          changement: 12,
        },
        {
          name: 'Mar',
          definitif: 22,
          profit: 14,
          changement: 15,
        },
        {
          name: 'Avr',
          definitif: 16,
          profit: 20,
          changement: 13,
        },
        {
          name: 'Mai',
          definitif: 19,
          profit: 18,
          changement: 16,
        },
        {
          name: 'Juin',
          definitif: 21,
          profit: 16,
          changement: 18,
        },
      ],
      'dernière année': [
        {
          name: 'Jan',
          definitif: 18,
          profit: 13,
          changement: 9,
        },
        {
          name: 'Fév',
          definitif: 16,
          profit: 15,
          changement: 11,
        },
        {
          name: 'Mar',
          definitif: 20,
          profit: 12,
          changement: 14,
        },
        {
          name: 'Avr',
          definitif: 14,
          profit: 18,
          changement: 12,
        },
        {
          name: 'Mai',
          definitif: 17,
          profit: 16,
          changement: 15,
        },
        {
          name: 'Juin',
          definitif: 19,
          profit: 14,
          changement: 17,
        },
      ],
    };
    const data = dataSets[dateRange];
    // Sum up the values for each category
    let totalDefinitif = 0;
    let totalProfit = 0;
    let totalChangement = 0;
    data.forEach((item) => {
      totalDefinitif += item.definitif;
      totalProfit += item.profit;
      totalChangement += item.changement;
    });
    return [
      {
        name: 'Désistement Définitif',
        value: totalDefinitif,
      },
      {
        name: 'Désistements Au Profit',
        value: totalProfit,
      },
      {
        name: 'Changement de Bien',
        value: totalChangement,
      },
    ];
  };
  const data = getAggregatedData();
  const COLORS = ['#f97316', '#0ea5e9', '#14b8a6'];
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props;
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
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          activeShape={renderActiveShape}
          animationDuration={1000}
          animationBegin={0}
        >
          {data.map((entry, index) => (
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
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconSize={10}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};