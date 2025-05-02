import { NextResponse, NextRequest } from "next/server"; // Import NextRequest
import sql from "@/lib/db";

export const dynamic = 'force-dynamic';

interface ScheduleWfhData {
    schedule_type: string;
    remote: number;
    office: number;
}

export async function GET(request: NextRequest) { // Add request parameter
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || ''; // Get search param

    // Base conditions
    let baseConditions: any[] = [sql`job_schedule_type IS NOT NULL`];

    // Add search condition if search query is provided
    if (search) {
      const searchTerm = `%${search}%`;
      baseConditions.push(sql`(job_title ILIKE ${searchTerm} OR company_name ILIKE ${searchTerm})`);
    }

    // Combine conditions with AND, starting with WHERE
    let whereClause = sql``; // Start with an empty SQL fragment
    if (baseConditions.length > 0) {
        whereClause = sql`WHERE `; // Start with WHERE
        baseConditions.forEach((condition, index) => {
            whereClause = sql`${whereClause}${condition}`; // Append the condition fragment
            if (index < baseConditions.length - 1) {
                whereClause = sql`${whereClause} AND `; // Append AND if not the last condition
            }
        });
    }

    // Fetch counts grouped by schedule type and WFH status
    const result = await sql`
      SELECT
        job_schedule_type,
        job_work_from_home,
        COUNT(*) as count
      FROM data_jobs
      ${whereClause} -- Add the combined where clause here
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
