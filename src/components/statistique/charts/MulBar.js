import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSameMonth,
  isSameWeek,
  isSameYear,
  parseISO,
  subYears,
  subWeeks,
  isWithinInterval
} from 'date-fns';

export const MulBar = ({ data, timePeriod, startDate, endDate }) => {
  // Extract all bien types from the data (excluding 'date')
  const bienTypes = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'date') : [];

 

  // Process data based on selected time period
  const processData = () => {
    if (!data || data.length === 0) return [];

    // Parse all dates in the data
    const parsedData = data.map(item => ({
      ...item,
      date: parseISO(item.date),
      originalDate: item.date // Keep original for comparison
    }));

    switch (timePeriod) {
      case 'year':
      case 'last-year': {
        // For current year or last year
        const yearStart = timePeriod === 'last-year' ? subYears(startDate, 1) : startDate;
        const yearEnd = timePeriod === 'last-year' ? subYears(endDate, 1) : endDate;
        
        const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
        return months.map(month => {
          const monthData = { date: format(month, 'MMM yyyy') };
          bienTypes.forEach(type => {
            monthData[type] = parsedData
              .filter(item => isSameMonth(parseISO(item.originalDate), month))
              .reduce((sum, item) => sum + (item[type] || 0), 0);
          });
          return monthData;
        });
      }

      case 'month': {
        // Group by day (1-31)
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        return days.map(day => {
          const dayData = { date: format(day, 'dd') };
          bienTypes.forEach(type => {
            dayData[type] = parsedData
              .filter(item => format(parseISO(item.originalDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
              .reduce((sum, item) => sum + (item[type] || 0), 0);
          });
          return dayData;
        });
      }

      case 'week':
      case 'last-week': {
        // For current week or last week
        const weekStart = timePeriod === 'last-week' ? subWeeks(startOfWeek(startDate), 1) : startOfWeek(startDate);
        const weekEnd = timePeriod === 'last-week' ? subWeeks(endOfWeek(endDate), 1) : endOfWeek(endDate);
        
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
        return weekDays.map(day => {
          const dayData = { 
            date: format(day, 'EEE dd/MM'),
            fullDate: day // For sorting
          };
          bienTypes.forEach(type => {
            dayData[type] = parsedData
              .filter(item => format(parseISO(item.originalDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
              .reduce((sum, item) => sum + (item[type] || 0), 0);
          });
          return dayData;
        }).sort((a, b) => a.fullDate - b.fullDate);
      }

      default:
        return data;
    }
  };

  const chartData = processData();

  // Custom tick formatter based on time period
  const formatTick = (value) => {
    if (timePeriod === 'month') return value; // Just day number
    if (timePeriod === 'week' || timePeriod === 'last-week') return value; // Already formatted
    return value; // For year view
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatTick}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {bienTypes.map(type => (
            <Bar 
              key={type}
              dataKey={type}
              stackId="a"
              fill={colorMap[type] || colorMap.default}
              name={type === 'Appt' ? 'Appartement' : type}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};