import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const EncaissementChart = ({ dateRange }) => {
  // Data sets for different date ranges
  const dataSets = {
    "aujourd'hui": [
      {
        name: '8h',
        amount: 1200,
      },
      {
        name: '10h',
        amount: 1800,
      },
      {
        name: '12h',
        amount: 2400,
      },
      {
        name: '14h',
        amount: 1500,
      },
      {
        name: '16h',
        amount: 2100,
      },
      {
        name: '18h',
        amount: 1900,
      },
    ],
    'cette semaine': [
      {
        name: 'Lun',
        amount: 4000,
      },
      {
        name: 'Mar',
        amount: 3500,
      },
      {
        name: 'Mer',
        amount: 5000,
      },
      {
        name: 'Jeu',
        amount: 2780,
      },
      {
        name: 'Ven',
        amount: 3890,
      },
      {
        name: 'Sam',
        amount: 2390,
      },
      {
        name: 'Dim',
        amount: 1490,
      },
    ],
    'ce mois': [
      {
        name: 'Sem 1',
        amount: 15000,
      },
      {
        name: 'Sem 2',
        amount: 18000,
      },
      {
        name: 'Sem 3',
        amount: 12000,
      },
      {
        name: 'Sem 4',
        amount: 21000,
      },
    ],
    'cette année': [
      {
        name: 'Jan',
        amount: 45000,
      },
      {
        name: 'Fév',
        amount: 38000,
      },
      {
        name: 'Mar',
        amount: 52000,
      },
      {
        name: 'Avr',
        amount: 37000,
      },
      {
        name: 'Mai',
        amount: 41000,
      },
      {
        name: 'Juin',
        amount: 47000,
      },
      {
        name: 'Juil',
        amount: 36000,
      },
      {
        name: 'Août',
        amount: 28000,
      },
      {
        name: 'Sep',
        amount: 49000,
      },
      {
        name: 'Oct',
        amount: 53000,
      },
      {
        name: 'Nov',
        amount: 48000,
      },
      {
        name: 'Déc',
        amount: 61000,
      },
    ],
    'dernière année': [
      {
        name: 'Jan',
        amount: 42000,
      },
      {
        name: 'Fév',
        amount: 35000,
      },
      {
        name: 'Mar',
        amount: 48000,
      },
      {
        name: 'Avr',
        amount: 32000,
      },
      {
        name: 'Mai',
        amount: 38000,
      },
      {
        name: 'Juin',
        amount: 44000,
      },
      {
        name: 'Juil',
        amount: 33000,
      },
      {
        name: 'Août',
        amount: 25000,
      },
      {
        name: 'Sep',
        amount: 45000,
      },
      {
        name: 'Oct',
        amount: 49000,
      },
      {
        name: 'Nov',
        amount: 43000,
      },
      {
        name: 'Déc',
        amount: 58000,
      },
    ],
  };
  const data = dataSets[dateRange];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#f0f0f0"
        />
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `€${value}`}
        />
        <Tooltip
          formatter={(value) => [`€${value}`, 'Montant']}
          contentStyle={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: 'none',
          }}
          labelStyle={{
            fontWeight: 'bold',
          }}
        />
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <Bar
          dataKey="amount"
          fill="url(#colorAmount)"
          radius={[4, 4, 0, 0]}
          barSize={
            dateRange === "aujourd'hui" || dateRange === 'cette semaine'
              ? 30
              : 40
          }
          animationDuration={1000}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};