import c from 'constant';
import { NextApiRequest, NextApiResponse } from 'next';
import { CreateBlog, createBlog, deleteBlogs, getBlogs } from 'supabase/controller/Blogs.server';

import { DbRow } from 'types/Supabase';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { method } = request;

  try {
    switch (method) {
      case 'GET':
        const { page, rowsPerPage, query, order, orderBy } = request.query;
        const tags =
          typeof request.query['tags[]'] === 'string' ? [request.query['tags[]']] : request.query['tags[]'] || [];
        const qIds =
          typeof request.query['ids[]'] === 'string' ? [request.query['ids[]']] : request.query['ids[]'] || [];
        const blogsData = await getBlogs({
          ids: qIds || undefined,
          page: page ? Number(page) : undefined,
          rowsPerPage: rowsPerPage ? Number(rowsPerPage) : undefined,
          query: query as string,
          tags: tags || undefined,
          order: (order as 'asc' | 'desc') || undefined,
          orderBy: (orderBy as keyof DbRow<'blogs'>) || undefined,
        });
        response.setHeader(
          'Cache-Control',
          `public, s-maxage=${c.MAX_AGE}, max-age=${c.MAX_AGE}, stale-while-revalidate=${c.MAX_SWR}`,
        );
        return response.status(200).json(blogsData);
      case 'POST':
        const newBlogPayload = request.body as CreateBlog;
        const newBlogData = await createBlog(request, newBlogPayload);
        return response.status(201).json(newBlogData);
      case 'DELETE':
        const { ids } = request.body;
        const deleteBlogRequest = await deleteBlogs(request, ids);
        return response.status(200).json(deleteBlogRequest);
      default:
        response.status(405).json({ message: 'Method not allowed' });
        break;
    }
  } catch (error: any) {
    return response.status(isNaN(error.code) ? 500 : error.code).json({ message: error.message });
  }
}