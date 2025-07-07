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
  "Appels entrants": {
    label: "Appels entrants",
    color: "#66C8A5",
  },
  "Appels sortants": {
    label: "Appels sortants",
    color: "#97BDFB",
  },
  "Appels manqués": {
    label: "Appels manqués",
    color: "#FF7C7C",
  },
}

export function AppelsChart() {
  return (
    <Card className="flex flex-col w-full border-0 shadow-none bg-transparent">
      <CardHeader className="pb-0">
        <CardTitle>Nombre d'appels</CardTitle>
        <CardDescription>Janvier - Juin 2024</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie 
              data={chartData} 
              dataKey="visitors" 
              nameKey="browser"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      
      {/* Legend at the bottom */}
      <div className="flex justify-center gap-4 mt-4 mb-2 flex-wrap">
        {Object.entries(chartConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: config.color }}
            />
            <span className="text-xs">{config.label}</span>
          </div>
        ))}
      </div>
      
      <CardFooter className="flex-col gap-2 text-sm pt-0">
        <div className="flex gap-2 items-center font-medium leading-none">
          Tendance à la hausse de 5,2% ce mois-ci 
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-muted-foreground">
          Affichage du total des appels des 6 derniers mois
        </div>
      </CardFooter>
    </Card>
  )
}