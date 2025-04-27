import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = 'force-dynamic';

interface ScheduleWfhData {
    schedule_type: string;
    remote: number;
    office: number;
}

export async function GET() {
  try {
    // Fetch counts grouped by schedule type and WFH status
    const result = await sql`
      SELECT
        job_schedule_type,
        job_work_from_home,
        COUNT(*) as count
      FROM data_jobs
      WHERE job_schedule_type IS NOT NULL
      GROUP BY job_schedule_type, job_work_from_home
      ORDER BY job_schedule_type, job_work_from_home;
    `;

    // Pivot the data: { schedule_type: 'Full-time', remote: 100, office: 500 }
    const pivotedData: { [key: string]: { remote: number; office: number } } = {};

    result.forEach(row => {
        const scheduleType = row.job_schedule_type || 'Unknown';
        if (!pivotedData[scheduleType]) {
            pivotedData[scheduleType] = { remote: 0, office: 0 };
        }

        const count = parseInt(row.count, 10);
        if (row.job_work_from_home === true) {
            pivotedData[scheduleType].remote += count;
        } else {
            pivotedData[scheduleType].office += count;
        }
    });

    // Convert pivoted data to array format for the chart
    const chartData: ScheduleWfhData[] = Object.entries(pivotedData).map(([scheduleType, counts]) => ({
        schedule_type: scheduleType,
        remote: counts.remote,
        office: counts.office,
    })).sort((a, b) => (b.remote + b.office) - (a.remote + a.office)); // Sort by total count descending

    return NextResponse.json(chartData);

  } catch (error) {
    console.error('Failed to fetch schedule/wfh split data:', error);
    return NextResponse.json(
        { error: 'Failed to fetch schedule/wfh split data', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
    );
  }
} 