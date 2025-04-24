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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartData = [
  { date: "2024-01-01", encaissement: 100 },
  { date: "2024-02-01", encaissement: 200 },
  { date: "2024-03-01", encaissement: 500 },
  { date: "2024-04-01", encaissement: 372 },
  { date: "2024-04-02", encaissement: 277 },
  { date: "2024-04-03", encaissement: 287 },
  { date: "2024-04-04", encaissement: 502 },
  { date: "2024-04-05", encaissement: 663 },
  { date: "2024-04-06", encaissement: 641 },
  { date: "2024-04-07", encaissement: 425 },
  { date: "2024-04-08", encaissement: 729 },
  { date: "2024-04-09", encaissement: 169 },
  { date: "2024-04-10", encaissement: 451 },
  { date: "2024-04-11", encaissement: 677 },
  { date: "2024-04-12", encaissement: 502 },
  { date: "2024-04-13", encaissement: 722 },
  { date: "2024-04-14", encaissement: 357 },
  { date: "2024-04-15", encaissement: 290 },
  { date: "2024-04-16", encaissement: 328 },
  { date: "2024-04-17", encaissement: 806 },
  { date: "2024-04-18", encaissement: 774 },
  { date: "2024-04-19", encaissement: 423 },
  { date: "2024-04-20", encaissement: 239 },
  { date: "2024-04-21", encaissement: 337 },
  { date: "2024-04-22", encaissement: 394 },
  { date: "2024-04-23", encaissement: 368 },
  { date: "2024-04-24", encaissement: 677 },
  { date: "2024-04-25", encaissement: 465 },
  { date: "2024-04-26", encaissement: 205 },
  { date: "2024-04-27", encaissement: 803 },
  { date: "2024-04-28", encaissement: 302 },
  { date: "2024-04-29", encaissement: 555 },
  { date: "2024-04-30", encaissement: 834 },
  { date: "2024-05-01", encaissement: 385 },
  { date: "2024-05-02", encaissement: 603 },
  { date: "2024-05-03", encaissement: 437 },
  { date: "2024-05-04", encaissement: 805 },
  { date: "2024-05-05", encaissement: 871 },
  { date: "2024-05-06", encaissement: 1018 },
  { date: "2024-05-07", encaissement: 688 },
  { date: "2024-05-08", encaissement: 359 },
  { date: "2024-05-09", encaissement: 407 },
  { date: "2024-05-10", encaissement: 623 },
  { date: "2024-05-11", encaissement: 605 },
  { date: "2024-05-12", encaissement: 437 },
  { date: "2024-05-13", encaissement: 357 },
  { date: "2024-05-14", encaissement: 938 },
  { date: "2024-05-15", encaissement: 853 },
  { date: "2024-05-16", encaissement: 738 },
  { date: "2024-05-17", encaissement: 919 },
  { date: "2024-05-18", encaissement: 665 },
  { date: "2024-05-19", encaissement: 415 },
  { date: "2024-05-20", encaissement: 407 },
  { date: "2024-05-21", encaissement: 222 },
  { date: "2024-05-22", encaissement: 201 },
  { date: "2024-05-23", encaissement: 542 },
  { date: "2024-05-24", encaissement: 514 },
  { date: "2024-05-25", encaissement: 451 },
  { date: "2024-05-26", encaissement: 383 },
  { date: "2024-05-27", encaissement: 880 },
  { date: "2024-05-28", encaissement: 423 },
  { date: "2024-05-29", encaissement: 208 },
  { date: "2024-05-30", encaissement: 620 },
  { date: "2024-05-31", encaissement: 408 },
  { date: "2024-06-01", encaissement: 378 },
  { date: "2024-06-02", encaissement: 880 },
  { date: "2024-06-03", encaissement: 263 },
  { date: "2024-06-04", encaissement: 819 },
  { date: "2024-06-05", encaissement: 228 },
  { date: "2024-06-06", encaissement: 544 },
  { date: "2024-06-07", encaissement: 693 },
  { date: "2024-06-08", encaissement: 705 },
  { date: "2024-06-09", encaissement: 918 },
  { date: "2024-06-10", encaissement: 355 },
  { date: "2024-06-11", encaissement: 242 },
  { date: "2024-06-12", encaissement: 912 },
  { date: "2024-06-13", encaissement: 211 },
  { date: "2024-06-14", encaissement: 806 },
  { date: "2024-06-15", encaissement: 657 },
  { date: "2024-06-16", encaissement: 681 },
  { date: "2024-06-17", encaissement: 995 },
  { date: "2024-06-18", encaissement: 277 },
  { date: "2024-06-19", encaissement: 630 },
  { date: "2024-06-20", encaissement: 858 },
  { date: "2024-06-21", encaissement: 379 },
  { date: "2024-06-22", encaissement: 587 },
  { date: "2024-06-23", encaissement: 1010 },
  { date: "2024-06-24", encaissement: 312 },
  { date: "2024-06-25", encaissement: 331 },
  { date: "2024-06-26", encaissement: 814 },
  { date: "2024-06-27", encaissement: 938 },
  { date: "2024-06-28", encaissement: 349 },
  { date: "2024-06-29", encaissement: 263 },
  { date: "2024-06-30", encaissement: 846 },
]

const chartConfig = {
    encaissement: {
      label: "Encaissement",
      color: "#2CAFFE",
    },
  }  

  export function EncaissementChart() {
    const [timeRange, setTimeRange] = React.useState("365d") // Changed default to "365d"
  
    const filteredData = chartData.filter((item) => {
      const date = new Date(item.date)
      const referenceDate = new Date("2024-06-30")
      let daysToSubtract = 365 // Changed default to 365
      if (timeRange === "30d") {
        daysToSubtract = 30
      } else if (timeRange === "7d") {
        daysToSubtract = 7
      }
      const startDate = new Date(referenceDate)
      startDate.setDate(startDate.getDate() - daysToSubtract)
      return date >= startDate
    })
  
    return (
      <Card className='bg-white'>
        <CardHeader className="flex items-center gap-2 py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Encaissments</CardTitle>
            <CardDescription>
              Showing total encaissments for {timeRange === "365d" ? "this year" : timeRange === "30d" ? "the last 30 days" : "the last 7 days"}
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange} className='bg-white'>
            <SelectTrigger
              className="w-[160px] rounded-lg sm:ml-auto"
              aria-label="Select a value"
            >
              <SelectValue placeholder="This Year" /> {/* Updated placeholder */}
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white ">
              <SelectItem value="365d" className="rounded-lg">
                This Year {/* Changed from "Last Year" to "This Year" */}
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillEncaissement" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#2CAFFE"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="#2CAFFE"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })
                }}
              />
              <ChartTooltip
                
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                      })
                    }}
                    
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="encaissement"
                type="natural"
                fill="url(#fillEncaissement)"
                stroke="#2CAFFE"
              />
              
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }