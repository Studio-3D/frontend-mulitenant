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
import {
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  differenceInDays,
  parse
} from "date-fns"
import { fr } from "date-fns/locale"

const chartConfig = {
  ventes: {
    label: "Ventes",
    color: "#22c55e",
  },
}

const FRENCH_MONTHS = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"]
const FRENCH_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

export function VentesChart({ startDate, endDate, data = [] }) {
  const { chartData, totalVentes, description } = React.useMemo(() => {
    console.log("Raw data received:", data); // Debug log

    // 1. Determine the date range type
    const daysDifference = differenceInDays(endDate, startDate)
    let rangeType = 'day' // default
    
    if (isSameDay(startDate, endDate)) {
      rangeType = 'day'
    } else if (daysDifference <= 7) { // 1 week or less
      rangeType = 'week'
    } else if (isSameMonth(startDate, endDate)) {
      rangeType = 'month'
    } else if (isSameYear(startDate, endDate)) {
      rangeType = 'year'
    } else {
      rangeType = 'year' // for ranges longer than a year
    }

    // 2. Create data map for quick lookup
    const dataMap = new Map()
    if (Array.isArray(data)) {
      data.forEach(item => {
        try {
          if (item && item.date && item.nombre) {
            // Parse date in DD-MM-YYYY format
            const parsedDate = parse(item.date, 'dd-MM-yyyy', new Date())
            const dateKey = format(parsedDate, 'yyyy-MM-dd')
            dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + Number(item.nombre))
          } else if (Array.isArray(item) && item.length >= 2) {
            // Handle array format [date, value]
            const [dateStr, value] = item
            const parsedDate = parse(dateStr, 'dd-MM-yyyy', new Date())
            const dateKey = format(parsedDate, 'yyyy-MM-dd')
            dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + Number(value))
          }
        } catch (e) {
          console.error("Error parsing data item:", item, e)
        }
      })
    }

    console.log("Data map:", dataMap); // Debug log

    // 3. Generate complete time periods based on range type
    let periods = []
    let total = 0

    if (rangeType === 'year') {
      // Group by month for year view
      periods = eachMonthOfInterval({ start: startDate, end: endDate }).map(month => ({
        date: month,
        key: format(month, 'yyyy-MM'),
        name: FRENCH_MONTHS[month.getMonth()],
        fullDate: format(month, 'MMMM yyyy', { locale: fr })
      }))
    } 
    else if (rangeType === 'month') {
      // Show all days for month view
      periods = eachDayOfInterval({ start: startDate, end: endDate }).map(day => ({
        date: day,
        key: format(day, 'yyyy-MM-dd'),
        name: format(day, 'd', { locale: fr }),
        fullDate: format(day, 'EEEE d MMMM yyyy', { locale: fr })
      }))
    }
    else if (rangeType === 'week') {
      // Show all days for week view
      periods = eachDayOfInterval({ start: startDate, end: endDate }).map(day => ({
        date: day,
        key: format(day, 'yyyy-MM-dd'),
        name: FRENCH_DAYS[day.getDay()],
        fullDate: format(day, 'EEEE d MMMM yyyy', { locale: fr })
      }))
    }
    else {
      // Single day view
      periods = [{
        date: startDate,
        key: format(startDate, 'yyyy-MM-dd'),
        name: format(startDate, 'd MMM', { locale: fr }),
        fullDate: format(startDate, 'EEEE d MMMM yyyy', { locale: fr })
      }]
    }

    // 4. Calculate values for each period
    const processedData = periods.map(period => {
      let ventes = 0

      if (rangeType === 'year') {
        // Sum all days in this month
        dataMap.forEach((value, key) => {
          const [year, month] = key.split('-')
          if (period.key === `${year}-${month}`) {
            ventes += value
          }
        })
      } else {
        // For day/week/month views
        ventes = dataMap.get(period.key) || 0
      }

      total += ventes

      return {
        ...period,
        ventes,
        formattedName: period.name
      }
    })

    console.log("Processed chart data:", processedData); // Debug log

    // 5. Generate description
    let rangeDescription
    if (isSameDay(startDate, endDate)) {
      rangeDescription = `Affichage des ventes pour le ${format(startDate, 'd MMMM yyyy', { locale: fr })}`
    } else if (rangeType === 'week') {
      rangeDescription = `Affichage des ventes pour la semaine du ${format(startDate, 'd MMMM', { locale: fr })} au ${format(endDate, 'd MMMM yyyy', { locale: fr })}`
    } else if (rangeType === 'month') {
      rangeDescription = `Affichage des ventes pour ${format(startDate, 'MMMM yyyy', { locale: fr })}`
    } else if (rangeType === 'year') {
      rangeDescription = `Affichage des ventes pour ${format(startDate, 'yyyy', { locale: fr })}`
    } else {
      rangeDescription = `Affichage des ventes du ${format(startDate, 'd MMMM yyyy', { locale: fr })} au ${format(endDate, 'd MMMM yyyy', { locale: fr })}`
    }

    return {
      chartData: processedData,
      totalVentes: total,
      description: rangeDescription
    }
  }, [data, startDate, endDate])

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="flex flex-col items-stretch space-y-0 p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>
            <h2 className="font-semibold mb-4 text-gray-700 flex items-center">
              <span className="w-2 h-8 bg-green-500 rounded-md mr-3"></span>
              Ventes
            </h2>
          </CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left sm:px-8 sm:py-6">
            <span className="text-muted-foreground">
              Ventes totales
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {totalVentes.toLocaleString('fr-FR')}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <defs>
              <linearGradient id="fillVentes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false}/>
            <XAxis
              dataKey="formattedName"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="formattedName"
                  valueKey="ventes"
                  valueFormatter={(value) => value.toLocaleString('fr-FR')}
                  labelFormatter={(_, payload) => 
                    payload?.[0]?.payload?.fullDate || ''
                  }
                />
              }
            />
            <Area
              dataKey="ventes"
              type="monotone"
              fill="url(#fillVentes)"
              stroke="#22c55e"
            />
            <ChartLegend content={<ChartLegendContent/>}/>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}