import c from 'constant';
import { NextApiRequest, NextApiResponse } from 'next';
import { getProjectsSummary } from 'supabase/controller/Projects.server';

import { DbRow } from 'types/Supabase';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { method } = request;

  try {
    switch (method) {
      case 'GET':
        const { page, rowsPerPage, query, order, orderBy } = request.query;
        const stacks =
          typeof request.query['stacks[]'] === 'string' ? [request.query['stacks[]']] : request.query['stacks[]'] || [];
        const ids =
          typeof request.query['ids[]'] === 'string' ? [request.query['ids[]']] : request.query['ids[]'] || [];

        const projectsData = await getProjectsSummary({
          ids: ids || undefined,
          page: page ? Number(page) : undefined,
          rowsPerPage: rowsPerPage ? Number(rowsPerPage) : undefined,
          query: query as string,
          stacks: stacks || undefined,
          order: (order as 'asc' | 'desc') || undefined,
          orderBy: (orderBy as keyof DbRow<'projects'>) || undefined,
        });
        response.setHeader(
          'Cache-Control',
          `public, s-maxage=${c.MAX_AGE}, max-age=${c.MAX_AGE}, stale-while-revalidate=${c.MAX_SWR}`,
        );
        return response.status(200).json(projectsData);
      default:
        response.status(405).json({ message: 'Method not allowed' });
        break;
    }
  } catch (error: any) {
    return response.status(isNaN(error.code) ? 500 : error.code).json({ message: error.message });
  }
}
