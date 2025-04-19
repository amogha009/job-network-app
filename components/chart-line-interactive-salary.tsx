"use client";

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

// API Response Structure
interface SalaryTrendData {
  date: string; // YYYY-MM-DD
  avg_salary: number | null;
}

interface ChartProps {
  data: SalaryTrendData[];
  isLoading: boolean;
  error: string | null;
}

const chartConfig = {
  avg_salary: {
    label: "Avg Salary (Yearly)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ChartLineInteractiveSalary({
  data,
  isLoading,
  error,
}: ChartProps) {
  // Format salary for tooltip/display
  const formatSalary = (value: number | null) => {
    if (value === null || value === 0) return "N/A";
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Average Yearly Salary Trend</CardTitle>
        <CardDescription>
          Monthly average of `salary_year_avg` (last 12 months)
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
        {!isLoading && !error && data.length > 0 && (
          <div style={{ width: "100%", height: "300px" }}>
            <ChartContainer config={chartConfig} className="w-full h-full">
              <LineChart
                accessibilityLayer
                data={data}
                margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    const date = new Date(value + "T00:00:00");
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      year: "2-digit",
                    });
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `$${value / 1000}k`} // Format as $XXXk
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(value) => {
                        const date = new Date(value + "T00:00:00");
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        });
                      }}
                      formatter={(value) =>
                        formatSalary(value as number | null)
                      }
                    />
                  }
                />
                <Line
                  dataKey="avg_salary"
                  type="monotone"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={true}
                  connectNulls={true}
                />
              </LineChart>
            </ChartContainer>
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
