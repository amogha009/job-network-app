import { NextResponse, NextRequest } from "next/server";
import sql from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
    return NextResponse.json({ error: 'Invalid page or limit parameter' }, { status: 400 });
  }

  const offset = (page - 1) * limit;

  try {
    const dataPromise = sql`
      SELECT *
      FROM data_jobs
      ORDER BY id
      LIMIT ${limit}
      OFFSET ${offset};
    `;

    const countPromise = sql`
      SELECT COUNT(*) as total_count FROM data_jobs;
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