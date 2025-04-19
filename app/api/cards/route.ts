import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = 'force-dynamic'; // Ensure data is fetched fresh on each request

export async function GET() {
  try {
    // Fetch aggregated data in parallel
    const [
      totalJobsResult,
      remoteJobsResult,
      avgSalaryResult,
      newJobsResult,
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM data_jobs;`,
      sql`SELECT COUNT(*) as count FROM data_jobs WHERE job_work_from_home = TRUE;`,
      sql`SELECT AVG(salary_year_avg) as average FROM data_jobs WHERE salary_year_avg IS NOT NULL;`,
      sql`SELECT COUNT(*) as count FROM data_jobs WHERE job_posted_date >= NOW() - INTERVAL '7 days';`
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
        description: "Jobs posted in the last 7 days.",
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