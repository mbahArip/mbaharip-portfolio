import { NextApiRequest, NextApiResponse } from 'next';
import { getBlogs } from 'supabase/controller/Blogs.server';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { method } = request;

  try {
    switch (method) {
      case 'GET':
        const type = request.query.type || 'json';
        const { ids } = request.query;
        const availableTypes = ['json', 'csv'];
        if (!availableTypes.includes(type as string)) {
          return response.status(400).json({ message: 'Invalid type. Available: json, csv.' });
        }
        const blogsData = await getBlogs({
          page: 1,
          rowsPerPage: 99999,
          order: 'desc',
          orderBy: 'created_at',
          ids: ids ? (ids as string).split(',') : undefined,
        });

        if (type === 'csv') {
          const headers = `id,title,summary,is_featured,views,thumbnail_url,created_at,updated_at,tags`;
          const data = `${headers}\n${blogsData.data
            .map((blog) => {
              const tags = blog.tags.map((tag) => tag.name).join(':');
              return `${blog.id},"${blog.title}","${blog.summary}",${blog.is_featured},${blog.views},"${blog.thumbnail_url}",${blog.created_at},${blog.updated_at},"${tags}"`;
            })
            .join('\n')}`;
          response.setHeader('Content-Type', 'text/csv');
          // response.setHeader('Content-Disposition', 'attachment; filename=db-blogs.csv');
          response.setHeader('Cache-Control', 'no-cache');
          response.status(200).send(data);
        }

        response.setHeader('Content-Type', 'application/json');
        // response.setHeader('Content-Disposition', 'attachment; filename=db-blogs.json');
        response.setHeader('Cache-Control', 'no-cache');
        const data = JSON.stringify(blogsData.data, null, 2);
        return response.status(200).send(data);
      default:
        response.status(405).json({ message: 'Method not allowed' });
        break;
    }
  } catch (error: any) {
    return response.status(isNaN(error.code) ? 500 : error.code).json({ message: error.message });
  }
}
