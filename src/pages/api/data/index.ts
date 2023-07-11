import { NextApiRequest, NextApiResponse } from 'next';

import octokit from 'utils/octokit';

import { APICache, APIResponse } from 'types/api';
import { GithubFile } from 'types/github';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const { data } = (await octokit.rest.repos.getContent({
      owner: 'mbaharip',
      repo: 'mbaharip-blog-posts',
      path: '@db/data.md',
    })) as Partial<{ data: GithubFile }>;

    if (!data) {
      throw new Error('Data not found');
    }

    if (data?.type !== 'file') {
      throw new Error('Data is not a file');
    }

    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    // Parse key::value to object
    const parsedContent = content
      .split('\n')
      .map((line) => line.split('::'))
      .reduce((acc, [key, value]) => {
        if (!value) return acc;

        let parsedValue: string | string[] | boolean | number = value;
        if (value === 'true' || value === 'false') {
          parsedValue = JSON.parse(value);
        }
        if (value.includes(',')) {
          parsedValue = value.split(',');
        }
        acc[key] = parsedValue;
        return acc;
      }, {} as Record<string, string | string[] | boolean | number>);

    const payload: APIResponse<
      Record<string, string | string[] | boolean | number>
    > = {
      status: 200,
      timestamp: Date.now(),
      data: parsedContent,
    };

    res.setHeader('Cache-Control', APICache);
    return res.status(payload.status).json(payload);
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
