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

const FRENCH_MONTHS = [
  "janv", "févr", "mars", "avr", "mai", "juin",
  "juil", "août", "sept", "oct", "nov", "déc"
];

// ✅ Format to YYYY-MM-DD string (no UTC shift issue)
const formatDateKey = (date) => {
  return date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, '0') + "-" +
    String(date.getDate()).padStart(2, '0');
}

const parseCustomDate = (dateStr) => {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const generateCompleteDateRange = (range) => {
  const now = new Date();
  const dates = [];

  if (range === "cette année" || range === "dernière année") {
    const year = range === "dernière année" ? now.getFullYear() - 1 : now.getFullYear();
    for (let month = 0; month < 12; month++) {
      dates.push(new Date(year, month, 1));
    }
  } else if (range === "ce mois") {
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day));
    }
  } else if (range === "cette semaine") {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
  }

  return dates;
}

const formatDateLabel = (date, range) => {
  switch (range) {
    case "aujourd'hui":
      return date.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });
    case "cette semaine":
      return date.toLocaleDateString("fr-FR", { weekday: 'short' });
    case "ce mois":
      return date.getDate().toString();
    case "cette année":
    case "dernière année":
      return FRENCH_MONTHS[date.getMonth()];
    default:
      return formatDateKey(date);
  }
}

export function VentesChart({ dateRange, data }) {

  const chartData = React.useMemo(() => {
  if (!Array.isArray(data)) return [];

  const ventesMap = new Map();
  data.forEach((item) => {
    try {
      const date = parseCustomDate(item.date);
      const dateKey = formatDateKey(date);
      ventesMap.set(dateKey, (ventesMap.get(dateKey) || 0) + parseInt(item.nombre, 10));
    } catch (e) {
      console.error("Erreur de parsing date:", item.date, e);
    }
  });

  const completeDateRange = generateCompleteDateRange(dateRange);

  if (dateRange === "cette année" || dateRange === "dernière année") {
    // Regrouper par mois
    const monthlyData = Array.from({ length: 12 }, (_, month) => {
      const year = dateRange === "dernière année"
        ? new Date().getFullYear() - 1
        : new Date().getFullYear();

      const matchingDays = [...ventesMap.entries()].filter(([dateKey]) => {
        const [y, m] = dateKey.split('-');
        return parseInt(y) === year && parseInt(m) === month + 1;
      });

      const totalVentes = matchingDays.reduce((sum, [, nombre]) => sum + nombre, 0);

      return {
        date: new Date(year, month, 1),
        name: FRENCH_MONTHS[month],
        formattedName: FRENCH_MONTHS[month],
        ventes: totalVentes,
      };
    });

    return monthlyData;
  }

  // Sinon (semaines, jours...) on garde le format jour par jour
  return completeDateRange.map(date => {
    const dateKey = formatDateKey(date);
    return {
      date,
      name: dateKey,
      formattedName: formatDateLabel(date, dateRange),
      ventes: ventesMap.get(dateKey) || 0
    };
  });
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
            Affichage du total des Ventes {dateRange} : {totalVentes}
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
              minTickGap={8}
              interval={0}
              padding={{ left: 8, right: 8 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                  const point = chartData.find(d => d.formattedName === value);
                  if (!point?.date) return "Date invalide";

                  const options = (dateRange === "cette année" || dateRange === "dernière année")
                    ? { month: "long", year: "numeric" }
                    : { day: "numeric", month: "long", year: "numeric" };

                  return point.date.toLocaleDateString("fr-FR", options);
                }}
              />
            }
            />
            <Area
              dataKey="ventes"
              type="monotone"
              fill="url(#fillVentes)"
              stroke="#22c55e"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
