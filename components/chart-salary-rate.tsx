"use client";

import * as React from "react";
import { Pie, PieChart, Cell } from "recharts";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Structure expected from the API
interface SalaryRateData {
  name: string;
  value: number;
  // fill: string; // Color assigned client-side
}

interface ChartSalaryRateProps {
  data: SalaryRateData[];
  isLoading: boolean;
  error: string | null;
}

// Client-side color palette (Using hardcoded hex values for testing)
const CLIENT_COLORS = [
  "#8884d8", // Purple
  "#82ca9d", // Green
  "#ffc658", // Yellow
  "#ff8042", // Orange
  "#00C49F", // Teal
  // Add more distinct colors if needed
];

// Define chart config dynamically based on data and client-side colors
const generateChartConfig = (data: SalaryRateData[]): ChartConfig => {
  const config: ChartConfig = {};
  data.forEach((item, index) => {
    config[item.name] = {
      label: item.name,
      color: CLIENT_COLORS[index % CLIENT_COLORS.length],
    };
  });
  return config;
};

export function ChartSalaryRate({
  data,
  isLoading,
  error,
}: ChartSalaryRateProps) {
  const chartConfig = React.useMemo(() => generateChartConfig(data), [data]);
  const totalValue = React.useMemo(
    () => data.reduce((acc, curr) => acc + curr.value, 0),
    [data]
  );

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Salary Rate Distribution</CardTitle>
        <CardDescription>
          Distribution of specified salary rates
        </CardDescription>
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
          <ChartContainer config={chartConfig} className="w-full h-[250px]">
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
                    fill={
                      chartConfig[entry.name]?.color ||
                      CLIENT_COLORS[index % CLIENT_COLORS.length]
                    }
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
      <div className="flex items-center justify-center gap-4 p-4 text-sm font-medium flex-wrap">
        {data.map((item, index) => {
          const color =
            chartConfig[item.name]?.color ||
            CLIENT_COLORS[index % CLIENT_COLORS.length];
          return (
            <div
              key={item.name}
              className="flex items-center gap-1.5 leading-none"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-[2px]"
                style={{ backgroundColor: color }}
              />
              {item.name} ({item.value})
            </div>
          );
        })}
      </div>
    </Card>
  );
}
