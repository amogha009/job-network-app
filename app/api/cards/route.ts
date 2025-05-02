import { NextResponse, NextRequest } from "next/server";
import sql from "@/lib/db";
import { parseISO, isValid } from 'date-fns';

export const dynamic = 'force-dynamic'; // Ensure data is fetched fresh on each request

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  let startDate: Date | null = null;
  let endDate: Date | null = null;
  let dateConditions = sql`WHERE 1=1`; // Default condition
  let dateColumn = 'job_posted_date'; // Assuming this is the correct column

  if (startDateStr && endDateStr) {
    startDate = parseISO(startDateStr);
    endDate = parseISO(endDateStr);
    if (isValid(startDate) && isValid(endDate)) {
      // IMPORTANT: Adjust dateColumn if it's different in your schema!
      dateConditions = sql`WHERE ${sql(dateColumn)} >= ${startDate.toISOString()}::date AND ${sql(dateColumn)} <= ${endDate.toISOString()}::date`;
    } else {
        // Handle invalid dates? Maybe return error or ignore?
        // For now, ignoring and using default (all time)
        console.warn("Invalid date range provided, ignoring date filter.");
    }
  }

  try {
    // Base WHERE clauses for specific queries
    const remoteJobsCondition = sql`${dateConditions} AND job_work_from_home = TRUE`;
    const avgSalaryCondition = sql`${dateConditions} AND salary_year_avg IS NOT NULL`;
    // For new jobs, we interpret it as 'within the selected range'
    // If no range, it calculates based on all time (which might not be desired)
    // Alternative: Default to last 7 days if no range? Discuss if needed.
    const newJobsCondition = dateConditions; // Just use the date range condition

    // Fetch aggregated data in parallel using the date conditions
    const [
      totalJobsResult,
      remoteJobsResult,
      avgSalaryResult,
      newJobsResult,
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM data_jobs ${dateConditions};`,
      sql`SELECT COUNT(*) as count FROM data_jobs ${remoteJobsCondition};`,
      sql`SELECT AVG(salary_year_avg) as average FROM data_jobs ${avgSalaryCondition};`,
      // Use dateConditions for newJobs count - counts jobs *within* the selected range
      sql`SELECT COUNT(*) as count FROM data_jobs ${newJobsCondition};` // Replaced hardcoded 7 days
    ]);

    // Extract counts and averages
    const totalJobs = parseInt(totalJobsResult[0]?.count ?? '0', 10);
    const remoteJobs = parseInt(remoteJobsResult[0]?.count ?? '0', 10);
    const avgSalary = parseFloat(avgSalaryResult[0]?.average ?? '0');
    const newJobsLast7Days = parseInt(newJobsResult[0]?.count ?? '0', 10);

    // Prepare the response data
    const cardData = {
      totalJobs: {
        value: totalJobs,
        // Placeholder for trend/comparison logic
        trend: null,
        description: "Total job postings recorded.",
      },
      remoteJobs: {
        value: remoteJobs,
        // Placeholder for trend/comparison logic
        trend: null,
        description: "Jobs available for remote work.",
      },
      avgYearlySalary: {
         // Format as currency, handle null/0 average
        value: avgSalary > 0 ? `$${avgSalary.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'N/A',
        rawValue: avgSalary, // Keep raw value if needed
        // Placeholder for trend/comparison logic
        trend: null,
        description: "Average yearly salary (where available).",
      },
      newJobsLast7Days: {
        value: newJobsLast7Days,
         // Placeholder for trend/comparison logic
        trend: null,
        description: "Jobs posted within the selected period.",
      },
    };

    return NextResponse.json(cardData);

  } catch (error) {
    console.error('Failed to fetch card data:', error);
    // Return a structured error response
    return NextResponse.json(
        { error: 'Failed to fetch card data', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
    );
  }
} 