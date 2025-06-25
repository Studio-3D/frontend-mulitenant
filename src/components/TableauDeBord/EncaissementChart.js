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
  views: {
    label: "Encaissement",
  },
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

export function EncaissementChart({ dateRange }) {
  const dataSets = {
    "aujourd'hui": [
      {
        name: '8h',
        amount: 1200,
      },
      {
        name: '10h',
        amount: 1800,
      },
      {
        name: '12h',
        amount: 2400,
      },
      {
        name: '14h',
        amount: 1500,
      },
      {
        name: '16h',
        amount: 2100,
      },
      {
        name: '18h',
        amount: 1900,
      },
    ],
    'cette semaine': [
      {
        name: 'Lun',
        amount: 4000,
      },
      {
        name: 'Mar',
        amount: 3500,
      },
      {
        name: 'Mer',
        amount: 5000,
      },
      {
        name: 'Jeu',
        amount: 2780,
      },
      {
        name: 'Ven',
        amount: 3890,
      },
      {
        name: 'Sam',
        amount: 2390,
      },
      {
        name: 'Dim',
        amount: 1490,
      },
    ],
    'ce mois': [
      {
        name: 'Sem 1',
        amount: 15000,
      },
      {
        name: 'Sem 2',
        amount: 18000,
      },
      {
        name: 'Sem 3',
        amount: 12000,
      },
      {
        name: 'Sem 4',
        amount: 21000,
      },
    ],
    'cette année': [
      {
        name: 'Jan',
        amount: 45000,
      },
      {
        name: 'Fév',
        amount: 38000,
      },
      {
        name: 'Mar',
        amount: 52000,
      },
      {
        name: 'Avr',
        amount: 37000,
      },
      {
        name: 'Mai',
        amount: 41000,
      },
      {
        name: 'Juin',
        amount: 47000,
      },
      {
        name: 'Juil',
        amount: 36000,
      },
      {
        name: 'Août',
        amount: 28000,
      },
      {
        name: 'Sep',
        amount: 49000,
      },
      {
        name: 'Oct',
        amount: 53000,
      },
      {
        name: 'Nov',
        amount: 48000,
      },
      {
        name: 'Déc',
        amount: 61000,
      },
    ],
    'dernière année': [
      {
        name: 'Jan',
        amount: 42000,
      },
      {
        name: 'Fév',
        amount: 35000,
      },
      {
        name: 'Mar',
        amount: 48000,
      },
      {
        name: 'Avr',
        amount: 32000,
      },
      {
        name: 'Mai',
        amount: 38000,
      },
      {
        name: 'Juin',
        amount: 44000,
      },
      {
        name: 'Juil',
        amount: 33000,
      },
      {
        name: 'Août',
        amount: 25000,
      },
      {
        name: 'Sep',
        amount: 45000,
      },
      {
        name: 'Oct',
        amount: 49000,
      },
      {
        name: 'Nov',
        amount: 43000,
      },
      {
        name: 'Déc',
        amount: 58000,
      },
    ],
  };

  const data = dataSets[dateRange];
  const description = rangeDescriptions[dateRange] || "Affichage des encaissements";
  const total = useMemo(
    () => data.reduce((acc, curr) => acc + curr.amount, 0),
    [data]
  );

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="flex flex-col items-stretch space-y-0  p-0 sm:flex-row">
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
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1  px-6 py-4 text-left sm:px-8 sm:py-6">
            <span className=" text-muted-foreground">
              Encaissement total
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {total.toLocaleString()}
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
            data={data}
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
              minTickGap={32}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => value}
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