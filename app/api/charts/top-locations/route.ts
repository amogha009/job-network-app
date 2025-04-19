import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = 'force-dynamic';

// Structure for Bar chart
interface LocationData {
    location: string;
    count: number;
}

export async function GET() {
  try {
    const result = await sql`
      SELECT
        job_location,
        COUNT(*) as count
      FROM data_jobs
      WHERE job_location IS NOT NULL
      GROUP BY job_location
      ORDER BY count DESC
      LIMIT 10; -- Get top 10 locations
    `;

    // Format data for the Bar chart
    const chartData: LocationData[] = result.map(row => ({
        location: row.job_location,
        count: parseInt(row.count, 10),
    }));

    return NextResponse.json(chartData);

  } catch (error) {
    console.error('Failed to fetch top locations data:', error);
    return NextResponse.json(
        { error: 'Failed to fetch top locations data', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
    );
  }
} 