import c from 'constant';
import { NextApiRequest, NextApiResponse } from 'next';
import { deleteProject, getProjectById, updateProject } from 'supabase/controller/Projects.server';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { method } = request;
  const { id } = request.query;

  try {
    switch (method) {
      case 'GET':
        const projectsData = await getProjectById(id as string);
        response.setHeader(
          'Cache-Control',
          `public, s-maxage=${c.MAX_AGE}, max-age=${c.MAX_AGE}, stale-while-revalidate=${c.MAX_SWR}`,
        );
        return response.status(200).json(projectsData);
      case 'PUT':
        const newProjectPayload = request.body;
        console.log(newProjectPayload);
        const newProjectData = await updateProject(request, id as string, newProjectPayload);
        return response.status(200).json(newProjectData);
      case 'DELETE':
        const deleteProjectRequest = await deleteProject(request, id as string);
        return response.status(200).json(deleteProjectRequest);
      default:
        response.status(405).json({ message: 'Method not allowed' });
        break;
    }
  } catch (error: any) {
    console.log(error.code);
    return response.status(isNaN(error.code) ? 500 : error.code).json({ message: error.message });
  }
}
