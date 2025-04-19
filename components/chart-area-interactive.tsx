"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, TooltipProps } from "recharts"
import { Loader2 } from "lucide-react"

// Removed useIsMobile hook as it's not used directly with fetched data logic
// import { useIsMobile } from "@/hooks/use-mobile"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
// Removed ToggleGroup as the time range logic might change or be simplified
// import {
//     ToggleGroup,
//     ToggleGroupItem,
// } from "@/components/ui/toggle-group"

// Define the expected structure for a single data point from the API
interface ChartDataItem {
    date: string; // Expecting 'YYYY-MM-DD' format from API
    jobs: number;
}

// Define the props for the ChartAreaInteractive component
interface ChartAreaInteractiveProps {
    data: ChartDataItem[];
    isLoading: boolean;
    error: string | null;
    range: { start: string; end: string } | null; // Add range prop
}

// Removed static chartData
// const chartData = [ ... ];

// Update chartConfig for the new data key ('jobs')
const chartConfig = {
    jobs: {
        label: "Jobs Posted",
        color: "hsl(var(--chart-1))", // Use primary chart color
    },
    // Remove desktop/mobile if not used
    // desktop: { ... },
    // mobile: { ... },
} satisfies ChartConfig

// Define a type for the tooltip payload
interface CustomTooltipPayload {
  dataKey: keyof typeof chartConfig;
  name: string;
  color: string;
  value: number;
  payload: ChartDataItem; // Original data point for this tooltip item
}

export function ChartAreaInteractive({ data, isLoading, error, range }: ChartAreaInteractiveProps) {
    // Removed isMobile and related useEffect as time filtering might need rework
    // const isMobile = useIsMobile()
    // const [timeRange, setTimeRange] = React.useState("90d") // Default to 90d or similar

    // React.useEffect(() => {
    //     if (isMobile) {
    //         setTimeRange("30d") // Adjust mobile default if needed
    //     }
    // }, [isMobile])

    // Removed client-side filtering logic, assuming API provides desired range
    // const filteredData = data.filter(...) // If filtering is needed, re-implement based on props/state

    // Function to format date range for description
    const formatRangeDescription = () => {
        if (!range?.start || !range?.end) {
            return "Monthly job postings"; // Fallback description
        }
        try {
            const startDate = new Date(range.start);
            const endDate = new Date(range.end);
            const startMonth = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            const endMonth = endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            // Describe the 12-month period ending in the month of the last data point
            return `Job Postings: ${startMonth} - ${endMonth}`;
        } catch (e) {
            console.error("Error formatting date range:", e);
            return "Monthly job postings for the period"; // Fallback on formatting error
        }
    };

    return (
        <Card className="@container/card">
            <CardHeader className="relative">
                {/* Update title/description for new data */}
                <CardTitle>Monthly Job Postings</CardTitle>
                <CardDescription>
                    {formatRangeDescription()}
                </CardDescription>
                 {/* Removed Time Range Selector - Add back if needed with state/logic */}
                {/* <div className="absolute right-4 top-4"> ... </div> */}
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                 {/* Handle Loading State */}
                {isLoading && (
                    <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                )}
                 {/* Handle Error State */}
                {error && !isLoading && (
                    <div className="flex h-[250px] w-full items-center justify-center text-red-600">
                        Error: {error}
                    </div>
                )}
                 {/* Render Chart when data is available and not loading/error */}
                {!isLoading && !error && (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <AreaChart data={data} /* Use fetched data */ >
                            <defs>
                                 {/* Update gradient ID and color variable */}
                                <linearGradient id="fillJobs" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-jobs)" /* Use color from config */
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-jobs)" /* Use color from config */
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                                {/* Remove mobile gradient if not used */}
                                {/* <linearGradient id="fillMobile"> ... </linearGradient> */}
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    // Format as 'M/YY' (e.g., 4/23)
                                    const date = new Date(value + 'T00:00:00')
                                    return date.toLocaleDateString("en-US", {
                                        month: "numeric",
                                        year: "2-digit",
                                    })
                                }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                // Optional: specify domain or ticks based on data range
                            />
                             <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        indicator="dot"
                                        labelFormatter={(value) => {
                                            // Format the date label (Month YYYY)
                                            const date = new Date(value + 'T00:00:00');
                                            return date.toLocaleDateString("en-US", {
                                                month: "short",
                                                year: "numeric",
                                            });
                                        }}
                                        // Formatter can customize the value display if needed
                                        // formatter={(value, name, props) => [
                                        //    `${value} jobs`, // Example: Append "jobs" to the value
                                        //     chartConfig[props.dataKey as keyof typeof chartConfig]?.label || name
                                        // ]}
                                    />
                                }
                            />
                            <Area
                                dataKey="jobs" /* Use the new data key */
                                type="natural"
                                fill="url(#fillJobs)" /* Use the updated gradient ID */
                                fillOpacity={0.4} // Added fillOpacity for better gradient visibility
                                stroke="var(--color-jobs)" /* Use color from config */
                                stackId="a" // Keep stackId if needed, or remove if only one area
                            />
                            {/* Remove mobile Area if not used */}
                            {/* <Area dataKey="mobile" ... /> */}
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
