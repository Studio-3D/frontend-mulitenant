"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

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
  { browser: "Appels entrants", visitors: 275, fill: "#66C8A5" },
  { browser: "Appels sortants", visitors: 200, fill: "#97BDFB" },
  { browser: "Appels manqués", visitors: 187, fill: "#FF7C7C" },
  
]

const chartConfig = {
  
  chrome: {
    label: "Appels entrants",
    color: "#66C8A5",
  },
  safari: {
    label: "Appels sortants",
    color: "#97BDFB",
  },
  firefox: {
    label: "Appels manqués",
    color: "#FF7C7C",
  },
} 

export function AppelsChart() {
  return (
    <Card className="flex flex-col w-full border-0 shadow-none bg-transparent">
      <CardHeader className=" pb-2">
        <CardTitle>Nombre Des Appels</CardTitle>
        <CardDescription>January - June 2024</CardDescription>

      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="visitors" label nameKey="browser" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col  gap-2 text-sm">
        <div className="flex  gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
      {/* Custom Legend - moved to the right side */}
        <div className="flex justify-center gap-4">
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
    </Card>
  )
}
