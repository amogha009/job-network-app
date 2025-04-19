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
interface NoDegreeData {
    name: string; // "Yes" or "No"
    value: number;
    // fill: string;
}

interface ChartNoDegreeProps {
    data: NoDegreeData[];
    isLoading: boolean;
    error: string | null;
}

// Client-side color mapping with direct colors
const CLIENT_COLORS = {
    Yes: "#f59e0b", // Amber
    No: "#0ea5e9",  // Blue
};

// Define chart config dynamically based on data and client-side colors
const generateChartConfig = (data: NoDegreeData[]): ChartConfig => {
    const config: ChartConfig = {};
    data.forEach(item => {
        const label = item.name === 'Yes' ? 'No Degree Mentioned' : 'Degree Mentioned/Unclear';
        const color = CLIENT_COLORS[item.name as keyof typeof CLIENT_COLORS];
        config[item.name] = {
            label: label,
            color: color,
        };
    });
    return config;
};

export function ChartNoDegree({ data, isLoading, error }: ChartNoDegreeProps) {
    const chartConfig = React.useMemo(() => generateChartConfig(data), [data]);
    const totalValue = React.useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="items-center pb-0">
                <CardTitle>"No Degree" Mentioned</CardTitle>
                <CardDescription>Jobs explicitly stating no degree needed</CardDescription>
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
                                // Ensure tooltip formatter uses the config label
                                content={<ChartTooltipContent hideLabel nameKey="name" formatter={(value, name, props) => [`${value}`, chartConfig[name as keyof typeof chartConfig]?.label || name]}/>}
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
                                        // Assign fill color client-side based on name
                                        fill={CLIENT_COLORS[entry.name as keyof typeof CLIENT_COLORS]}
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
                    const color = CLIENT_COLORS[item.name as keyof typeof CLIENT_COLORS];
                    const label = chartConfig[item.name]?.label || item.name; // Use label from config
                    return (
                        <div key={item.name} className="flex items-center gap-1.5 leading-none">
                            <span
                                className="h-3 w-3 shrink-0 rounded-[2px]"
                                style={{ backgroundColor: color }}
                            />
                            {label} ({item.value})
                        </div>
                    )
                 })}
            </div>
        </Card>
    )
} 