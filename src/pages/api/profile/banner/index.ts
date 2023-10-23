import { NextApiRequest, NextApiResponse } from 'next';

import octokit from 'utils/client/octokit';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: 'mbaharip',
      path: 'img/banner.webp',
      repo: 'mbaharip',
    });
    const content = (data as any).content;
    if (!content) throw { status: 404, message: 'Not found' };

    const buffer = Buffer.from(content, 'base64');

    response.setHeader('Content-Type', 'image/webp');
    response.setHeader('Cache-Control', 'max-age=31536000, immutable');
    return response.status(200).send(buffer);
  } catch (error: any) {
    const statusCode = isNaN(Number(error.status)) ? 500 : Number(error.status);
    return response.status(statusCode).json({ message: 'Error has been occurred', error: error.message });
  }
}
