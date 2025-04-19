import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = 'force-dynamic';

interface WfhData {
    name: string; // "Remote" or "Office"
    value: number;
    fill: string;
}

// Define specific colors
const COLORS = {
    Remote: "hsl(var(--chart-1))",
    Office: "hsl(var(--chart-2))",
};

export async function GET() {
  try {
    const result = await sql`
      SELECT
        job_work_from_home,
        COUNT(*) as count
      FROM data_jobs
      -- No WHERE clause needed unless you want to exclude nulls, but boolean usually isn't null
      GROUP BY job_work_from_home;
    `;

    const chartData: WfhData[] = result.map(row => {
        const isRemote = row.job_work_from_home; // Assuming this is boolean
        const name = isRemote ? "Remote" : "Office";
        return {
            name: name,
            value: parseInt(row.count, 10),
            fill: isRemote ? COLORS.Remote : COLORS.Office,
        };
    });

    // Ensure both categories exist even if count is 0
    if (!chartData.some(item => item.name === "Remote")) {
        chartData.push({ name: "Remote", value: 0, fill: COLORS.Remote });
    }
    if (!chartData.some(item => item.name === "Office")) {
        chartData.push({ name: "Office", value: 0, fill: COLORS.Office });
    }

    return NextResponse.json(chartData.sort((a, b) => b.value - a.value)); // Sort descending

  } catch (error) {
    console.error('Failed to fetch WFH distribution data:', error);
    return NextResponse.json(
        { error: 'Failed to fetch WFH distribution data', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
    );
  }
} 