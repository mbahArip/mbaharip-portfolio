import matter from 'gray-matter';
import { NextApiRequest, NextApiResponse } from 'next';

import octokit from 'utils/octokit';

import { APICache, APIResponse, Settings } from 'types/api';
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
      path: 'settings.md',
    })) as Partial<{ data: GithubFile }>;

    if (!data) {
      throw new Error('Data not found');
    }

    if (data?.type !== 'file') {
      throw new Error('Data is not a file');
    }

    const rawContent = Buffer.from(data.content, 'base64').toString('utf-8');
    const markdownData = matter(rawContent);

    let tags = [];
    if (Array.isArray(markdownData.data.tags) && markdownData.data.tags[0]) {
      tags = markdownData.data.tags;
    }

    const settings: Record<string, any> = {
      ...markdownData.data,
      tags,
    };

    // remove null or undefined values
    Object.keys(settings).forEach((key) => {
      if (settings[key] == null || settings[key].length === 0)
        delete settings[key];
    });

    const payload: APIResponse<Settings> = {
      status: 200,
      timestamp: Date.now(),
      data: settings as Settings,
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
