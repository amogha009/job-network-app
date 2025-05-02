import { NextResponse, NextRequest } from "next/server";
import sql from "@/lib/db";
import { parseISO, isValid, startOfMonth, endOfMonth, addMonths, format } from 'date-fns';

export const dynamic = 'force-dynamic'; // Ensure data is fetched fresh on each request

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  const search = searchParams.get('search') || ''; // Get search param, default to empty string

  let queryStartDate: Date;
  let queryEndDate: Date;
  let responseRangeStart: Date;
  let responseRangeEnd: Date;

  if (startDateStr && endDateStr) {
    const parsedStart = parseISO(startDateStr);
    const parsedEnd = parseISO(endDateStr);

    if (isValid(parsedStart) && isValid(parsedEnd)) {
        queryStartDate = startOfMonth(parsedStart);
        queryEndDate = addMonths(endOfMonth(parsedEnd), 1);
        responseRangeStart = parsedStart;
        responseRangeEnd = parsedEnd;
    } else {
        console.warn("Invalid date range provided, falling back to default.");
        return await getDefaultChartData(search); // Pass search
    }
  } else {
    return await getDefaultChartData(search); // Pass search
  }

  try {
    // Add search condition
    const searchTerm = `%${search}%`;
    const searchCondition = search
      ? sql`AND (job_title ILIKE ${searchTerm} OR company_name ILIKE ${searchTerm})`
      : sql``; // Empty fragment if no search

    const result = await sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', job_posted_date), 'YYYY-MM-DD') as month,
        COUNT(*) as job_count
      FROM data_jobs
      WHERE job_posted_date >= ${format(queryStartDate, 'yyyy-MM-dd')}::date
        AND job_posted_date < ${format(queryEndDate, 'yyyy-MM-dd')}::date
        ${searchCondition} -- Add search condition here
      GROUP BY DATE_TRUNC('month', job_posted_date)
      ORDER BY month ASC;
    `;

    const chartData = result.map(row => ({
        date: row.month,
        jobs: parseInt(row.job_count, 10),
    }));

    const finalChartData = [];
    let currentCheckDate = new Date(queryStartDate);

    while (currentCheckDate < queryEndDate) {
        const monthString = format(currentCheckDate, 'yyyy-MM-dd');
        const existingEntry = chartData.find(entry => entry.date === monthString);

        finalChartData.push({
            date: monthString,
            jobs: existingEntry ? existingEntry.jobs : 0,
        });

        currentCheckDate.setMonth(currentCheckDate.getMonth() + 1);
    }

    return NextResponse.json({
        data: finalChartData,
        range: {
            start: responseRangeStart.toISOString(),
            end: responseRangeEnd.toISOString()
        }
    });

  } catch (error) {
    console.error('Failed to fetch chart data with range:', error);
    return NextResponse.json(
        { error: 'Failed to fetch chart data', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
    );
  }
}

// Update function signature to accept search
async function getDefaultChartData(search: string) {
     try {
        // Add search condition logic here too
        const searchTerm = `%${search}%`;
        const searchCondition = search
          ? sql`AND (job_title ILIKE ${searchTerm} OR company_name ILIKE ${searchTerm})`
          : sql``; // Empty fragment if no search

        const maxDateResult = await sql`SELECT MAX(job_posted_date) as max_date FROM data_jobs;`;
        const maxDbDate = maxDateResult[0]?.max_date ? new Date(maxDateResult[0].max_date) : new Date();

        const defaultStartDate = startOfMonth(addMonths(maxDbDate, -11));
        const defaultEndDate = addMonths(startOfMonth(maxDbDate), 1);
        const responseEndDate = maxDbDate;

        const result = await sql`
          SELECT
            TO_CHAR(DATE_TRUNC('month', job_posted_date), 'YYYY-MM-DD') as month,
            COUNT(*) as job_count
          FROM data_jobs
          WHERE job_posted_date >= ${format(defaultStartDate, 'yyyy-MM-dd')}::date
            AND job_posted_date < ${format(defaultEndDate, 'yyyy-MM-dd')}::date
            ${searchCondition} -- Add search condition here
          GROUP BY DATE_TRUNC('month', job_posted_date)
          ORDER BY month ASC;
        `;

        const chartData = result.map(row => ({
            date: row.month,
            jobs: parseInt(row.job_count, 10),
        }));

        const finalChartData = [];
        let currentCheckDate = new Date(defaultStartDate);
        while (currentCheckDate < defaultEndDate) {
            const monthString = format(currentCheckDate, 'yyyy-MM-dd');
            const existingEntry = chartData.find(entry => entry.date === monthString);
            finalChartData.push({
                date: monthString,
                jobs: existingEntry ? existingEntry.jobs : 0,
            });
            currentCheckDate.setMonth(currentCheckDate.getMonth() + 1);
        }

        return NextResponse.json({
            data: finalChartData,
            range: {
                start: defaultStartDate.toISOString(),
                end: responseEndDate.toISOString()
            }
        });
    } catch (error) {
        console.error('Failed to fetch default chart data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch default chart data', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
