"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"
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

// Structure expected from the API (Removed fill)
interface InsuranceData {
    name: string; // "Yes" or "No" or "Unknown"
    value: number;
    // fill: string;
}

interface ChartHealthInsuranceProps {
    data: InsuranceData[];
    isLoading: boolean;
    error: string | null;
}

// Client-side color mapping with direct colors
const CLIENT_COLORS = {
    Yes: "#10b981", // Green
    No: "#ef4444",  // Red
    Unknown: "#8b5cf6", // Purple
};

// Define chart config dynamically based on data and client-side colors
const generateChartConfig = (data: InsuranceData[]): ChartConfig => {
    const config: ChartConfig = {};
    data.forEach(item => {
        config[item.name] = {
            label: item.name,
            color: CLIENT_COLORS[item.name as keyof typeof CLIENT_COLORS] || CLIENT_COLORS.Unknown,
        };
    });
    return config;
};

export function ChartHealthInsurance({ data, isLoading, error }: ChartHealthInsuranceProps) {
    const chartConfig = React.useMemo(() => generateChartConfig(data), [data]);
    const totalValue = React.useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="items-center pb-0">
                <CardTitle>Health Insurance Mentioned</CardTitle>
                <CardDescription>Jobs mentioning health insurance</CardDescription>
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
                {!isLoading && !error && data.length > 0 && totalValue > 0 && (
                    <ChartContainer
                        config={chartConfig}
                        className="w-full h-[250px]"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel nameKey="name" />}
                            />
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={50}
                                outerRadius={90}
                                strokeWidth={5}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={CLIENT_COLORS[entry.name as keyof typeof CLIENT_COLORS] || CLIENT_COLORS.Unknown}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                )}
                 {!isLoading && !error && (data.length === 0 || totalValue === 0) && (
                     <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                         No data available.
                     </div>
                )}
            </CardContent>
             <div className="flex items-center justify-center gap-4 p-4 text-sm font-medium">
                 {data.map((item) => {
                    const color = CLIENT_COLORS[item.name as keyof typeof CLIENT_COLORS] || CLIENT_COLORS.Unknown;
                    return (
                        <div key={item.name} className="flex items-center gap-1.5 leading-none">
                            <span
                                className="h-3 w-3 shrink-0 rounded-[2px]"
                                style={{ backgroundColor: color }}
                            />
                            {item.name} ({item.value})
                        </div>
                    )
                 })}
            </div>
        </Card>
    )
} 