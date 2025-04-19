"use client";

import * as React from "react";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
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

// Define explicit colors for chart segments
const COLORS = ["#3B82F6", "#10B981"]; // Blue and Green

interface WfhData {
  name: string; // "Remote" or "Office"
  value: number;
  fill?: string;
}

interface ChartWfhDistributionProps {
  data: WfhData[];
  isLoading: boolean;
  error: string | null;
}

const generateChartConfig = (data: WfhData[]): ChartConfig => {
  const config: ChartConfig = {};
  data.forEach((item, index) => {
    config[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
  });
  return config;
};

export function ChartWfhDistribution({
  data,
  isLoading,
  error,
}: ChartWfhDistributionProps) {
  const chartConfig = React.useMemo(() => generateChartConfig(data), [data]);

  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Remote vs. Office</CardTitle>
        <CardDescription>Distribution of jobs by work location</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
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
          <div className="w-full h-[250px]">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
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
                    paddingAngle={2}
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
        {/* Show "No data" if loading finished, no error, but data array is empty OR total is 0 */}
        {!isLoading && !error && (data.length === 0 || totalValue === 0) && (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No data available.
          </div>
        )}
      </CardContent>
      {/* Optional: Add a footer for legends */}
      <div className="flex items-center justify-center gap-4 p-4 text-sm font-medium">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center gap-1.5 leading-none"
          >
            <span
              className="h-3 w-3 shrink-0 rounded-[2px]"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            {item.name} ({item.value})
          </div>
        ))}
      </div>
    </Card>
  );
}
