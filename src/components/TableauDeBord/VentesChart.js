"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  ventes: {
    label: "Ventes",
    color: "#22c55e",
  },
}

const rangeDescriptions = {
  "aujourd'hui": "Ventes aujourd'hui",
  "cette semaine": "Ventes cette semaine",
  "ce mois": "Ventes ce mois",
  "cette année": "Ventes cette année",
  "dernière année": "Ventes l'année dernière",
}

// Helper function to format dates based on range
const formatDateLabel = (dateStr, range) => {
  const date = new Date(dateStr);
  
  switch (range) {
    case "aujourd'hui":
      return date.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });
    case "cette semaine":
      return date.toLocaleDateString("fr-FR", { weekday: 'short' });
    case "ce mois":
      return date.getDate().toString();
    case "cette année":
    case "dernière année":
      return date.toLocaleDateString("fr-FR", { month: 'short' });
    default:
      return dateStr;
  }
}

export function VentesChart({ dateRange, data }) {
  const description = rangeDescriptions[dateRange] || "Ventes";
  
  // Transform the API data into the format expected by Recharts
  const chartData = React.useMemo(() => {
    if (!data) return [];
    
    return data.map(([date, ventes]) => ({
      name: date,
      ventes,
      formattedName: formatDateLabel(date, dateRange)
    }));
  }, [data, dateRange]);

  const totalVentes = chartData.reduce((sum, d) => sum + d.ventes, 0);

  return (
    <Card className='border-none shadow-none'>
      <CardHeader className="flex items-center gap-2 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>
            <h2 className="font-semibold mb-4 text-gray-700 flex items-center">
              <span className="w-2 h-8 bg-green-500 rounded-md mr-3"></span>
              Ventes
            </h2>
          </CardTitle>
          <CardDescription>
            {`${description} : ${totalVentes.toLocaleString('fr-FR')} dhs`}
          </CardDescription>
        </div> 
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillVentes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="formattedName"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="ventes"
              type="natural"
              fill="url(#fillVentes)"
              stroke="#22c55e"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}