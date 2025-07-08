"use client"

import { TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts"

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

// Chart config colors
const chartConfig = {
  interesse: {
    label: "Interessé",
    color: "#2CAFFE",
  },
  perdu: {
    label: "Pérdu",
    color: "#FE642C",
  },
  receptif: {
    label: "Réceptif",
    color: "#2CFE7F",
  },
}

// Generate full axis labels depending on range
function generateChartLabels(range) {
  const today = new Date()
  const labels = []

  if (range === "cette année") {
    return [
      "janv", "févr", "mars", "avr", "mai", "juin",
      "juil", "août", "sept", "oct", "nov", "déc"
    ]
  }

  if (range === "ce mois") {
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    for (let i = 1; i <= daysInMonth; i++) {
      labels.push(i.toString())
    }
    return labels
  }

  if (range === "cette semaine") {
    return ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
  }

  if (range === "aujourd'hui") {
    for (let i = 0; i < 24; i++) {
      labels.push(`${i}h`)
    }
    return labels
  }

  return []
}

// Map your data to appropriate label grouping
function transformData(data, range) {
  const labels = generateChartLabels(range)
  const grouped = {}

  data.forEach((item) => {
    const date = new Date(item.date)
    let key = ""

    switch (range) {
      case "cette année":
        key = date.toLocaleString("fr-FR", { month: "short" }) // "janv"
        break
      case "ce mois":
        key = date.getDate().toString() // "1" to "31"
        break
      case "cette semaine":
        key = date.toLocaleString("fr-FR", { weekday: "short" }) // "lun", "mar" etc.
        key = key.charAt(0).toUpperCase() + key.slice(1, 3) // Normalize to "Lun"
        break
      case "aujourd'hui":
        key = `${date.getHours()}h`
        break
      default:
        break
    }

    if (!grouped[key]) {
      grouped[key] = { interesse: 0, perdu: 0, receptif: 0 }
    }

    grouped[key].interesse += item["intéressé"] || 0
    grouped[key].perdu += item["perdu"] || 0
    grouped[key].receptif += item["réceptif"] || 0
  })

  // Fill empty slots with 0
  return labels.map((label) => ({
    name: label,
    interesse: grouped[label]?.interesse || 0,
    perdu: grouped[label]?.perdu || 0,
    receptif: grouped[label]?.receptif || 0,
  }))
}

export function VisitesChart({ data = [], dateRange }) {
  const chartData = transformData(data, dateRange)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6">
        <div className="flex flex-col space-y-2">
          <CardTitle>
            <h2 className="font-semibold mb-4 text-gray-700 flex items-center">
              <span className="w-2 h-8 bg-purple-500 rounded-md mr-3"></span>
              Visites
            </h2>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
             Affichage du total des visiteurs {dateRange}
          </CardDescription>
        </div>

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
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: '0.75rem', sm: '0.875rem' }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar
                dataKey="interesse"
                fill={chartConfig.interesse.color}
                radius={[4, 4, 0, 0]}
                barSize={14}
              />
              <Bar
                dataKey="perdu"
                fill={chartConfig.perdu.color}
                radius={[4, 4, 0, 0]}
                barSize={14}
              />
              <Bar
                dataKey="receptif"
                fill={chartConfig.receptif.color}
                radius={[4, 4, 0, 0]}
                barSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
