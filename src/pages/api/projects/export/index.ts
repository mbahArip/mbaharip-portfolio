import { NextApiRequest, NextApiResponse } from 'next';
import { getProjects } from 'supabase/controller/Projects.server';

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
        const projectsData = await getProjects({
          page: 1,
          rowsPerPage: 99999,
          order: 'desc',
          orderBy: 'created_at',
          ids: ids ? (ids as string).split(',') : undefined,
        });

        if (type === 'csv') {
          const headers = `id,title,summary,is_featured,views,thumbnail_url,created_at,updated_at,stacks`;
          const data = `${headers}\n${projectsData.data
            .map((project) => {
              const stacks = project.stacks.map((stack) => stack.name).join(':');
              return `${project.id},"${project.title}","${project.summary}",${project.is_featured},${project.views},"${project.thumbnail_url}",${project.created_at},${project.updated_at},"${stacks}"`;
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
        const data = JSON.stringify(projectsData.data, null, 2);
        return response.status(200).send(data);
      default:
        response.status(405).json({ message: 'Method not allowed' });
        break;
    }
  } catch (error: any) {
    return response.status(isNaN(error.code) ? 500 : error.code).json({ message: error.message });
  }
}
