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

interface TitleData {
    title: string;
    count: number;
}

interface ChartTopTitlesProps {
    data: TitleData[];
    isLoading: boolean;
    error: string | null;
}

const chartConfig = {
    count: {
        label: "Jobs",
        color: "hsl(var(--chart-2))", // Use a different chart color
    },
} satisfies ChartConfig

export function ChartTopTitlesShort({ data, isLoading, error }: ChartTopTitlesProps) {

    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>Top 5 Job Titles (Short)</CardTitle>
                <CardDescription>Number of job postings by short title</CardDescription>
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
                    <ChartContainer config={chartConfig} className="w-full h-[250px]">
                        <BarChart
                            accessibilityLayer
                            data={data}
                            layout="vertical"
                            margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                        >
                            <CartesianGrid horizontal={false} />
                             <YAxis
                                dataKey="title" // Show title on Y-axis
                                type="category"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) =>
                                    value.length > 15 ? value.slice(0, 15) + "…" : value // Truncate
                                }
                                width={100} // Adjust width
                            />
                            <XAxis dataKey="count" type="number" hide />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" hideLabel />}
                            />
                            <Bar dataKey="count" layout="vertical" fill="var(--color-count)" radius={4} />
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