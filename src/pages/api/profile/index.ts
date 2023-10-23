import { NextApiRequest, NextApiResponse } from 'next';

import octokit from 'utils/client/octokit';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { data } = await octokit.rest.users.getAuthenticated();
    return response.status(200).json(data);
  } catch (error: any) {
    const statusCode = isNaN(Number(error.status)) ? 500 : Number(error.status);
    return response.status(statusCode).json({ message: 'Error has been occurred', error: error.message });
  }
}
