"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 210, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
  { month: "July", desktop: 200, mobile: 160 },
  { month: "August", desktop: 220, mobile: 180 },
  { month: "September", desktop: 250, mobile: 200 },
  { month: "October", desktop: 270, mobile: 220 },
  { month: "November", desktop: 290, mobile: 240 },
  { month: "December", desktop: 310, mobile: 260 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
}

export function VisitesChart() {
  return (
    <Card className=" bg-white">
      <CardHeader className=" px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Bar Chart - Multiple</CardTitle>
        <CardDescription className="text-sm sm:text-base">January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
          <ChartContainer config={chartConfig} className="xl:h-[250px] w-full">
            {/* ResponsiveContainer is used to make the chart responsive */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                  tick={{ fontSize: '0.75rem', sm: '0.875rem' }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar 
                  dataKey="desktop" 
                  fill="var(--color-desktop)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={24}
                />
                <Bar 
                  dataKey="mobile" 
                  fill="var(--color-mobile)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm px-4 sm:px-6">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month 
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-muted-foreground text-xs sm:text-sm">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}