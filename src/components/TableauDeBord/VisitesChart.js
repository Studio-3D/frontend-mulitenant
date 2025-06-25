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
        interesse: 2,  // Changed from 'interesses'
        perdu: 1,      // Changed from 'Pérdu'
        receptif: 2,   // Changed from 'receptifs'
      },
      {
        name: '10h',
        interesse: 3,
        perdu: 2,
        receptif: 3,
      },
      {
        name: '12h',
        interesse: 4,
        perdu: 1,
        receptif: 2,
      },
      {
        name: '14h',
        interesse: 1,
        perdu: 2,
        receptif: 1,
      },
      {
        name: '16h',
        interesse: 3,
        perdu: 1,
        receptif: 2,
      },
      {
        name: '18h',
        interesse: 2,
        perdu: 1,
        receptif: 0,
      },
    ],
    'cette semaine': [
      {
        name: 'Lun',
        interesse: 8,
        perdu: 4,
        receptif: 6,
      },
      {
        name: 'Mar',
        interesse: 10,
        perdu: 5,
        receptif: 8,
      },
      {
        name: 'Mer',
        interesse: 7,
        perdu: 6,
        receptif: 5,
      },
      {
        name: 'Jeu',
        interesse: 12,
        perdu: 4,
        receptif: 7,
      },
      {
        name: 'Ven',
        interesse: 8,
        perdu: 6,
        receptif: 4,
      },
    ],
    'ce mois': [
      {
        name: 'Sem 1',
        interesse: 35,
        perdu: 20,
        receptif: 25,
      },
      {
        name: 'Sem 2',
        interesse: 40,
        perdu: 18,
        receptif: 28,
      },
      {
        name: 'Sem 3',
        interesse: 28,
        perdu: 22,
        receptif: 24,
      },
      {
        name: 'Sem 4',
        interesse: 45,
        perdu: 15,
        receptif: 30,
      },
    ],
    'cette année': [
      {
        name: 'Jan',
        interesse: 120,
        perdu: 80,
        receptif: 90,
      },
      {
        name: 'Fév',
        interesse: 135,
        perdu: 75,
        receptif: 110,
      },
      {
        name: 'Mar',
        interesse: 145,
        perdu: 85,
        receptif: 95,
      },
      {
        name: 'Avr',
        interesse: 162,
        perdu: 68,
        receptif: 120,
      },
      {
        name: 'Mai',
        interesse: 158,
        perdu: 78,
        receptif: 105,
      },
      {
        name: 'Juin',
        interesse: 195,
        perdu: 65,
        receptif: 125,
      },
      {
        name: 'Juil',
        interesse: 180,
        perdu: 70,
        receptif: 130,
      },
      {
        name: 'Août',
        interesse: 200,
        perdu: 60,
        receptif: 140,
      },
      {
        name: 'Sep',
        interesse: 220,
        perdu: 55,
        receptif: 150,
      },
      {
        name: 'Oct',
        interesse: 210,
        perdu: 65,
        receptif: 160,
      },
      {
        name: 'Nov',
        interesse: 230,
        perdu: 50,
        receptif: 170,
      },
      {
        name: 'Déc',
        interesse: 240,
        perdu: 45,
        receptif: 180,
      },
    ],
    'dernière année': [
      {
        name: 'Jan',
        interesse: 110,
        perdu: 75,
        receptif: 85,
      },
      {
        name: 'Fév',
        interesse: 125,
        perdu: 70,
        receptif: 100,
      },
      {
        name: 'Mar',
        interesse: 135,
        perdu: 80,
        receptif: 90,
      },
      {
        name: 'Avr',
        interesse: 150,
        perdu: 65,
        receptif: 110,
      },
      {
        name: 'Mai',
        interesse: 148,
        perdu: 72,
        receptif: 95,
      },
      {
        name: 'Juin',
        interesse: 180,
        perdu: 60,
        receptif: 115,
      },
      {
        name: 'Juil',
        interesse: 170,
        perdu: 55,
        receptif: 120,
      },
      {
        name: 'Août',
        interesse: 190,
        perdu: 50,
        receptif: 130,
      },
      {
        name: 'Sep',
        interesse: 200,
        perdu: 45,
        receptif: 140,
      },
      {
        name: 'Oct',
        interesse: 210,
        perdu: 40,
        receptif: 150,
      },
      {
        name: 'Nov',
        interesse: 220,
        perdu: 35,
        receptif: 160,
      },
      {
        name: 'Déc',
        interesse: 230,
        perdu: 30,
        receptif: 170,
      },
    ],
  };
  
  const data = dataSets[dateRange];
  
  return (
    <Card className="">
      <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6">
        <div className="flex flex-col space-y-2">
          <CardTitle>
            <h2 className=" font-semibold mb-4 text-gray-700 flex items-center">
              <span className="w-2 h-8 bg-purple-500 rounded-md mr-3"></span>
                Visites
            </h2>
          </CardTitle>
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
                fill="#2CAFFE" 
                radius={[4, 4, 0, 0]} 
                barSize={14}
              />
              <Bar 
                dataKey="perdu" 
                fill="#FE642C" 
                radius={[4, 4, 0, 0]} 
                barSize={14}
              />
              <Bar 
                dataKey="receptif" 
                fill="#2CFE7F" 
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