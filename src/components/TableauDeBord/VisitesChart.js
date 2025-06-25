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

export function VisitesChart({ dateRange }) {
  const dataSets = {
    "aujourd'hui": [
      {
        name: '8h',
        interesses: 2,
        Pérdu: 1,
        receptifs: 2,
      },
      {
        name: '10h',
        interesses: 3,
        Pérdu: 2,
        receptifs: 3,
      },
      {
        name: '12h',
        interesses: 4,
        Pérdu: 1,
        receptifs: 2,
      },
      {
        name: '14h',
        interesses: 1,
        Pérdu: 2,
        receptifs: 1,
      },
      {
        name: '16h',
        interesses: 3,
        Pérdu: 1,
        receptifs: 2,
      },
      {
        name: '18h',
        interesses: 2,
        Pérdu: 1,
        receptifs: 0,
      },
    ],
    'cette semaine': [
      {
        name: 'Lun',
        interesses: 8,
        Pérdu: 4,
        receptifs: 6,
      },
      {
        name: 'Mar',
        interesses: 10,
        Pérdu: 5,
        receptifs: 8,
      },
      {
        name: 'Mer',
        interesses: 7,
        Pérdu: 6,
        receptifs: 5,
      },
      {
        name: 'Jeu',
        interesses: 12,
        Pérdu: 4,
        receptifs: 7,
      },
      {
        name: 'Ven',
        interesses: 8,
        Pérdu: 6,
        receptifs: 4,
      },
    ],
    'ce mois': [
      {
        name: 'Sem 1',
        interesses: 35,
        Pérdu: 20,
        receptifs: 25,
      },
      {
        name: 'Sem 2',
        interesses: 40,
        Pérdu: 18,
        receptifs: 28,
      },
      {
        name: 'Sem 3',
        interesses: 28,
        Pérdu: 22,
        receptifs: 24,
      },
      {
        name: 'Sem 4',
        interesses: 45,
        Pérdu: 15,
        receptifs: 30,
      },
    ],
    'cette année': [
      {
        name: 'Jan',
        interesses: 120,
        Pérdu: 80,
        receptifs: 90,
      },
      {
        name: 'Fév',
        interesses: 135,
        Pérdu: 75,
        receptifs: 110,
      },
      {
        name: 'Mar',
        interesses: 145,
        Pérdu: 85,
        receptifs: 95,
      },
      {
        name: 'Avr',
        interesses: 162,
        Pérdu: 68,
        receptifs: 120,
      },
      {
        name: 'Mai',
        interesses: 158,
        Pérdu: 78,
        receptifs: 105,
      },
      {
        name: 'Juin',
        interesses: 195,
        Pérdu: 65,
        receptifs: 125,
      },
    ],
    'dernière année': [
      {
        name: 'Jan',
        interesses: 110,
        Pérdu: 75,
        receptifs: 85,
      },
      {
        name: 'Fév',
        interesses: 125,
        Pérdu: 70,
        receptifs: 100,
      },
      {
        name: 'Mar',
        interesses: 135,
        Pérdu: 80,
        receptifs: 90,
      },
      {
        name: 'Avr',
        interesses: 150,
        Pérdu: 65,
        receptifs: 110,
      },
      {
        name: 'Mai',
        interesses: 148,
        Pérdu: 72,
        receptifs: 95,
      },
      {
        name: 'Juin',
        interesses: 180,
        Pérdu: 60,
        receptifs: 115,
      },
    ],
  };
  const data = dataSets[dateRange];
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
            <BarChart data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
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