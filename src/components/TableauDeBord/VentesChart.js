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

const chartData = [
  { date: "2024-01-01", ventes: 100 },
  { date: "2024-02-01", ventes: 200 },
  { date: "2024-03-01", ventes: 500 },
  { date: "2024-04-01", ventes: 372 },
  { date: "2024-04-02", ventes: 277 },
  { date: "2024-04-03", ventes: 287 },
  { date: "2024-04-04", ventes: 502 },
  { date: "2024-04-05", ventes: 663 },
  { date: "2024-04-06", ventes: 641 },
  { date: "2024-04-07", ventes: 425 },
  { date: "2024-04-08", ventes: 729 },
  { date: "2024-04-09", ventes: 169 },
  { date: "2024-04-10", ventes: 451 },
  { date: "2024-04-11", ventes: 677 },
  { date: "2024-04-12", ventes: 502 },
  { date: "2024-04-13", ventes: 722 },
  { date: "2024-04-14", ventes: 357 },
  { date: "2024-04-15", ventes: 290 },
  { date: "2024-04-16", ventes: 328 },
  { date: "2024-04-17", ventes: 806 },
  { date: "2024-04-18", ventes: 774 },
  { date: "2024-04-19", ventes: 423 },
  { date: "2024-04-20", ventes: 239 },
  { date: "2024-04-21", ventes: 337 },
  { date: "2024-04-22", ventes: 394 },
  { date: "2024-04-23", ventes: 368 },
  { date: "2024-04-24", ventes: 677 },
  { date: "2024-04-25", ventes: 465 },
  { date: "2024-04-26", ventes: 205 },
  { date: "2024-04-27", ventes: 803 },
  { date: "2024-04-28", ventes: 302 },
  { date: "2024-04-29", ventes: 555 },
  { date: "2024-04-30", ventes: 834 },
  { date: "2024-05-01", ventes: 385 },
  { date: "2024-05-02", ventes: 603 },
  { date: "2024-05-03", ventes: 437 },
  { date: "2024-05-04", ventes: 805 },
  { date: "2024-05-05", ventes: 871 },
  { date: "2024-05-06", ventes: 1018 },
  { date: "2024-05-07", ventes: 688 },
  { date: "2024-05-08", ventes: 359 },
  { date: "2024-05-09", ventes: 407 },
  { date: "2024-05-10", ventes: 623 },
  { date: "2024-05-11", ventes: 605 },
  { date: "2024-05-12", ventes: 437 },
  { date: "2024-05-13", ventes: 357 },
  { date: "2024-05-14", ventes: 938 },
  { date: "2024-05-15", ventes: 853 },
  { date: "2024-05-16", ventes: 738 },
  { date: "2024-05-17", ventes: 919 },
  { date: "2024-05-18", ventes: 665 },
  { date: "2024-05-19", ventes: 415 },
  { date: "2024-05-20", ventes: 407 },
  { date: "2024-05-21", ventes: 222 },
  { date: "2024-05-22", ventes: 201 },
  { date: "2024-05-23", ventes: 542 },
  { date: "2024-05-24", ventes: 514 },
  { date: "2024-05-25", ventes: 451 },
  { date: "2024-05-26", ventes: 383 },
  { date: "2024-05-27", ventes: 880 },
  { date: "2024-05-28", ventes: 423 },
  { date: "2024-05-29", ventes: 208 },
  { date: "2024-05-30", ventes: 620 },
  { date: "2024-05-31", ventes: 408 },
  { date: "2024-06-01", ventes: 378 },
  { date: "2024-06-02", ventes: 880 },
  { date: "2024-06-03", ventes: 263 },
  { date: "2024-06-04", ventes: 819 },
  { date: "2024-06-05", ventes: 228 },
  { date: "2024-06-06", ventes: 544 },
  { date: "2024-06-07", ventes: 693 },
  { date: "2024-06-08", ventes: 705 },
  { date: "2024-06-09", ventes: 918 },
  { date: "2024-06-10", ventes: 355 },
  { date: "2024-06-11", ventes: 242 },
  { date: "2024-06-12", ventes: 912 },
  { date: "2024-06-13", ventes: 211 },
  { date: "2024-06-14", ventes: 806 },
  { date: "2024-06-15", ventes: 657 },
  { date: "2024-06-16", ventes: 681 },
  { date: "2024-06-17", ventes: 995 },
  { date: "2024-06-18", ventes: 277 },
  { date: "2024-06-19", ventes: 630 },
  { date: "2024-06-20", ventes: 858 },
  { date: "2024-06-21", ventes: 379 },
  { date: "2024-06-22", ventes: 587 },
  { date: "2024-06-23", ventes: 1010 },
  { date: "2024-06-24", ventes: 312 },
  { date: "2024-06-25", ventes: 331 },
  { date: "2024-06-26", ventes: 814 },
  { date: "2024-06-27", ventes: 938 },
  { date: "2024-06-28", ventes: 349 },
  { date: "2024-06-29", ventes: 263 },
  { date: "2024-06-30", ventes: 846 },
];

const chartConfig = {
    ventes: {
      label: "Ventes",
      color: "#22c55e",
    },
  }  

  export function VentesChart() {

    return (
      <Card className='bg-white'>
        <CardHeader className="flex items-center gap-2 py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Ventes</CardTitle>
            <CardDescription>
              {`Total ventes sur l'année : ${chartData.reduce((sum, d) => sum + d.ventes, 0).toLocaleString('fr-FR')} dhs`}
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
                  <stop
                    offset="5%"
                    stopColor="#22c55e"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="#22c55e"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })
                }}
              />
              <ChartTooltip
                
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "short",
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