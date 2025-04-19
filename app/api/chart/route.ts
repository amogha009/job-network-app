import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = 'force-dynamic'; // Ensure data is fetched fresh on each request

export async function GET() {
  try {
    // Find the latest date in the dataset
    const maxDateResult = await sql`SELECT MAX(job_posted_date) as max_date FROM data_jobs;`;
    // Use today as fallback if table is empty, though unlikely for this dataset
    const maxDate = maxDateResult[0]?.max_date ? new Date(maxDateResult[0].max_date) : new Date();

    // Calculate the start and end dates for the 12-month period based on maxDate
    // Start date: Beginning of the month 11 months before the month of maxDate
    const startDate = new Date(maxDate.getFullYear(), maxDate.getMonth() - 11, 1);
    // End date: Beginning of the month *after* the month of maxDate
    const endDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1);

    // Fetch job counts grouped by month within the calculated 12-month window
    const result = await sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', job_posted_date), 'YYYY-MM-DD') as month,
        COUNT(*) as job_count
      FROM data_jobs
      WHERE job_posted_date >= ${startDate.toISOString().split('T')[0]}::date
        AND job_posted_date < ${endDate.toISOString().split('T')[0]}::date
      GROUP BY DATE_TRUNC('month', job_posted_date)
      ORDER BY month ASC;
    `;

    // Format data for the chart
    const chartData = result.map(row => ({
        date: row.month,
        jobs: parseInt(row.job_count, 10),
    }));

    // Fill in missing months with 0 jobs to ensure a continuous timeline
    const finalChartData = [];
    let currentCheckDate = new Date(startDate); // Start from the calculated start date

    while (currentCheckDate < endDate) {
        const monthString = currentCheckDate.toISOString().split('T')[0].substring(0, 7) + '-01'; // YYYY-MM-01
        const existingEntry = chartData.find(entry => entry.date === monthString);

        finalChartData.push({
            date: monthString,
            jobs: existingEntry ? existingEntry.jobs : 0,
        });

        // Move to the next month
        currentCheckDate.setMonth(currentCheckDate.getMonth() + 1);
    }

    // Return both the chart data and the date range it covers
    return NextResponse.json({
        data: finalChartData,
        range: {
             // Send dates in ISO string format for easy parsing on client
            start: startDate.toISOString(),
            end: maxDate.toISOString() // Use the actual max date for the end label
        }
    });

  } catch (error) {
    console.error('Failed to fetch chart data:', error);
    return NextResponse.json(
        { error: 'Failed to fetch chart data', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
    );
  }
} 