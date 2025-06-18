import React, { useEffect, useState } from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  isSameDay,
} from 'date-fns';

export const AreaChart = ({ startDate, endDate }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Generate data based on selected date range
    const generateData = () => {
      const interval = {
        start: startDate,
        end: endDate,
      };
      let dates = [];
      // If range is more than 30 days, use weekly data points
      if (eachDayOfInterval(interval).length > 30) {
        dates = eachWeekOfInterval(interval);
      } else {
        dates = eachDayOfInterval(interval);
      }
      return dates.map((date) => {
        // Generate realistic looking data
        const dayOfMonth = date.getDate();
        const baseValue = 1000 + Math.sin(dayOfMonth / 5) * 400;
        const random = Math.random() * 200 - 100;
        return {
          date,
          Ventes: Math.round(baseValue + random),
          Prévisions: Math.round(baseValue * 1.1 + Math.random() * 100),
        };
      });
    };
    // Simulate API call
    const timer = setTimeout(() => {
      setData(generateData());
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [startDate, endDate]);

  const formatXAxis = (date) => {
    // If today, show "Aujourd'hui"
    if (isSameDay(new Date(date), new Date())) {
      return "Aujourd'hui";
    }
    // Format based on range length
    const days = eachDayOfInterval({
      start: startDate,
      end: endDate,
    }).length;
    if (days > 30) {
      return format(new Date(date), 'MMM yyyy');
    } else if (days > 7) {
      return format(new Date(date), 'd MMM');
    } else {
      return format(new Date(date), 'EEEE').substring(0, 3);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-100">
          <p className="text-xs text-gray-600 mb-1">
            {format(new Date(label), 'PPP')}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm"
              style={{
                color: entry.color,
              }}
            >
              <span className="font-medium">{entry.name}: </span>
              {entry.value.toLocaleString('fr-FR')} €
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-500">
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPrevisions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f0f0f0"
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{
              fontSize: 12,
              fill: '#6B7280',
            }}
            axisLine={{
              stroke: '#E5E7EB',
            }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value) => `${value}€`}
            tick={{
              fontSize: 12,
              fill: '#6B7280',
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="Ventes"
            stroke="#3B82F6"
            fillOpacity={1}
            fill="url(#colorVentes)"
            strokeWidth={2}
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="Prévisions"
            stroke="#10B981"
            fillOpacity={1}
            fill="url(#colorPrevisions)"
            strokeWidth={2}
            strokeDasharray="5 5"
            animationDuration={1000}
            animationBegin={300}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};