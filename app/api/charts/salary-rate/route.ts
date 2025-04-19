import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const result = await sql`
      SELECT
        salary_rate,
        COUNT(*) as count
      FROM data_jobs
      WHERE salary_rate IS NOT NULL
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