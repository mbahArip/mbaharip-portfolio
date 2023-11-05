import c from 'constant';
import { NextApiRequest, NextApiResponse } from 'next';
import { deleteBlog, getBlogById, updateBlog } from 'supabase/controller/Blogs.server';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { method } = request;
  const { id } = request.query;

  try {
    switch (method) {
      case 'GET':
        const blogsData = await getBlogById(id as string);
        response.setHeader(
          'Cache-Control',
          `public, s-maxage=${c.MAX_AGE}, max-age=${c.MAX_AGE}, stale-while-revalidate=${c.MAX_SWR}`,
        );
        return response.status(200).json(blogsData);
      case 'PUT':
        const newBlogPayload = request.body;
        const newBlogData = await updateBlog(request, id as string, newBlogPayload);
        return response.status(200).json(newBlogData);
      case 'DELETE':
        const deleteBlogRequest = await deleteBlog(request, id as string);
        return response.status(200).json(deleteBlogRequest);
      default:
        response.status(405).json({ message: 'Method not allowed' });
        break;
    }
  } catch (error: any) {
    console.log(error.code);
    return response.status(isNaN(error.code) ? 500 : error.code).json({ message: error.message });
  }
}
