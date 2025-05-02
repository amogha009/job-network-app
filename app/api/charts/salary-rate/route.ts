import { NextResponse, NextRequest } from "next/server"; // Import NextRequest
import sql from "@/lib/db";

export const dynamic = 'force-dynamic';

interface SalaryRateData {
    name: string;
    value: number;
    fill: string;
}

// Client-side color palette
const CLIENT_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

export async function GET(request: NextRequest) { // Add request parameter
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || ''; // Get search param

    // Base conditions
    let baseConditions: any[] = [sql`salary_rate IS NOT NULL`];

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
        salary_rate,
        COUNT(*) as count
      FROM data_jobs
      ${whereClause} -- Add the combined where clause here
      GROUP BY salary_rate
      ORDER BY count DESC;
    `;

    const chartData: SalaryRateData[] = result.map((row, index) => ({
        name: row.salary_rate || 'Unknown',
        value: parseInt(row.count, 10),
        // Assign colors client-side in component, just pass data
        fill: CLIENT_COLORS[index % CLIENT_COLORS.length], // Assigning placeholder color for API consistency
    }));

    return NextResponse.json(chartData);

  } catch (error) {
    console.error('Failed to fetch salary rate data:', error);
    return NextResponse.json(
        { error: 'Failed to fetch salary rate data', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
    );
  }
}
