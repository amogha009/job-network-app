import { NextResponse, NextRequest } from "next/server";
import sql from "@/lib/db";
import { parseISO, isValid } from 'date-fns'; // Import date parsing functions

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search');
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  const location = searchParams.get('location'); // Get location filter
  const schedule = searchParams.get('schedule'); // Get schedule filter
  const minSalaryStr = searchParams.get('minSalary'); // Get min salary filter
  const maxSalaryStr = searchParams.get('maxSalary'); // Get max salary filter

  let startDate: Date | null = null;
  let endDate: Date | null = null;
  let dateFilterActive = false;

  if (startDateStr && endDateStr) {
    startDate = parseISO(startDateStr);
    endDate = parseISO(endDateStr);
    if (isValid(startDate) && isValid(endDate)) {
      dateFilterActive = true;
    } else {
      startDate = null; // Reset if dates are invalid
      endDate = null;
    }
  }

  if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
    return NextResponse.json({ error: 'Invalid page or limit parameter' }, { status: 400 });
  }

  const offset = (page - 1) * limit;

  // Base query conditions
  let conditions = sql`WHERE 1=1`; // Start with a true condition

  // Add search condition if search query exists
  if (search) {
    conditions = sql`${conditions} AND (job_title ILIKE ${'%' + search + '%'} OR company_name ILIKE ${'%' + search + '%'})`;
  }

  // Add date range condition if dates are valid
  if (dateFilterActive && startDate && endDate) {
    conditions = sql`${conditions} AND job_posted_date >= ${startDate.toISOString()}::date AND job_posted_date <= ${endDate.toISOString()}::date`;
  }

  // Add location condition if provided
  if (location) {
    conditions = sql`${conditions} AND job_location = ${location}`;
  }

  // Add schedule type condition if provided
  if (schedule) {
    conditions = sql`${conditions} AND job_schedule_type = ${schedule}`;
  }

  // Add salary range conditions if provided and valid
  const minSalary = minSalaryStr ? parseFloat(minSalaryStr) : null;
  const maxSalary = maxSalaryStr ? parseFloat(maxSalaryStr) : null;

  if (minSalary !== null && !isNaN(minSalary)) {
    conditions = sql`${conditions} AND salary_year_avg >= ${minSalary}`;
  }
  if (maxSalary !== null && !isNaN(maxSalary)) {
    conditions = sql`${conditions} AND salary_year_avg <= ${maxSalary}`;
  }


  try {
    // Apply conditions to data query
    const dataPromise = sql`
      SELECT *
      FROM data_jobs
      ${conditions}
      ORDER BY id -- Consider ordering by date or relevance if applicable
      LIMIT ${limit}
      OFFSET ${offset};
    `;

    // Apply conditions to count query
    const countPromise = sql`
      SELECT COUNT(*) as total_count
      FROM data_jobs
      ${conditions};
    `;

    const [data, countResult] = await Promise.all([dataPromise, countPromise]);
    const totalCount = parseInt(countResult[0].total_count, 10);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// GET
