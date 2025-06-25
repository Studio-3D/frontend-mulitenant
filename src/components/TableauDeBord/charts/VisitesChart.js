import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const VisitesChart = ({ dateRange }) => {
  // Data sets for different date ranges
  const dataSets = {
    "aujourd'hui": [
      {
        name: '8h',
        interesses: 2,
        perdus: 1,
        receptifs: 2,
      },
      {
        name: '10h',
        interesses: 3,
        perdus: 2,
        receptifs: 3,
      },
      {
        name: '12h',
        interesses: 4,
        perdus: 1,
        receptifs: 2,
      },
      {
        name: '14h',
        interesses: 1,
        perdus: 2,
        receptifs: 1,
      },
      {
        name: '16h',
        interesses: 3,
        perdus: 1,
        receptifs: 2,
      },
      {
        name: '18h',
        interesses: 2,
        perdus: 1,
        receptifs: 0,
      },
    ],
    'cette semaine': [
      {
        name: 'Lun',
        interesses: 8,
        perdus: 4,
        receptifs: 6,
      },
      {
        name: 'Mar',
        interesses: 10,
        perdus: 5,
        receptifs: 8,
      },
      {
        name: 'Mer',
        interesses: 7,
        perdus: 6,
        receptifs: 5,
      },
      {
        name: 'Jeu',
        interesses: 12,
        perdus: 4,
        receptifs: 7,
      },
      {
        name: 'Ven',
        interesses: 8,
        perdus: 6,
        receptifs: 4,
      },
    ],
    'ce mois': [
      {
        name: 'Sem 1',
        interesses: 35,
        perdus: 20,
        receptifs: 25,
      },
      {
        name: 'Sem 2',
        interesses: 40,
        perdus: 18,
        receptifs: 28,
      },
      {
        name: 'Sem 3',
        interesses: 28,
        perdus: 22,
        receptifs: 24,
      },
      {
        name: 'Sem 4',
        interesses: 45,
        perdus: 15,
        receptifs: 30,
      },
    ],
    'cette année': [
      {
        name: 'Jan',
        interesses: 120,
        perdus: 80,
        receptifs: 90,
      },
      {
        name: 'Fév',
        interesses: 135,
        perdus: 75,
        receptifs: 110,
      },
      {
        name: 'Mar',
        interesses: 145,
        perdus: 85,
        receptifs: 95,
      },
      {
        name: 'Avr',
        interesses: 162,
        perdus: 68,
        receptifs: 120,
      },
      {
        name: 'Mai',
        interesses: 158,
        perdus: 78,
        receptifs: 105,
      },
      {
        name: 'Juin',
        interesses: 195,
        perdus: 65,
        receptifs: 125,
      },
    ],
    'dernière année': [
      {
        name: 'Jan',
        interesses: 110,
        perdus: 75,
        receptifs: 85,
      },
      {
        name: 'Fév',
        interesses: 125,
        perdus: 70,
        receptifs: 100,
      },
      {
        name: 'Mar',
        interesses: 135,
        perdus: 80,
        receptifs: 90,
      },
      {
        name: 'Avr',
        interesses: 150,
        perdus: 65,
        receptifs: 110,
      },
      {
        name: 'Mai',
        interesses: 148,
        perdus: 72,
        receptifs: 95,
      },
      {
        name: 'Juin',
        interesses: 180,
        perdus: 60,
        receptifs: 115,
      },
    ],
  };
  const data = dataSets[dateRange];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        barGap={4}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#f0f0f0"
        />
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip
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
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{
            paddingTop: 10,
          }}
        />
        <Bar
          dataKey="interesses"
          name="Intéressés"
          fill="#8b5cf6"
          radius={[4, 4, 0, 0]}
          barSize={
            dateRange === "aujourd'hui" || dateRange === 'cette semaine'
              ? 18
              : 24
          }
        />
        <Bar
          dataKey="perdus"
          name="Perdus"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
          barSize={
            dateRange === "aujourd'hui" || dateRange === 'cette semaine'
              ? 18
              : 24
          }
        />
        <Bar
          dataKey="receptifs"
          name="Réceptifs"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          barSize={
            dateRange === "aujourd'hui" || dateRange === 'cette semaine'
              ? 18
              : 24
          }
        />
      </BarChart>
    </ResponsiveContainer>
  );
};