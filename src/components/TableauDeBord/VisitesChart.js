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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", interesse: 186, perdu: 80, receptif: 120 },
  { month: "February", interesse: 210, perdu: 200, receptif: 150 },
  { month: "March", interesse: 237, perdu: 120, receptif: 180 },
  { month: "April", interesse: 73, perdu: 190, receptif: 100 },
  { month: "May", interesse: 209, perdu: 130, receptif: 160 },
  { month: "June", interesse: 214, perdu: 140, receptif: 170 },
  { month: "July", interesse: 200, perdu: 160, receptif: 150 },
  { month: "August", interesse: 220, perdu: 180, receptif: 190 },
  { month: "September", interesse: 250, perdu: 200, receptif: 220 },
  { month: "October", interesse: 270, perdu: 220, receptif: 240 },
  { month: "November", interesse: 290, perdu: 240, receptif: 260 },
  { month: "December", interesse: 310, perdu: 260, receptif: 280 },
]

const chartConfig = {
  interesse: {
    label: "Interessé",
    color: "#2CAFFE", // Blue color
  },
  perdu: {
    label: "Pérdu",
    color: "#FE642C", // Red color
  },
  receptif: {
    label: "Réceptif",
    color: "#2CFE7F", // Green color
  },
}

export function VisitesChart() {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6">
        <div className="flex flex-col space-y-2">
          <CardTitle className="text-lg sm:text-2xl">Visites</CardTitle>
          <CardDescription className="text-sm sm:text-base">Janvier - Décembre 2024</CardDescription>
        </div>
        
        {/* Légende personnalisée - déplacée à droite */}
        <div className="flex gap-4">
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
      </CardHeader>
          

      <CardContent className="px-2 sm:px-4">
        <ChartContainer config={chartConfig} className="xl:h-[250px] w-full">
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
                dataKey="interesse" 
                fill="var(--color-interesse)" 
                radius={[4, 4, 0, 0]} 
                barSize={14}
              />
              <Bar 
                dataKey="perdu" 
                fill="var(--color-perdu)" 
                radius={[4, 4, 0, 0]} 
                barSize={14}
              />
              <Bar 
                dataKey="receptif" 
                fill="var(--color-receptif)" 
                radius={[4, 4, 0, 0]} 
                barSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm px-4 sm:px-6">
        <div className="flex items-center gap-2 font-medium leading-none">
          Tendance à la hausse de 5,2% ce mois-ci 
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-muted-foreground text-xs sm:text-sm">
          Affichage du total des visiteurs pour l'année écoulée
        </div>
      </CardFooter>
    </Card>
  )
}