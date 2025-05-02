import { NextResponse, NextRequest } from "next/server"; // Import NextRequest
import sql from "@/lib/db";

export const dynamic = 'force-dynamic';

// Structure expected by the Pie chart component (e.g., name, value, fill color)
interface ScheduleTypeData {
    name: string;
    value: number;
    fill: string; // We'll assign colors here
}

// Predefined color palette for consistency
const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))", // Add more if more types are expected
];

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

    const result = await sql`
      SELECT
        job_schedule_type,
        COUNT(*) as count
      FROM data_jobs
      ${whereClause} -- Add the combined where clause here
      GROUP BY job_schedule_type
      ORDER BY count DESC;
    `;

    // Format data for the Pie chart, assign colors
    const chartData: ScheduleTypeData[] = result.map((row, index) => ({
        name: row.job_schedule_type || 'Unknown', // Handle potential nulls just in case
        value: parseInt(row.count, 10),
        // Assign colors cyclically from the palette
        fill: COLORS[index % COLORS.length],
    }));

    return NextResponse.json(chartData);

  } catch (error) {
    console.error('Failed to fetch schedule type data:', error);
    return NextResponse.json(
        { error: 'Failed to fetch schedule type data', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
    );
  }
}
