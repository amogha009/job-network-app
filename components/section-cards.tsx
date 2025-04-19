import { Loader2, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define the structure of the individual card data expected from the API
interface CardData {
  value: number | string;
  trend: number | null; // Example: +12.5, -20. Null if no trend data
  description: string;
  // rawValue?: number; // Optional raw value if needed
}

// Define the structure of the API response data passed as props
interface SectionCardsData {
  totalJobs: CardData;
  remoteJobs: CardData;
  avgYearlySalary: CardData;
  newJobsLast7Days: CardData;
}

// Define the props for the SectionCards component
interface SectionCardsProps {
  data: SectionCardsData | null;
  isLoading: boolean;
  error: string | null;
}

// Helper component for rendering a single card
interface DataCardProps {
  title: string;
  data: CardData;
}

function DataCard({ title, data }: DataCardProps) {
  const { value, trend, description } = data;
  const isPositive = trend !== null && trend >= 0;
  const TrendIcon =
    trend === null ? null : isPositive ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Card className="@container/card">
      <CardHeader className="relative pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        {TrendIcon && (
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className={`flex gap-1 rounded-lg text-xs ${
                isPositive
                  ? "text-green-600 border-green-600/50"
                  : "text-red-600 border-red-600/50"
              }`}
            >
              <TrendIcon className="size-3" />
              {isPositive ? "+" : ""}
              {trend}%
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {" "}
        {/* Changed from CardFooter for main description */}
        <div className="text-xs text-muted-foreground">{description}</div>
      </CardContent>
      {/* Optional Footer for additional context if needed
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                     Some additional info <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                     Context for the additional info
                    </div>
                </CardFooter>
             */}
    </Card>
  );
}

// Updated SectionCards component to accept props
export function SectionCards({ data, isLoading, error }: SectionCardsProps) {
  const cardBaseClasses =
    "*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6";

  if (isLoading) {
    return (
      <div className={`${cardBaseClasses} animate-pulse`}>
        {/* Render placeholder skeletons */}
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader className="pb-2">
              <div className="h-4 w-2/4 rounded bg-muted"></div>{" "}
              {/* Skeleton for description */}
              <div className="h-8 w-3/4 rounded bg-muted mt-1"></div>{" "}
              {/* Skeleton for title */}
            </CardHeader>
            <CardContent>
              <div className="h-3 w-full rounded bg-muted"></div>{" "}
              {/* Skeleton for content description */}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 lg:px-6 text-center py-4 text-red-600 border border-red-600/50 rounded-md bg-red-500/10">
        Error loading card data: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-4 lg:px-6 text-center py-4 text-muted-foreground border border-border rounded-md">
        No card data available.
      </div>
    );
  }

  // Render actual cards with fetched data
  return (
    <div className={cardBaseClasses}>
      <DataCard title="Total Jobs" data={data.totalJobs} />
      <DataCard title="Remote Jobs" data={data.remoteJobs} />
      <DataCard title="Avg Yearly Salary" data={data.avgYearlySalary} />
      <DataCard title="New Jobs (Last 7d)" data={data.newJobsLast7Days} />
    </div>
  );
}
