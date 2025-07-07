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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  "Appels entrants": { label: "Appels entrants", color: "#66C8A5" },
  "Appels sortants": { label: "Appels sortants", color: "#97BDFB" },
  "Appels manqués": { label: "Appels manqués", color: "#FF7C7C" },
}

function parseDateFromDDMMYYYY(dateStr) {
  const [day, month, year] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day) // JS months are 0-based
}

function getDateRangeBounds(range) {
  const today = new Date()
  const start = new Date()
  const end = new Date()

  switch (range) {
    case "aujourd'hui":
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case "cette semaine":
      const day = today.getDay() || 7
      start.setDate(today.getDate() - day + 1)
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    case "ce mois":
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(start.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      break
    case "cette année":
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(11, 31)
      end.setHours(23, 59, 59, 999)
      break
    default:
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
  }

  return { start, end }
}

export function AppelsChart({ data, dateRange }) {
  const appels = data?.Appels || []
  const { start, end } = getDateRangeBounds(dateRange)

  let totalEntrants = 0
  let totalSortants = 0
  let totalManques = 0

  appels.forEach((item) => {
    const dateObj = parseDateFromDDMMYYYY(item.date)
    if (dateObj >= start && dateObj <= end) {
      totalEntrants += item["appel entrant"] || 0
      totalSortants += item["appel sortant"] || 0
      totalManques += item["appel manqué"] || 0
    }
  })

  const chartData = []
  if (totalEntrants > 0) {
    chartData.push({
      browser: "Appels entrants",
      visitors: totalEntrants,
      fill: chartConfig["Appels entrants"].color,
    })
  }
  if (totalSortants > 0) {
    chartData.push({
      browser: "Appels sortants",
      visitors: totalSortants,
      fill: chartConfig["Appels sortants"].color,
    })
  }
  if (totalManques > 0) {
    chartData.push({
      browser: "Appels manqués",
      visitors: totalManques,
      fill: chartConfig["Appels manqués"].color,
    })
  }

  return (
    <Card className="flex flex-col w-full border-0 shadow-none bg-transparent">
      <CardHeader className="pb-0">
        <CardTitle>Nombre d'appels</CardTitle>
        <CardDescription>{dateRange}</CardDescription>
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

      <div className="flex justify-center gap-4 mt-4 mb-2 flex-wrap">
        {chartData.map((item) => (
          <div key={item.browser} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-xs">{item.browser}</span>
          </div>
        ))}
      </div>

      <CardFooter className="flex-col gap-2 text-sm pt-0">
        <div className="flex gap-2 items-center font-medium leading-none">
          Tendance à la hausse de 5,2% ce mois-ci
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-muted-foreground">
          Affichage des appels pour la période sélectionnée
        </div>
      </CardFooter>
    </Card>
  )
}
