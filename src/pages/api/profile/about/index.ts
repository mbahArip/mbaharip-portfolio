import c from 'constant';
import { NextApiRequest, NextApiResponse } from 'next';

import octokit from 'utils/client/octokit';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const about = await Get_ProfileAbout();

    response.setHeader(
      'Cache-Control',
      `public, s-maxage=${c.MAX_AGE}, max-age=${c.MAX_AGE}, stale-while-revalidate=${c.MAX_SWR}`,
    );
    return response.status(200).json({
      message: 'Success',
      data: about,
    });
  } catch (error: any) {
    const statusCode = isNaN(Number(error.status)) ? 500 : Number(error.status);
    return response.status(statusCode).json({ message: 'Error has been occurred', error: error.message });
  }
}

export async function Get_ProfileAbout() {
  const { data } = await octokit.rest.repos.getContent({
    owner: 'mbaharip',
    path: 'README.md',
    repo: 'mbaharip',
  });
  const contentB64 = (data as any).content;
  if (!contentB64) throw { status: 404, message: 'Not found' };

  const content = Buffer.from(contentB64, 'base64').toString('utf-8');
  const about = content.split('<!-- ABOUT:START -->\n')[1].split('\n<!-- ABOUT:END -->')[0].trim();

  const html = await octokit.rest.markdown.renderRaw({
    data: about,
  });

  return html.data;
}
