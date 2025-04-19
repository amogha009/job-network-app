import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = 'force-dynamic';

interface CompanyData {
    company: string;
    count: number;
}

export async function GET() {
  try {
    const result = await sql`
      SELECT
        company_name,
        COUNT(*) as count
      FROM data_jobs
      WHERE company_name IS NOT NULL AND company_name <> ''
      GROUP BY company_name
      ORDER BY count DESC
      LIMIT 5; -- Get top 5 companies
    `;

    const chartData: CompanyData[] = result.map(row => ({
        company: row.company_name,
        count: parseInt(row.count, 10),
    }));

    return NextResponse.json(chartData);

  } catch (error) {
    console.error('Failed to fetch top companies data:', error);
    return NextResponse.json(
        { error: 'Failed to fetch top companies data', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
    );
  }
} 