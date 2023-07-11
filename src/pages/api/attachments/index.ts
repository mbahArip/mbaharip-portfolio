import { NextApiRequest, NextApiResponse } from 'next';

import octokit from 'utils/octokit';

import { APIResponse } from 'types/api';
import { Attachment } from 'types/attachment';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: 'mbaharip',
      path: '@attachments',
      repo: 'mbaharip-blog-posts',
    });

    if (!Array.isArray(data)) {
      throw new Error('Data is not a directory');
    }

    const attachments: Attachment[] = data
      .map((attachment) => {
        if (attachment.type !== 'file') return undefined;

        return {
          name: attachment.name,
          path: attachment.path,
          size: attachment.size,
          sha: attachment.sha,
          url: attachment.download_url,
        };
      })
      .filter((attachment) => attachment !== undefined) as Attachment[];

    const payload: APIResponse<Attachment[]> = {
      status: 200,
      timestamp: Date.now(),
      data: attachments,
    };

    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
    );
    return res.status(200).json(payload);
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
