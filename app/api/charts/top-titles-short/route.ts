import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = 'force-dynamic';

interface TitleData {
    title: string;
    count: number;
}

export async function GET() {
  try {
    const result = await sql`
      SELECT
        job_title_short,
        COUNT(*) as count
      FROM data_jobs
      WHERE job_title_short IS NOT NULL
      GROUP BY job_title_short
      ORDER BY count DESC
      LIMIT 5; -- Get top 5 titles
    `;

    const chartData: TitleData[] = result.map(row => ({
        title: row.job_title_short,
        count: parseInt(row.count, 10),
    }));

    return NextResponse.json(chartData);

  } catch (error) {
    console.error('Failed to fetch top titles data:', error);
    return NextResponse.json(
        { error: 'Failed to fetch top titles data', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
    );
  }
} 