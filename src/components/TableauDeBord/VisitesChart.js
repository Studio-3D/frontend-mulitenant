"use client"

import { TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts"
import { format, isSameMonth, isSameYear, isSameDay, isSameWeek, subDays } from "date-fns"
import { fr } from 'date-fns/locale'

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

export function VisitesChart({ data = [], startDate, endDate }) {
  // Determine the date range type
  const getRangeType = () => {
    const diffInDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))
    
    if (isSameDay(startDate, endDate)) {
      return "day"
    } else if (diffInDays <= 7) {
      return "week"
    } else if (isSameMonth(startDate, endDate)) {
      return "month"
    } else if (isSameYear(startDate, endDate)) {
      return "year"
    } else {
      return "custom"
    }
  }

  // Transform data based on the date range
  const transformData = (data, rangeType) => {
    const result = []
    
    if (rangeType === "day") {
      // Group by hour for single day
      for (let hour = 0; hour < 24; hour++) {
        const hourData = { name: `${hour}h`, interesse: 0, perdu: 0, receptif: 0 }
        data.forEach(item => {
          const itemHour = new Date(item.date).getHours()
          if (itemHour === hour) {
            hourData.interesse += item["intéressé"] || 0
            hourData.perdu += item["perdu"] || 0
            hourData.receptif += item["réceptif"] || 0
          }
        })
        result.push(hourData)
      }
    } 
    else if (rangeType === "week") {
      // Group by day of week
      const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
      days.forEach(day => {
        const dayData = { name: day, interesse: 0, perdu: 0, receptif: 0 }
        data.forEach(item => {
          const itemDay = format(new Date(item.date), 'EEE', { locale: fr }).substring(0, 3)
          if (itemDay === day.substring(0, 3)) {
            dayData.interesse += item["intéressé"] || 0
            dayData.perdu += item["perdu"] || 0
            dayData.receptif += item["réceptif"] || 0
          }
        })
        result.push(dayData)
      })
    }
    else if (rangeType === "month") {
      // Group by day of month
      const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const dayData = { name: day.toString(), interesse: 0, perdu: 0, receptif: 0 }
        data.forEach(item => {
          const itemDay = new Date(item.date).getDate()
          if (itemDay === day) {
            dayData.interesse += item["intéressé"] || 0
            dayData.perdu += item["perdu"] || 0
            dayData.receptif += item["réceptif"] || 0
          }
        })
        result.push(dayData)
      }
    }
    else if (rangeType === "year") {
      // Group by month
      const months = [
        "janv", "févr", "mars", "avr", "mai", "juin",
        "juil", "août", "sept", "oct", "nov", "déc"
      ]
      months.forEach((month, index) => {
        const monthData = { name: month, interesse: 0, perdu: 0, receptif: 0 }
        data.forEach(item => {
          const itemMonth = new Date(item.date).getMonth()
          if (itemMonth === index) {
            monthData.interesse += item["intéressé"] || 0
            monthData.perdu += item["perdu"] || 0
            monthData.receptif += item["réceptif"] || 0
          }
        })
        result.push(monthData)
      })
    }
    else {
      // For custom ranges, group by day
      const daysDiff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))
      for (let i = 0; i <= daysDiff; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + i)
        const dayStr = format(currentDate, 'dd MMM', { locale: fr })
        const dayData = { name: dayStr, interesse: 0, perdu: 0, receptif: 0 }
        data.forEach(item => {
          const itemDate = new Date(item.date)
          if (
            itemDate.getDate() === currentDate.getDate() &&
            itemDate.getMonth() === currentDate.getMonth() &&
            itemDate.getFullYear() === currentDate.getFullYear()
          ) {
            dayData.interesse += item["intéressé"] || 0
            dayData.perdu += item["perdu"] || 0
            dayData.receptif += item["réceptif"] || 0
          }
        })
        result.push(dayData)
      }
    }
    
    return result
  }

  const rangeType = getRangeType()
  const chartData = transformData(data, rangeType)

  // Generate appropriate description based on range
  const getRangeDescription = () => {
    switch (rangeType) {
      case "day":
        return format(startDate, 'd MMMM yyyy', { locale: fr })
      case "week":
        return `Semaine du ${format(startDate, 'd MMM', { locale: fr })}`
      case "month":
        return format(startDate, 'MMMM yyyy', { locale: fr })
      case "year":
        return format(startDate, 'yyyy', { locale: fr })
      default:
        return `${format(startDate, 'd MMM yyyy', { locale: fr })} - ${format(endDate, 'd MMM yyyy', { locale: fr })}`
    }
  }

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
            Affichage du total des visiteurs ({getRangeDescription()})
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