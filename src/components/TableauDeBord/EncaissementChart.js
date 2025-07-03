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

const chartConfig = {
  encaissement: {
    label: "Encaissement",
    color: "#2CAFFE",
  },
};

const rangeDescriptions = {
  "aujourd'hui": "Affichage des encaissements pour aujourd'hui",
  "cette semaine": "Affichage des encaissements pour cette semaine",
  "ce mois": "Affichage des encaissements pour ce mois",
  "cette année": "Affichage des encaissements pour cette année",
  "dernière année": "Affichage des encaissements pour l'année dernière",
};

function parseDateWithoutTimezone(dateString) {
  const [year, month, day] = dateString.split('-');
  return new Date(year, month - 1, day);
}

export function EncaissementChart({ dateRange, data }) {
  const { chartData, total } = useMemo(() => {
    if (!data) return { chartData: [], total: 0 };

    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (dateRange) {
      case "aujourd'hui":
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "cette semaine":
        startDate.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        endDate.setDate(startDate.getDate() + 6);
        break;
      case "ce mois":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "cette année":
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      case "dernière année":
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    }

    // For monthly view
    if (dateRange === "ce mois") {
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const monthlyData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Find matching data entry (using timezone-insensitive comparison)
        const matchingEntry = data.find(([dateStr]) => {
          const apiDate = parseDateWithoutTimezone(dateStr);
          return (
            apiDate.getFullYear() === today.getFullYear() &&
            apiDate.getMonth() === today.getMonth() &&
            apiDate.getDate() === day
          );
        });
        
        return {
          name: day.toString(),
          amount: matchingEntry ? matchingEntry[1] : 0,
          fullDate: new Date(today.getFullYear(), today.getMonth(), day).toLocaleDateString('fr-FR')
        };
      });

      return {
        chartData: monthlyData,
        total: monthlyData.reduce((sum, item) => sum + item.amount, 0)
      };
    }

    // For yearly view
    if (dateRange === "cette année" || dateRange === "dernière année") {
      const year = dateRange === "cette année" ? today.getFullYear() : today.getFullYear() - 1;
      const monthlyData = Array.from({ length: 12 }, (_, month) => {
        // Filter data for this specific month
        const monthData = data.filter(([dateStr]) => {
          const apiDate = parseDateWithoutTimezone(dateStr);
          return apiDate.getFullYear() === year && apiDate.getMonth() === month;
        });
        
        const monthTotal = monthData.reduce((sum, [, amount]) => sum + amount, 0);
        
        return {
          name: new Date(year, month, 1).toLocaleDateString('fr-FR', { month: 'short' }),
          amount: monthTotal,
          fullDate: new Date(year, month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        };
      });

      return {
        chartData: monthlyData,
        total: monthlyData.reduce((sum, item) => sum + item.amount, 0)
      };
    }

    // For other date ranges (day, week)
    const formattedData = data.map(([dateStr, amount]) => {
      const date = parseDateWithoutTimezone(dateStr);
      return {
        name: formatDailyDisplay(date, dateRange),
        amount,
        fullDate: date.toLocaleDateString('fr-FR')
      };
    });

    const totalAmount = formattedData.reduce((sum, item) => sum + item.amount, 0);

    return {
      chartData: formattedData,
      total: totalAmount
    };
  }, [data, dateRange]);

  function formatDailyDisplay(date, range) {
    const d = new Date(date);
    if (range === "cette semaine") return d.toLocaleDateString('fr-FR', { weekday: 'short' });
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  const description = rangeDescriptions[dateRange] || "Affichage des encaissements";

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