"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Loader2 } from "lucide-react"

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
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

// Structure expected from the API
interface LocationData {
    location: string;
    count: number;
}

interface ChartTopLocationsProps {
    data: LocationData[];
    isLoading: boolean;
    error: string | null;
}

// Define chart config
const chartConfig = {
    count: {
        label: "Jobs",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export function ChartTopLocations({ data, isLoading, error }: ChartTopLocationsProps) {

    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>Top 10 Job Locations</CardTitle>
                <CardDescription>Number of job postings by location</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center pb-0">
                 {isLoading && (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                )}
                {error && !isLoading && (
                    <div className="flex h-full w-full items-center justify-center text-red-600">
                        Error: {error}
                    </div>
                )}
                {!isLoading && !error && data.length > 0 && (
                    <ChartContainer config={chartConfig} className="w-full h-[300px]">
                        {/* Using BarChart, consider Horizontal layout for long labels */}
                        <BarChart
                            accessibilityLayer
                            data={data}
                            layout="vertical" // Horizontal bar chart
                            margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                        >
                            <CartesianGrid horizontal={false} />
                             <YAxis
                                dataKey="location" // Show location names on Y-axis
                                type="category"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) =>
                                    value.length > 20 ? value.slice(0, 20) + "…" : value // Truncate long labels
                                }
                                width={120} // Adjust width for labels
                            />
                            <XAxis dataKey="count" type="number" hide /> {/* Hide X-axis numbers if desired */}
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" hideLabel />}
                            />
                            <Bar dataKey="count" layout="vertical" fill="var(--color-count)" radius={4}>
                                {/* Optional: Add labels inside or on top of bars */}
                                {/* <LabelList dataKey="location" position="insideLeft" offset={8} className="fill-background" fontSize={12} /> */}
                                {/* <LabelList dataKey="count" position="right" offset={8} className="fill-foreground" fontSize={12} /> */}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}
                 {!isLoading && !error && data.length === 0 && (
                     <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                         No data available.
                     </div>
                )}
            </CardContent>
        </Card>
    )
} 