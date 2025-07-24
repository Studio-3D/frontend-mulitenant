"use client";

import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  format, 
  isSameYear, 
  isSameMonth, 
  isSameDay, 
  differenceInDays,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear
} from "date-fns";
import { fr } from "date-fns/locale";

const chartConfig = {
  encaissement: {
    label: "Encaissement",
    color: "#2CAFFE",
  },
};

function parseDateWithoutTimezone(dateString) {
  const [year, month, day] = dateString.split('-');
  return new Date(year, month - 1, day);
}

export function EncaissementChart({ startDate, endDate, data }) {
  const { chartData, total, description } = useMemo(() => {
    if (!data) return { chartData: [], total: 0, description: "Affichage des encaissements" };

    // Create a map of the data for easy lookup
    const dataMap = new Map();
    data.forEach(([dateStr, amount]) => {
      const date = parseDateWithoutTimezone(dateStr);
      const dateKey = format(date, 'yyyy-MM-dd');
      dataMap.set(dateKey, amount);
    });

    // Determine the appropriate grouping based on date range
    let groupBy = 'day';
    let rangeDescription;
    
    if (isSameDay(startDate, endDate)) {
      groupBy = 'day';
      rangeDescription = `Affichage des encaissements pour le ${format(startDate, 'd MMMM yyyy', { locale: fr })}`;
    } else if (differenceInDays(endDate, startDate) <= 7) {
      groupBy = 'day';
      rangeDescription = `Affichage des encaissements pour cette semaine du ${format(startDate, 'd MMMM', { locale: fr })} au ${format(endDate, 'd MMMM yyyy', { locale: fr })}`;
    } else if (isSameMonth(startDate, endDate)) {
      groupBy = 'day';
      rangeDescription = `Affichage des encaissements pour ${format(startDate, 'MMMM yyyy', { locale: fr })}`;
    } else if (isSameYear(startDate, endDate)) {
      groupBy = 'month';
      rangeDescription = `Affichage des encaissements pour ${format(startDate, 'yyyy', { locale: fr })}`;
    } else {
      groupBy = 'month';
      rangeDescription = `Affichage des encaissements du ${format(startDate, 'd MMMM yyyy', { locale: fr })} au ${format(endDate, 'd MMMM yyyy', { locale: fr })}`;
    }

    let processedData = [];
    let totalAmount = 0;

    if (groupBy === 'month') {
      // Generate all months in the range
      const months = eachMonthOfInterval({
        start: startOfYear(startDate),
        end: endOfYear(endDate)
      });

      processedData = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const monthKey = format(month, 'yyyy-MM');
        
        // Sum all data points within this month
        let amount = 0;
        data.forEach(([dateStr, value]) => {
          const date = parseDateWithoutTimezone(dateStr);
          if (date >= monthStart && date <= monthEnd) {
            amount += value;
          }
        });

        totalAmount += amount;

        return {
          name: format(month, 'MMM', { locale: fr }),
          amount,
          fullDate: format(month, 'MMMM yyyy', { locale: fr })
        };
      });
    } 
    else if (groupBy === 'week') {
      // Generate all weeks in the range
      const weeks = eachWeekOfInterval({
        start: startDate,
        end: endDate
      }, { weekStartsOn: 1 });

      processedData = weeks.map(weekStart => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const weekKey = format(weekStart, 'yyyy-ww');
        
        // Sum all data points within this week
        let amount = 0;
        data.forEach(([dateStr, value]) => {
          const date = parseDateWithoutTimezone(dateStr);
          if (date >= weekStart && date <= weekEnd) {
            amount += value;
          }
        });

        totalAmount += amount;

        return {
          name: `S${format(weekStart, 'ww')}`,
          amount,
          fullDate: `${format(weekStart, 'd MMM', { locale: fr })} - ${format(weekEnd, 'd MMM yyyy', { locale: fr })}`
        };
      });
    }
    else {
      // Generate all days in the range
      const days = eachDayOfInterval({
        start: startDate,
        end: endDate
      });

      processedData = days.map(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const amount = dataMap.get(dayKey) || 0;
        totalAmount += amount;

        return {
          name: format(day, 'd', { locale: fr }),
          amount,
          fullDate: format(day, 'EEEE d MMMM yyyy', { locale: fr })
        };
      });
    }

    return {
      chartData: processedData,
      total: totalAmount,
      description: rangeDescription
    };
  }, [data, startDate, endDate]);

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="flex flex-col items-stretch space-y-0 p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>
            <h2 className="font-semibold mb-4 text-gray-700 flex items-center">
              <span className="w-2 h-8 bg-blue-500 rounded-md mr-3"></span>
              Encaissement
            </h2>
          </CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left sm:px-8 sm:py-6">
            <span className="text-muted-foreground">
              Encaissement total
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {total.toLocaleString('fr-FR')} DH
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="name"
                  valueKey="amount"
                  valueFormatter={(value) => `${value.toLocaleString('fr-FR')} DH`}
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]?.payload?.fullDate) {
                      return payload[0].payload.fullDate;
                    }
                    return value;
                  }}
                />
              }
            />
            <Bar dataKey="amount" fill="#2CAFFE" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}