import React, { useEffect, useState, useMemo } from 'react';
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
  isSameDay,
  isSameWeek,
  parseISO,
  subYears,
  subMonths,
  subWeeks,
  addDays,
  getDaysInMonth,
  isWithinInterval,
  isValid
} from 'date-fns';

export const MulBar = ({ data = [], startDate, endDate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [processedData, setProcessedData] = useState([]);

  // Memoize the date values to prevent unnecessary recalculations
  const safeStartDate = useMemo(() => isValid(startDate) ? startDate : new Date(), [startDate]);
  const safeEndDate = useMemo(() => isValid(endDate) ? endDate : new Date(), [endDate]);

  // Memoize the time period calculation
  const timePeriod = useMemo(() => {
    const daysDifference = (safeEndDate - safeStartDate) / (1000 * 60 * 60 * 24);
    
    // Check for current week
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    if (isSameDay(safeStartDate, weekStart) && isSameDay(safeEndDate, weekEnd)) {
      return 'week';
    }
    
    // Check for current month
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    if (isSameDay(safeStartDate, monthStart) && isSameDay(safeEndDate, monthEnd)) {
      return 'month';
    }
    
    // Check for last month
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
    if (isSameDay(safeStartDate, lastMonthStart) && isSameDay(safeEndDate, lastMonthEnd)) {
      return 'last-month';
    }
    
    // Check for full year view
    if (
      safeStartDate.getFullYear() === safeEndDate.getFullYear() &&
      safeStartDate.getMonth() === 0 && 
      safeStartDate.getDate() === 1 &&
      safeEndDate.getMonth() === 11 &&
      safeEndDate.getDate() === 31
    ) {
      return 'year';
    }
    
    return 'default';
  }, [safeStartDate, safeEndDate]);

  // Extract all bien types from the data (excluding 'date')
  const bienTypes = useMemo(() => 
    data.length > 0 ? 
      Object.keys(data[0]).filter(key => key !== 'date' && key !== 'originalDate') : 
      []
  , [data]);

  // Color mapping for each bien type
  const colorMap = {
    Mag: '#8884d8',
    Appt: '#82ca9d',
    Studio: '#ffc658',
    Villa: '#ff8042',
    default: '#8dd1e1'
  };

  // Process data only when dependencies change
  useEffect(() => {
    const processData = () => {
      if (!data || data.length === 0) return [];

      // Parse and validate dates in the data
      const parsedData = data.map(item => {
        const date = parseISO(item.date);
        return {
          ...item,
          date: isValid(date) ? date : new Date(),
          originalDate: item.date
        };
      });

      switch (timePeriod) {
        case 'week': {
          const days = eachDayOfInterval({ 
            start: safeStartDate, 
            end: safeEndDate 
          });
          return days.map(day => {
            const dayData = { 
              date: day,
              displayDate: format(day, 'EEE').substring(0, 3)
            };
            bienTypes.forEach(type => {
              dayData[type] = parsedData
                .filter(item => isSameDay(item.date, day))
                .reduce((sum, item) => sum + (Number(item[type]) || 0), 0);
            });
            return dayData;
          });
        }

        case 'month':
        case 'last-month': {
          const days = eachDayOfInterval({ 
            start: safeStartDate, 
            end: safeEndDate 
          });
          return days.map(day => {
            const dayData = { 
              date: day,
              displayDate: format(day, 'd')
            };
            bienTypes.forEach(type => {
              dayData[type] = parsedData
                .filter(item => isSameDay(item.date, day))
                .reduce((sum, item) => sum + (Number(item[type]) || 0), 0);
            });
            return dayData;
          });
        }

        case 'year': {
          const months = eachMonthOfInterval({ 
            start: safeStartDate, 
            end: safeEndDate 
          });
          return months.map(month => {
            const monthData = { 
              date: month,
              displayDate: format(month, 'MMM').toLowerCase()
            };
            bienTypes.forEach(type => {
              monthData[type] = parsedData
                .filter(item => isSameMonth(item.date, month))
                .reduce((sum, item) => sum + (Number(item[type]) || 0), 0);
            });
            return monthData;
          });
        }

        default: {
          const daysDifference = (safeEndDate - safeStartDate) / (1000 * 60 * 60 * 24);
          
          if (daysDifference <= 31) {
            const days = eachDayOfInterval({ 
              start: safeStartDate, 
              end: safeEndDate 
            });
            return days.map(day => {
              const dayData = { 
                date: day,
                displayDate: daysDifference > 7 ? 
                  format(day, 'd MMM') : 
                  format(day, 'EEE').substring(0, 3)
              };
              bienTypes.forEach(type => {
                dayData[type] = parsedData
                  .filter(item => isSameDay(item.date, day))
                  .reduce((sum, item) => sum + (Number(item[type]) || 0), 0);
              });
              return dayData;
            });
          } else if (daysDifference <= 90) {
            const weeks = eachWeekOfInterval({ 
              start: safeStartDate, 
              end: safeEndDate 
            }, { weekStartsOn: 1 });
            return weeks.map(week => {
              const weekData = { 
                date: week,
                displayDate: format(week, 'ww (d MMM)')
              };
              bienTypes.forEach(type => {
                weekData[type] = parsedData
                  .filter(item => isWithinInterval(item.date, {
                    start: startOfWeek(week),
                    end: endOfWeek(week)
                  }))
                  .reduce((sum, item) => sum + (Number(item[type]) || 0), 0);
              });
              return weekData;
            });
          } else {
            const months = eachMonthOfInterval({ 
              start: safeStartDate, 
              end: safeEndDate 
            });
            return months.map(month => {
              const monthData = { 
                date: month,
                displayDate: format(month, 'MMM yyyy')
              };
              bienTypes.forEach(type => {
                monthData[type] = parsedData
                  .filter(item => isSameMonth(item.date, month))
                  .reduce((sum, item) => sum + (Number(item[type]) || 0), 0);
              });
              return monthData;
            });
          }
        }
      }
    };

    const result = processData();
    setProcessedData(result);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [data, timePeriod, safeStartDate, safeEndDate, bienTypes]);

  // Rest of your component remains the same...
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const tooltipDate = payload[0]?.payload?.date;
      const isValidDate = tooltipDate && isValid(tooltipDate);

      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-100">
          {isValidDate && (
            <p className="text-xs text-gray-600 mb-1">
              {timePeriod === 'week' && format(tooltipDate, 'EEEE d MMMM yyyy')}
              {timePeriod === 'month' && format(tooltipDate, 'd MMMM yyyy')}
              {timePeriod === 'last-month' && format(tooltipDate, 'd MMMM yyyy')}
              {timePeriod === 'year' && format(tooltipDate, 'MMMM yyyy')}
              {timePeriod === 'default' && format(tooltipDate, 'PPP')}
            </p>
          )}
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              <span className="font-medium">
                {entry.name === 'Appt' ? 'Appartement' : entry.name}: 
              </span>
              {entry.value.toLocaleString('fr-FR')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!processedData || processedData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Aucune donnée disponible pour cette période
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
    <div className="h-[380px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          padding={0}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="displayDate"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
            interval={timePeriod === 'year' ? 0 : 'preserveStartEnd'}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
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