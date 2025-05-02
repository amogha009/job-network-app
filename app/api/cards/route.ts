import { NextResponse, NextRequest } from "next/server";
import sql from "@/lib/db";
import { parseISO, isValid } from 'date-fns';

export const dynamic = 'force-dynamic'; // Ensure data is fetched fresh on each request

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  const search = searchParams.get('search'); // Get the search query

  let startDate: Date | null = null;
  let endDate: Date | null = null;
  let baseConditions: any[] = []; // Use an array to build conditions
  let dateColumn = 'job_posted_date'; // Assuming this is the correct column

  // Add date condition if valid dates are provided
  if (startDateStr && endDateStr) {
    startDate = parseISO(startDateStr);
    endDate = parseISO(endDateStr);
    if (isValid(startDate) && isValid(endDate)) {
      // IMPORTANT: Adjust dateColumn if it's different in your schema!
      baseConditions.push(sql`${sql(dateColumn)} >= ${startDate.toISOString()}::date AND ${sql(dateColumn)} <= ${endDate.toISOString()}::date`);
    } else {
        // Handle invalid dates? Maybe return error or ignore?
        // For now, ignoring and using default (all time)
        console.warn("Invalid date range provided, ignoring date filter.");
    }
  }

  // Add search condition if search query is provided
  if (search) {
    const searchTerm = `%${search}%`;
    // Search in job_title and company_name (adjust columns as needed)
    baseConditions.push(sql`(job_title ILIKE ${searchTerm} OR company_name ILIKE ${searchTerm})`);
  }

  // Combine conditions with AND, starting with WHERE if conditions exist
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

  try {
    // Define specific conditions based on the combined whereClause
    // Check baseConditions.length to decide whether to add AND or WHERE
    const remoteJobsCondition = sql`${whereClause} ${baseConditions.length > 0 ? sql`AND` : sql`WHERE`} job_work_from_home = TRUE`;
    const avgSalaryCondition = sql`${whereClause} ${baseConditions.length > 0 ? sql`AND` : sql`WHERE`} salary_year_avg IS NOT NULL`;
    // For new jobs, the whereClause already includes date and search filters
    const newJobsCondition = whereClause; // Use the base whereClause

    // Fetch aggregated data in parallel using the combined conditions
    const [
      totalJobsResult,
      remoteJobsResult,
      avgSalaryResult,
      newJobsResult,
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM data_jobs ${whereClause}`, // Embed the fragment
      sql`SELECT COUNT(*) as count FROM data_jobs ${remoteJobsCondition}`,
      sql`SELECT AVG(salary_year_avg) as average FROM data_jobs ${avgSalaryCondition}`,
      sql`SELECT COUNT(*) as count FROM data_jobs ${newJobsCondition}` // Embed the fragment
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
