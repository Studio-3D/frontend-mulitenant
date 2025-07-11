"use client"

import { useEffect, useState } from 'react';
import { AlertCircleIcon } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis
} from "recharts"
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
  isSameMonth,
  parse
} from "date-fns"
import { fr } from "date-fns/locale"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  "Désistement Définitif": {
    label: "Désistement Définitif",
    color: "#0088FE",
  },
  "Désistement au Profit": {
    label: "Désistement au Profit",
    color: "#00C49F",
  },
  "Changement de Bien": {
    label: "Changement de Bien",
    color: "#FFBB28",
  },
}

export function DesistementChart({ data = [], startDate, endDate }) {
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('default');
  const [isMobile, setIsMobile] = useState(false);

  const zeros = {
    "Désistement Définitif": 0,
    "Désistement au Profit": 0,
    "Changement de Bien": 0
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's 'sm' breakpoint
    };
    
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const determineTimePeriod = () => {
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      if (isSameDay(startDate, weekStart) && isSameDay(endDate, weekEnd)) {
        return 'week';
      }

      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      if (isSameDay(startDate, monthStart) && isSameDay(endDate, monthEnd)) {
        return 'month';
      }

      const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
      const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
      if (isSameDay(startDate, lastMonthStart) && isSameDay(endDate, lastMonthEnd)) {
        return 'last-month';
      }

      const startOfYearDate = startOfYear(new Date(startDate.getFullYear(), 0, 1));
      const endOfYearDate = endOfYear(new Date(endDate.getFullYear(), 11, 31));

      if (isSameDay(startDate, startOfYearDate) && isSameDay(endDate, endOfYearDate) && startDate.getFullYear() === endDate.getFullYear()) {
         return 'year';
      }

      return 'default';
    };

    const period = determineTimePeriod();
    setTimePeriod(period);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [data, startDate, endDate]);

  const getDateRangeLabel = () => {
    switch (timePeriod) {
      case "week":
        return "cette semaine";
      case "month":
        return "ce mois";
      case "last-month":
        return "le mois dernier";
      case "year":
        return "cette année";
      default:
        if (startDate.getFullYear() === endDate.getFullYear() &&
            startDate.getMonth() === 0 && startDate.getDate() === 1 &&
            endDate.getMonth() === 11 && endDate.getDate() === 31) {
            return `en ${startDate.getFullYear()}`;
        }
        return `du ${format(startDate, 'dd/MM/yyyy')} au ${format(endDate, 'dd/MM/yyyy')}`;
    }
  };

  const transformData = () => {
    const generatePeriodData = () => {
      switch (timePeriod) {
        case 'week':
          const weekDays = eachDayOfInterval({ start: startDate, end: endDate });
          const weekChartData = weekDays.map(day => {
            const result = { ...zeros };
            data.forEach(item => {
                const parsedItemDate = parse(item.date, 'dd-MM-yyyy', new Date());
                if (isSameDay(parsedItemDate, day)) {
                    result[item.typeDesistement] += item.nombre || 0;
                }
            });
            return {
              date: day,
              name: format(day, 'd', { locale: fr }).substring(0, 3),
              ...result
            };
          });
          return weekChartData;

        case 'month':
        case 'last-month':
          const monthDays = eachDayOfInterval({ start: startDate, end: endDate });
          const monthChartData = monthDays.map(day => {
            const result = { ...zeros };
            data.forEach(item => {
                const parsedItemDate = parse(item.date, 'dd-MM-yyyy', new Date());
                if (isSameDay(parsedItemDate, day)) {
                    result[item.typeDesistement] += item.nombre || 0;
                }
            });
            return {
              date: day,
              name: format(day, 'd'), 
              ...result
            };
          });
          return monthChartData;

        case 'year':
          const currentYearStart = startOfYear(startDate);
          const currentYearEnd = endOfYear(endDate);

          const allMonthsInYear = eachMonthOfInterval({ start: currentYearStart, end: currentYearEnd });
          const aggregatedDataByMonth = {};

          allMonthsInYear.forEach(month => {
            const monthKey = format(month, 'yyyy-MM');
            aggregatedDataByMonth[monthKey] = {
              date: month,
              name: format(month, 'MMM', { locale: fr }).toLowerCase(),
              ...zeros
            };
          });

          data.forEach(item => {
            const parsedItemDate = parse(item.date, 'dd-MM-yyyy', new Date());
            if (parsedItemDate.getFullYear() === currentYearStart.getFullYear()) {
                const monthKey = format(parsedItemDate, 'yyyy-MM');
                if (aggregatedDataByMonth[monthKey]) {
                aggregatedDataByMonth[monthKey][item.typeDesistement] += item.nombre || 0;
                }
            }
          });

          const finalYearlyData = Object.values(aggregatedDataByMonth);
          return finalYearlyData;

        default:
          const daysInDefaultRange = eachDayOfInterval({ start: startDate, end: endDate });
          const defaultChartData = daysInDefaultRange.map(day => {
            const result = { ...zeros };
            data.forEach(item => {
                const parsedItemDate = parse(item.date, 'dd-MM-yyyy', new Date());
                if (isSameDay(parsedItemDate, day)) {
                    result[item.typeDesistement] += item.nombre || 0;
                }
            });

            let nameFormat = 'd MMM';
            const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
            if (daysDiff > 30) nameFormat = 'MMM yy';
            else if (daysDiff <= 7) nameFormat = 'EEE';

            return {
              date: day,
              name: format(day, nameFormat, { locale: fr }),
              ...result
            };
          });
          return defaultChartData;
      }
    };
    return generatePeriodData();
  };

  const calculateMobileInterval = () => {
    if (!isMobile) return 0; // Show all labels on desktop
    
    switch(timePeriod) {
      case 'week':
        return 1; // Show every other day for week view
      case 'month':
      case 'last-month':
        return 4; // Show ~7 labels for month view
      case 'year':
        return 0; // Show all months
      default:
        return 2; // Default spacing for custom ranges
    }
  };

  const dateRangeLabel = getDateRangeLabel();
  const chartData = transformData();

  if (isLoading) {
    return (
      <Card className='border-none shadow-none'>
        <CardHeader>
          <CardTitle>Désistements</CardTitle>
          <CardDescription>Chargement des données...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasActualData = chartData.some(dayData =>
    Object.keys(zeros).some(key => dayData[key] > 0)
  );

  if (!hasActualData) {
    return (
      <Card className='border-none shadow-none'>
        <CardHeader>
          <CardTitle>Désistements</CardTitle>
          <CardDescription>Aucun désistement enregistré {dateRangeLabel}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertCircleIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">Aucun désistement enregistré pour cette période</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6">
        <div className="flex flex-col space-y-2">
          <CardTitle>
            <h2 className="font-semibold mb-4 text-lg text-gray-700 flex items-center">
              Désistements
            </h2>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Affichage du total des désistements {dateRangeLabel}
          </CardDescription>
        </div>

        <div className="hidden sm:flex gap-4">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs sm:text-sm">{config.label}</span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:px-4">
        <ChartContainer config={chartConfig} className="xl:h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barCategoryGap={isMobile ? '10%' : '5%'}
              barGap={isMobile ? 2 : 5}
              margin={{ left: 0, right: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={12}
                axisLine={false}
                tick={{ fontSize: '0.75rem' }}
                type="category"
                interval={calculateMobileInterval()}
                minTickGap={isMobile ? 5 : 1}
                padding={{ left: 0, right: 10 }}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed"  labelFormatter={(label, payload) => {
                 if (payload && payload.length > 0) {
                    const dateObject = payload[0].payload.date;
                    if (dateObject instanceof Date) {
                    if (timePeriod === 'year') {
                        return format(dateObject, 'MMMM yyyy', { locale: fr }); 
                    } else {
                        return format(dateObject, 'dd MMMM yyyy', { locale: fr }); 
                    }
                    }
                }
                return label; 
                }}/>}
              />
              {Object.keys(chartConfig).map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={chartConfig[key].color}
                  radius={[4, 4, 0, 0]}
                  barSize={10} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}