import mime from 'mime-types';
import { NextApiRequest, NextApiResponse } from 'next';

import octokit from 'utils/octokit';

import { APIResponse } from 'types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }
  const { name }: Partial<{ name: string[] }> = req.query;

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: 'mbaharip',
      path: `@attachments/${name?.join('/')}`,
      repo: 'mbaharip-blog-posts',
    });

    if ((data as any).type !== 'file') {
      throw new Error('Path is not a file');
    }

    // Check if size is greater than vercel response limit
    if ((data as any).size > 1024 * 1024 * 4) {
      return res.status(307).redirect((data as any).download_url);
    }

    // file blob from base64
    const fileBlob = Buffer.from((data as any).content, 'base64');
    const fileType = (data as any).name.split('.').pop() as unknown as string;
    const contentType = mime.contentType(fileType);

    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.setHeader('Content-Length', (data as any).size);
    res.setHeader(
      'Content-Disposition',
      `inline; filename=${(data as any).name}`,
    );

    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
    );
    return res.status(200).send(fileBlob);
  } catch (error: any) {
    const payload: APIResponse = {
      status: error.status ?? error.code ?? 500,
      timestamp: Date.now(),
      error: {
        message: error.message,
        cause: error.cause ?? error.reason ?? 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    };

    return res.status(payload.status).json(payload);
  }
}
