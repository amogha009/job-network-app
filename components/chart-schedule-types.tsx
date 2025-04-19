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

// Structure expected from the API (Removed fill)
interface ScheduleTypeData {
  name: string;
  value: number;
  // fill: string; // Color will be assigned client-side
}

interface ChartScheduleTypesProps {
  data: ScheduleTypeData[];
  isLoading: boolean;
  error: string | null;
}

// Enhanced client-side color palette with more distinct colors
const CLIENT_COLORS = [
  "#f97316", // Orange
  "#0ea5e9", // Blue
  "#8b5cf6", // Purple
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#a855f7", // Violet
  "#eab308", // Yellow
  "#6366f1", // Indigo
  "#84cc16", // Lime
  "#d946ef", // Fuchsia
  "#22c55e", // Emerald
  "#f43f5e", // Rose
  "#3b82f6", // Sky Blue
  "#a21caf", // Deep Purple
  "#65a30d", // Light Green
  "#ea580c", // Deep Orange
  "#0891b2", // Light Blue
  "#be123c", // Crimson
  "#15803d", // Forest Green
  "#7c3aed", // Intense Purple
  "#b91c1c", // Dark Red
  "#0369a1", // Dark Blue
  "#c2410c", // Rust
  "#4f46e5", // Royal Blue
  "#16a34a", // Bright Green
  "#9333ea", // Bright Purple
  "#0d9488", // Dark Teal
  "#b45309", // Brown
  "#dc2626", // Bright Red
  "#2563eb", // Medium Blue
  "#059669", // Medium Green
];

// Define chart config dynamically based on data and client-side colors
const generateChartConfig = (data: ScheduleTypeData[]): ChartConfig => {
  const config: ChartConfig = {};
  data.forEach((item, index) => {
    config[item.name] = {
      label: item.name,
      color: CLIENT_COLORS[index % CLIENT_COLORS.length], // Use direct color values
    };
  });
  return config;
};

export function ChartScheduleTypes({
  data,
  isLoading,
  error,
}: ChartScheduleTypesProps) {
  const chartConfig = React.useMemo(() => generateChartConfig(data), [data]);
  const totalValue = React.useMemo(
    () => data.reduce((acc, curr) => acc + curr.value, 0),
    [data]
  );

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Jobs by Schedule Type</CardTitle>
        <CardDescription>Distribution of job schedule types</CardDescription>
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
          <div className="flex flex-row w-full">
            <div className="w-1/2">
              <ChartContainer config={chartConfig} className="w-full h-[350px]">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="name" />}
                  />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CLIENT_COLORS[index % CLIENT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <div className="w-1/2">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 p-4 text-[14px] font-medium">
                {data.map((item, index) => {
                  const color = CLIENT_COLORS[index % CLIENT_COLORS.length];
                  return (
                    <div
                      key={item.name}
                      className="flex items-center gap-1.5 leading-none"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate">
                        {item.name} ({item.value})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {!isLoading && !error && data.length === 0 && (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
