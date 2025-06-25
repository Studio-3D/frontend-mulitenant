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

export const AppelsChart = ({ dateRange }) => {
  // Aggregate data for different date ranges
  const getAggregatedData = () => {
    const dataSets = {
      "aujourd'hui": [
        {
          name: '8h',
          entrants: 3,
          sortants: 5,
          manques: 1,
        },
        {
          name: '10h',
          entrants: 5,
          sortants: 8,
          manques: 2,
        },
        {
          name: '12h',
          entrants: 4,
          sortants: 6,
          manques: 1,
        },
        {
          name: '14h',
          entrants: 6,
          sortants: 4,
          manques: 2,
        },
        {
          name: '16h',
          entrants: 7,
          sortants: 9,
          manques: 0,
        },
        {
          name: '18h',
          entrants: 4,
          sortants: 7,
          manques: 1,
        },
      ],
      'cette semaine': [
        {
          name: 'Lun',
          entrants: 12,
          sortants: 18,
          manques: 4,
        },
        {
          name: 'Mar',
          entrants: 15,
          sortants: 22,
          manques: 2,
        },
        {
          name: 'Mer',
          entrants: 10,
          sortants: 16,
          manques: 6,
        },
        {
          name: 'Jeu',
          entrants: 18,
          sortants: 14,
          manques: 3,
        },
        {
          name: 'Ven',
          entrants: 20,
          sortants: 25,
          manques: 5,
        },
      ],
      'ce mois': [
        {
          name: 'Sem 1',
          entrants: 55,
          sortants: 75,
          manques: 15,
        },
        {
          name: 'Sem 2',
          entrants: 62,
          sortants: 80,
          manques: 12,
        },
        {
          name: 'Sem 3',
          entrants: 58,
          sortants: 72,
          manques: 18,
        },
        {
          name: 'Sem 4',
          entrants: 65,
          sortants: 85,
          manques: 14,
        },
      ],
      'cette année': [
        {
          name: 'T1',
          entrants: 480,
          sortants: 620,
          manques: 95,
        },
        {
          name: 'T2',
          entrants: 520,
          sortants: 680,
          manques: 85,
        },
        {
          name: 'T3',
          entrants: 490,
          sortants: 640,
          manques: 105,
        },
        {
          name: 'T4',
          entrants: 550,
          sortants: 700,
          manques: 90,
        },
      ],
      'dernière année': [
        {
          name: 'T1',
          entrants: 450,
          sortants: 590,
          manques: 85,
        },
        {
          name: 'T2',
          entrants: 490,
          sortants: 650,
          manques: 75,
        },
        {
          name: 'T3',
          entrants: 460,
          sortants: 610,
          manques: 95,
        },
        {
          name: 'T4',
          entrants: 520,
          sortants: 670,
          manques: 80,
        },
      ],
    };
    const data = dataSets[dateRange];
    // Sum up the values for each category
    let totalEntrants = 0;
    let totalSortants = 0;
    let totalManques = 0;
    data.forEach((item) => {
      totalEntrants += item.entrants;
      totalSortants += item.sortants;
      totalManques += item.manques;
    });
    return [
      {
        name: 'Appels entrants',
        value: totalEntrants,
      },
      {
        name: 'Appels sortants',
        value: totalSortants,
      },
      {
        name: 'Appels manqués',
        value: totalManques,
      },
    ];
  };
  const data = getAggregatedData();
  const COLORS = ['#4f46e5', '#0ea5e9', '#f43f5e'];
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