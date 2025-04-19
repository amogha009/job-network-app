import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = 'force-dynamic';

interface NoDegreeData {
    name: string; // "Yes" (No Degree Mentioned) or "No" (Degree Mentioned/Unclear)
    value: number;
    fill: string;
}

// Define specific colors
const COLORS = {
    Yes: "hsl(var(--chart-1))", // Consider colors that fit the context
    No: "hsl(var(--chart-2))",
};

export async function GET() {
  try {
    const result = await sql`
      SELECT
        job_no_degree_mention,
        COUNT(*) as count
      FROM data_jobs
      GROUP BY job_no_degree_mention;
    `;

    const chartData: NoDegreeData[] = result.map(row => {
        const noDegreeMention = row.job_no_degree_mention; // Assuming this is boolean
        const name = noDegreeMention ? "Yes" : "No";
        return {
            name: name,
            value: parseInt(row.count, 10),
            fill: noDegreeMention ? COLORS.Yes : COLORS.No,
        };
    });

    // Ensure both categories exist even if count is 0
    if (!chartData.some(item => item.name === "Yes")) {
        chartData.push({ name: "Yes", value: 0, fill: COLORS.Yes });
    }
    if (!chartData.some(item => item.name === "No")) {
        chartData.push({ name: "No", value: 0, fill: COLORS.No });
    }

    return NextResponse.json(chartData.sort((a, b) => b.value - a.value)); // Sort descending

  } catch (error) {
    console.error('Failed to fetch no degree mention data:', error);
    return NextResponse.json(
        { error: 'Failed to fetch no degree mention data', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
    );
  }
} 