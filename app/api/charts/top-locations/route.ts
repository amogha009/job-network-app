import { NextResponse, NextRequest } from "next/server"; // Import NextRequest
import sql from "@/lib/db";

export const dynamic = 'force-dynamic';

// Structure for Bar chart
interface LocationData {
    location: string;
    count: number;
}

export async function GET(request: NextRequest) { // Add request parameter
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || ''; // Get search param
    const location = searchParams.get('location');
    const schedule = searchParams.get('schedule');
    const minSalaryStr = searchParams.get('minSalary');
    const maxSalaryStr = searchParams.get('maxSalary');

    // Base conditions
    let baseConditions: any[] = [sql`job_location IS NOT NULL`];

    // Add search condition if search query is provided
    if (search) {
      const searchTerm = `%${search}%`;
      baseConditions.push(sql`(job_title ILIKE ${searchTerm} OR company_name ILIKE ${searchTerm})`);
    }
    // Add location condition
    if (location) {
      baseConditions.push(sql`job_location = ${location}`);
    }
    // Add schedule type condition
    if (schedule) {
      baseConditions.push(sql`job_schedule_type = ${schedule}`);
    }
    // Add salary range conditions
    const minSalary = minSalaryStr ? parseFloat(minSalaryStr) : null;
    const maxSalary = maxSalaryStr ? parseFloat(maxSalaryStr) : null;
    if (minSalary !== null && !isNaN(minSalary)) {
      baseConditions.push(sql`salary_year_avg >= ${minSalary}`);
    }
    if (maxSalary !== null && !isNaN(maxSalary)) {
      baseConditions.push(sql`salary_year_avg <= ${maxSalary}`);
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

    const result = await sql`
      SELECT
        job_location,
        COUNT(*) as count
      FROM data_jobs
      ${whereClause} -- Add the combined where clause here
      GROUP BY job_location
      ORDER BY count DESC
      LIMIT 10; -- Get top 10 locations based on filtered results
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
