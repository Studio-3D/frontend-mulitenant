import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';

export const VentesChart = ({ dateRange }) => {
  // Data sets for different date ranges
  const dataSets = {
    "aujourd'hui": [
      {
        name: '8h',
        ventes: 3,
        objectif: 2,
      },
      {
        name: '10h',
        ventes: 4,
        objectif: 4,
      },
      {
        name: '12h',
        ventes: 7,
        objectif: 6,
      },
      {
        name: '14h',
        ventes: 5,
        objectif: 8,
      },
      {
        name: '16h',
        ventes: 10,
        objectif: 10,
      },
      {
        name: '18h',
        ventes: 12,
        objectif: 12,
      },
    ],
    'cette semaine': [
      {
        name: 'Lun',
        ventes: 12,
        objectif: 10,
      },
      {
        name: 'Mar',
        ventes: 19,
        objectif: 15,
      },
      {
        name: 'Mer',
        ventes: 15,
        objectif: 20,
      },
      {
        name: 'Jeu',
        ventes: 25,
        objectif: 25,
      },
      {
        name: 'Ven',
        ventes: 32,
        objectif: 30,
      },
      {
        name: 'Sam',
        ventes: 18,
        objectif: 15,
      },
      {
        name: 'Dim',
        ventes: 8,
        objectif: 5,
      },
    ],
    'ce mois': [
      {
        name: 'Sem 1',
        ventes: 45,
        objectif: 40,
      },
      {
        name: 'Sem 2',
        ventes: 58,
        objectif: 55,
      },
      {
        name: 'Sem 3',
        ventes: 52,
        objectif: 60,
      },
      {
        name: 'Sem 4',
        ventes: 67,
        objectif: 65,
      },
    ],
    'cette année': [
      {
        name: 'Jan',
        ventes: 120,
        objectif: 100,
      },
      {
        name: 'Fév',
        ventes: 135,
        objectif: 120,
      },
      {
        name: 'Mar',
        ventes: 145,
        objectif: 140,
      },
      {
        name: 'Avr',
        ventes: 162,
        objectif: 160,
      },
      {
        name: 'Mai',
        ventes: 158,
        objectif: 180,
      },
      {
        name: 'Juin',
        ventes: 195,
        objectif: 200,
      },
      {
        name: 'Juil',
        ventes: 210,
        objectif: 220,
      },
      {
        name: 'Août',
        ventes: 185,
        objectif: 190,
      },
      {
        name: 'Sep',
        ventes: 224,
        objectif: 210,
      },
      {
        name: 'Oct',
        ventes: 245,
        objectif: 230,
      },
      {
        name: 'Nov',
        ventes: 258,
        objectif: 250,
      },
      {
        name: 'Déc',
        ventes: 278,
        objectif: 270,
      },
    ],
    'dernière année': [
      {
        name: 'Jan',
        ventes: 110,
        objectif: 90,
      },
      {
        name: 'Fév',
        ventes: 125,
        objectif: 110,
      },
      {
        name: 'Mar',
        ventes: 135,
        objectif: 130,
      },
      {
        name: 'Avr',
        ventes: 152,
        objectif: 150,
      },
      {
        name: 'Mai',
        ventes: 148,
        objectif: 170,
      },
      {
        name: 'Juin',
        ventes: 185,
        objectif: 190,
      },
      {
        name: 'Juil',
        ventes: 200,
        objectif: 210,
      },
      {
        name: 'Août',
        ventes: 175,
        objectif: 180,
      },
      {
        name: 'Sep',
        ventes: 214,
        objectif: 200,
      },
      {
        name: 'Oct',
        ventes: 235,
        objectif: 220,
      },
      {
        name: 'Nov',
        ventes: 248,
        objectif: 240,
      },
      {
        name: 'Déc',
        ventes: 265,
        objectif: 260,
      },
    ],
  };
  const data = dataSets[dateRange];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
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
          wrapperStyle={{
            paddingTop: 10,
          }}
        />
        <defs>
          <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="ventes"
          name="Ventes"
          stroke="#10b981"
          fill="url(#colorVentes)"
          strokeWidth={3}
          activeDot={{
            r: 6,
          }}
        />
        <Line
          type="monotone"
          dataKey="objectif"
          name="Objectif"
          stroke="#6366f1"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{
            r: 0,
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};