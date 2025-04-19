import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = 'force-dynamic';

interface InsuranceData {
    name: string; // "Yes" or "No" or "Unknown"
    value: number;
    fill: string;
}

// Define specific colors
const COLORS = {
    Yes: "hsl(var(--chart-1))",
    No: "hsl(var(--chart-2))",
    Unknown: "hsl(var(--chart-3))",
};

export async function GET() {
  try {
    const result = await sql`
      SELECT
        job_health_insurance,
        COUNT(*) as count
      FROM data_jobs
      -- Group by the boolean column directly
      GROUP BY job_health_insurance;
    `;

    const chartData: InsuranceData[] = result.map(row => {
        let name: string;
        let fill: string;
        if (row.job_health_insurance === true) {
            name = "Yes";
            fill = COLORS.Yes;
        } else if (row.job_health_insurance === false) {
            name = "No";
            fill = COLORS.No;
        } else {
            // Handle potential NULL values if the column allows it
            name = "Unknown";
            fill = COLORS.Unknown;
        }
        return {
            name: name,
            value: parseInt(row.count, 10),
            fill: fill,
        };
    });

    // Ensure all expected categories exist even if count is 0
    if (!chartData.some(item => item.name === "Yes")) {
        chartData.push({ name: "Yes", value: 0, fill: COLORS.Yes });
    }
    if (!chartData.some(item => item.name === "No")) {
        chartData.push({ name: "No", value: 0, fill: COLORS.No });
    }
    // Optionally include Unknown if nulls are possible and relevant
    // if (result.some(row => row.job_health_insurance === null) && !chartData.some(item => item.name === "Unknown")) {
    //     chartData.push({ name: "Unknown", value: 0, fill: COLORS.Unknown });
    // }

    return NextResponse.json(chartData.sort((a, b) => b.value - a.value)); // Sort descending

  } catch (error) {
    console.error('Failed to fetch health insurance data:', error);
    return NextResponse.json(
        { error: 'Failed to fetch health insurance data', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
    );
  }
} 