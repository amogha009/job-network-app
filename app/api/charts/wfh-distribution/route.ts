import { NextResponse, NextRequest } from "next/server"; // Import NextRequest
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

export async function GET(request: NextRequest) { // Add request parameter
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || ''; // Get search param

    // Construct WHERE clause for search
    const whereClause = search
      ? sql`WHERE (job_title ILIKE ${`%${search}%`} OR company_name ILIKE ${`%${search}%`})`
      : sql``; // Empty fragment if no search

    const result = await sql`
      SELECT
        job_work_from_home,
        COUNT(*) as count
      FROM data_jobs
      ${whereClause} -- Add the where clause here
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
