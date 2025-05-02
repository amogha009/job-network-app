import { NextResponse } from "next/server";
import sql from "@/lib/db";

import { NextRequest } from "next/server"; // Import NextRequest

export const dynamic = "force-dynamic";

interface SalaryTrendData {
  date: string; // YYYY-MM-DD
  avg_salary: number | null; // Can be null if no jobs with salary in a month
}

export async function GET(request: NextRequest) { // Add request parameter
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || ''; // Get search param

    // Find the latest date in the dataset
    const maxDateResult =
      await sql`SELECT MAX(job_posted_date) as max_date FROM data_jobs;`;
    const maxDate = maxDateResult[0]?.max_date
      ? new Date(maxDateResult[0].max_date)
      : new Date();

    // Calculate the start date for the 12-month period
    const startDate = new Date(
      maxDate.getFullYear(),
      maxDate.getMonth() - 11,
      1
    );
    const endDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1);

    // Fetch average salary grouped by month
    const result = await sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', job_posted_date), 'YYYY-MM-DD') as month,
        AVG(salary_year_avg) as average_salary
      FROM data_jobs
      WHERE job_posted_date >= ${startDate.toISOString().split("T")[0]}::date
        AND job_posted_date < ${endDate.toISOString().split("T")[0]}::date
        AND salary_year_avg IS NOT NULL -- Only consider jobs where salary is known
        ${search ? sql`AND (job_title ILIKE ${`%${search}%`} OR company_name ILIKE ${`%${search}%`})` : sql``} -- Add search condition
      GROUP BY DATE_TRUNC('month', job_posted_date)
      ORDER BY month ASC;
    `;

    // Format data and ensure all months are present
    const chartDataMap = new Map<string, number | null>();
    result.forEach((row) => {
      chartDataMap.set(
        row.month,
        row.average_salary ? parseFloat(row.average_salary) : null
      );
    });

    const finalChartData: SalaryTrendData[] = [];
    let currentCheckDate = new Date(startDate);

    while (currentCheckDate < endDate) {
      const monthString =
        currentCheckDate.toISOString().split("T")[0].substring(0, 7) + "-01"; // YYYY-MM-01
      finalChartData.push({
        date: monthString,
        avg_salary: chartDataMap.get(monthString) ?? null, // Use null for missing months or months with no salary data
      });
      currentCheckDate.setMonth(currentCheckDate.getMonth() + 1);
    }
    return NextResponse.json(finalChartData);
  } catch (error) {
    console.error("Failed to fetch average salary trend data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch average salary trend data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
