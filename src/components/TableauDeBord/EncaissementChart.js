"use client";

import React, {useMemo} from "react";
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

const chartData = [
  { date: "2024-04-01", encaissement: 150 },
  { date: "2024-04-02", encaissement: 180 },
  { date: "2024-04-03", encaissement: 120 },
  { date: "2024-04-04", encaissement: 260 },
  { date: "2024-04-05", encaissement: 290 },
  { date: "2024-04-06", encaissement: 340 },
  { date: "2024-04-07", encaissement: 180 },
  { date: "2024-04-08", encaissement: 320 },
  { date: "2024-04-09", encaissement: 110 },
  { date: "2024-04-10", encaissement: 190 },
  { date: "2024-04-11", encaissement: 350 },
  { date: "2024-04-12", encaissement: 210 },
  { date: "2024-04-13", encaissement: 380 },
  { date: "2024-04-14", encaissement: 220 },
  { date: "2024-04-15", encaissement: 170 },
  { date: "2024-04-16", encaissement: 190 },
  { date: "2024-04-17", encaissement: 360 },
  { date: "2024-04-18", encaissement: 410 },
  { date: "2024-04-19", encaissement: 180 },
  { date: "2024-04-20", encaissement: 150 },
  { date: "2024-04-21", encaissement: 200 },
  { date: "2024-04-22", encaissement: 170 },
  { date: "2024-04-23", encaissement: 230 },
  { date: "2024-04-24", encaissement: 290 },
  { date: "2024-04-25", encaissement: 250 },
  { date: "2024-04-26", encaissement: 130 },
  { date: "2024-04-27", encaissement: 420 },
  { date: "2024-04-28", encaissement: 180 },
  { date: "2024-04-29", encaissement: 240 },
  { date: "2024-04-30", encaissement: 380 },
  { date: "2024-05-01", encaissement: 220 },
  { date: "2024-05-02", encaissement: 310 },
  { date: "2024-05-03", encaissement: 190 },
  { date: "2024-05-04", encaissement: 420 },
  { date: "2024-05-05", encaissement: 390 },
  { date: "2024-05-06", encaissement: 520 },
  { date: "2024-05-07", encaissement: 300 },
  { date: "2024-05-08", encaissement: 210 },
  { date: "2024-05-09", encaissement: 180 },
  { date: "2024-05-10", encaissement: 330 },
  { date: "2024-05-11", encaissement: 270 },
  { date: "2024-05-12", encaissement: 240 },
  { date: "2024-05-13", encaissement: 160 },
  { date: "2024-05-14", encaissement: 490 },
  { date: "2024-05-15", encaissement: 380 },
  { date: "2024-05-16", encaissement: 400 },
  { date: "2024-05-17", encaissement: 420 },
  { date: "2024-05-18", encaissement: 350 },
  { date: "2024-05-19", encaissement: 180 },
  { date: "2024-05-20", encaissement: 230 },
  { date: "2024-05-21", encaissement: 140 },
  { date: "2024-05-22", encaissement: 120 },
  { date: "2024-05-23", encaissement: 290 },
  { date: "2024-05-24", encaissement: 220 },
  { date: "2024-05-25", encaissement: 250 },
  { date: "2024-05-26", encaissement: 170 },
  { date: "2024-05-27", encaissement: 460 },
  { date: "2024-05-28", encaissement: 190 },
  { date: "2024-05-29", encaissement: 130 },
  { date: "2024-05-30", encaissement: 280 },
  { date: "2024-05-31", encaissement: 230 },
  { date: "2024-06-01", encaissement: 200 },
  { date: "2024-06-02", encaissement: 410 },
  { date: "2024-06-03", encaissement: 160 },
  { date: "2024-06-04", encaissement: 380 },
  { date: "2024-06-05", encaissement: 140 },
  { date: "2024-06-06", encaissement: 250 },
  { date: "2024-06-07", encaissement: 370 },
  { date: "2024-06-08", encaissement: 320 },
  { date: "2024-06-09", encaissement: 480 },
  { date: "2024-06-10", encaissement: 200 },
  { date: "2024-06-11", encaissement: 150 },
  { date: "2024-06-12", encaissement: 420 },
  { date: "2024-06-13", encaissement: 130 },
  { date: "2024-06-14", encaissement: 380 },
  { date: "2024-06-15", encaissement: 350 },
  { date: "2024-06-16", encaissement: 310 },
  { date: "2024-06-17", encaissement: 520 },
  { date: "2024-06-18", encaissement: 170 },
  { date: "2024-06-19", encaissement: 290 },
  { date: "2024-06-20", encaissement: 450 },
  { date: "2024-06-21", encaissement: 210 },
  { date: "2024-06-22", encaissement: 270 },
  { date: "2024-06-23", encaissement: 530 },
  { date: "2024-06-24", encaissement: 180 },
  { date: "2024-06-25", encaissement: 190 },
  { date: "2024-06-26", encaissement: 380 },
  { date: "2024-06-27", encaissement: 490 },
  { date: "2024-06-28", encaissement: 200 },
  { date: "2024-06-29", encaissement: 160 },
  { date: "2024-06-30", encaissement: 400 },
];

const chartConfig = {
  views: {
    label: "Encaissement",
  },
  encaissement: {
    label: "Encaissement",
    color: "#2CAFFE",
  },
};

export function EncaissementChart() {
  const total = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.encaissement, 0),
    []
  );

  return (
    <Card className=" bg-white">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Encaissement</CardTitle>
          <CardDescription>
            Affichage des encaissements totaux des 3 derniers mois
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">
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
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                 return date.toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("fr-FR", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar dataKey="encaissement" fill="#2CAFFE" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}