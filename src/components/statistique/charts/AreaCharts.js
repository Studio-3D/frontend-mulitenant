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
  isSameDay, 
  startOfYear, 
  endOfYear, 
  eachMonthOfInterval,
  eachDayOfInterval,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  isSameWeek,
  isSameMonth
} from 'date-fns';

export const AreaChart = ({ data = [], startDate, endDate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('default');

  useEffect(() => {
    // Determine the time period type
    const determineTimePeriod = () => {
      const daysDifference = (endDate - startDate) / (1000 * 60 * 60 * 24);
      
      // Check for "Cette semaine" (this week)
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      if (isSameDay(startDate, weekStart) && isSameDay(endDate, weekEnd)) {
        return 'week';
      }
      
      // Check for "Ce mois" (this month)
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      if (isSameDay(startDate, monthStart) && isSameDay(endDate, monthEnd)) {
        return 'month';
      }
      
      // Check for "Ce dernier mois" (last month)
      const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
      const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
      if (isSameDay(startDate, lastMonthStart) && isSameDay(endDate, lastMonthEnd)) {
        return 'last-month';
      }
      
      // Check for full year view
      if (
        startDate.getFullYear() === endDate.getFullYear() &&
        startDate.getMonth() === 0 && 
        startDate.getDate() === 1 &&
        endDate.getMonth() === 11 &&
        endDate.getDate() === 31
      ) {
        return 'year';
      }
      
      return 'default';
    };
    
    setTimePeriod(determineTimePeriod());
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [data, startDate, endDate]);

  const formatXAxis = (date) => {
    if (isSameDay(new Date(date), new Date())) {
      return "Aujourd'hui";
    }
    
    switch (timePeriod) {
      case 'week':
        return format(new Date(date), 'EEEE').substring(0, 3); // Short day name (e.g., "Lun")
      case 'month':
      case 'last-month':
        return format(new Date(date), 'd'); // Just day number (e.g., "15")
      case 'year':
        return format(new Date(date), 'MMM').toLowerCase(); // Short month name (e.g., "JAN")
      default:
        const days = (endDate - startDate) / (1000 * 60 * 60 * 24);
        if (days > 30) {
          return format(new Date(date), 'MMM yyyy');
        } else if (days > 7) {
          return format(new Date(date), 'd MMM');
        } else {
          return format(new Date(date), 'EEEE').substring(0, 3);
        }
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3  shadow-md rounded-md border border-gray-100">
          <p className="text-xs text-gray-600 mb-1">
            {timePeriod === 'week' && format(new Date(label), 'EEEE d MMMM yyyy')}
            {timePeriod === 'month' && format(new Date(label), 'd MMMM yyyy')}
            {timePeriod === 'last-month' && format(new Date(label), 'd MMMM yyyy')}
            {timePeriod === 'year' && format(new Date(label), 'MMMM yyyy')}
            {timePeriod === 'default' && format(new Date(label), 'PPP')}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm "
              style={{ color: entry.color }}
            >
              <span className="font-medium">{entry.name}: </span>
              {entry.value.toLocaleString('fr-FR')} DH
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Generate appropriate data points based on time period
  const getPeriodData = () => {
    switch (timePeriod) {
      case 'week':
        // Group by day for week view
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        return days.map(day => {
          const dayData = data.find(d => isSameDay(new Date(d.date), day));
          return dayData || {
            date: day,
            Encaissements: 0,
            Remboursements: 0
          };
        });
        
      case 'month':
      case 'last-month':
        // Group by day for month view
        const monthDays = eachDayOfInterval({ start: startDate, end: endDate });
        return monthDays.map(day => {
          const dayData = data.find(d => isSameDay(new Date(d.date), day));
          return dayData || {
            date: day,
            Encaissements: 0,
            Remboursements: 0
          };
        });
        
      case 'year':
        // Group by month for year view
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        return months.map(month => {
          const monthData = data.find(d => 
            isSameMonth(new Date(d.date), month) && 
            new Date(d.date).getFullYear() === month.getFullYear()
          );
          return monthData || {
            date: month,
            Encaissements: 0,
            Remboursements: 0
          };
        });
        
      default:
        // Default behavior - use data as is
        return data;
    }
  };

  const chartData = getPeriodData();

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Aucun Encaissements-Remboursements enregistré pour cette période
          </p>
        </div>
      </div>
    );
  }

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
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={chartData}
          margin={{ top: 13, right: 10, left: 13, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorEncaissements" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRemboursements" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
            interval={timePeriod === 'year' ? 0 : 'preserveStartEnd'}
          />
          <YAxis
            tickFormatter={(value) => `${value.toLocaleString('fr-FR')} DH`}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="Encaissements"
            stroke="#10B981"
            fillOpacity={1}
            fill="url(#colorEncaissements)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Remboursements"
            stroke="#EF4444"
            fillOpacity={1}
            fill="url(#colorRemboursements)"
            strokeWidth={2}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};